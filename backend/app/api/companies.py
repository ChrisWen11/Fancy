from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company, CompanyStatus, AgentLog, AgentTask
from app.api.schemas import (
    CompanyCreate, CompanyUpdate, CompanyResponse,
    AgentLogResponse, AgentTaskResponse, DashboardStats,
)

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=List[CompanyResponse])
async def list_companies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_id == current_user.id).order_by(Company.created_at.desc())
    )
    return [CompanyResponse.model_validate(c) for c in result.scalars().all()]


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = Company(
        owner_id=current_user.id,
        name=data.name,
        description=data.description,
        niche=data.niche,
        tech_stack=data.tech_stack or "nextjs,tailwind,postgres",
    )
    db.add(company)
    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyResponse.model_validate(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)

    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.delete(company)


@router.get("/{company_id}/logs", response_model=List[AgentLogResponse])
async def get_company_logs(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify ownership
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    logs = await db.execute(
        select(AgentLog).where(AgentLog.company_id == company_id).order_by(AgentLog.created_at.desc()).limit(100)
    )
    return [AgentLogResponse.model_validate(l) for l in logs.scalars().all()]


@router.get("/{company_id}/tasks", response_model=List[AgentTaskResponse])
async def get_company_tasks(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    tasks = await db.execute(
        select(AgentTask).where(AgentTask.company_id == company_id).order_by(AgentTask.created_at.desc()).limit(50)
    )
    return [AgentTaskResponse.model_validate(t) for t in tasks.scalars().all()]


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    companies = await db.execute(
        select(Company).where(Company.owner_id == current_user.id)
    )
    all_companies = companies.scalars().all()

    active = [c for c in all_companies if c.status in (CompanyStatus.ACTIVE, CompanyStatus.DEPLOYED, CompanyStatus.MARKETING)]
    total_rev = sum(c.revenue for c in all_companies)

    tasks_result = await db.execute(
        select(func.count(AgentTask.id)).where(
            AgentTask.company_id.in_([c.id for c in all_companies]),
            AgentTask.status == "completed",
        )
    )
    tasks_completed = tasks_result.scalar() or 0

    max_tasks = settings_max_tasks(current_user)

    return DashboardStats(
        total_companies=len(all_companies),
        active_companies=len(active),
        total_revenue=total_rev,
        tasks_completed=tasks_completed,
        tasks_remaining=max(0, max_tasks - current_user.tasks_used),
    )


def settings_max_tasks(user: User) -> int:
    from app.core.config import settings
    return settings.MAX_TASKS_PAID if user.is_paid else settings.MAX_TASKS_FREE
