from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.api.schemas import RunCycleRequest, IdeaSuggestion
from app.services.idea_generator import generate_idea
from app.tasks.celery_tasks import run_agent_cycle

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/suggest-idea", response_model=IdeaSuggestion)
async def suggest_idea(
    niche: str = None,
    current_user: User = Depends(get_current_user),
):
    """Use AI to suggest a business idea."""
    idea = await generate_idea(niche)
    return idea


@router.post("/run-cycle")
async def trigger_cycle(
    req: RunCycleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger an agent cycle for a company."""
    result = await db.execute(
        select(Company).where(Company.id == req.company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Check task limits
    from app.core.config import settings
    max_tasks = settings.MAX_TASKS_PAID if current_user.is_paid else settings.MAX_TASKS_FREE
    if current_user.tasks_used >= max_tasks:
        raise HTTPException(status_code=402, detail="Task limit reached. Upgrade to continue.")

    # Queue the cycle
    task = run_agent_cycle.delay(company.id, current_user.id, req.phases)
    return {"message": "Agent cycle queued", "task_id": task.id, "company_id": company.id}


@router.post("/run-all")
async def trigger_all_cycles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger agent cycles for all active companies."""
    result = await db.execute(
        select(Company).where(Company.owner_id == current_user.id, Company.status != "paused")
    )
    companies = result.scalars().all()

    queued = []
    for company in companies:
        task = run_agent_cycle.delay(company.id, current_user.id)
        queued.append({"company_id": company.id, "task_id": task.id})

    return {"message": f"Queued {len(queued)} cycles", "tasks": queued}
