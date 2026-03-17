import asyncio
from typing import Optional, List

from app.tasks.celery_app import celery


def _run_async(coro):
    """Helper to run async code in sync Celery tasks."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery.task(bind=True, name="app.tasks.celery_tasks.run_agent_cycle")
def run_agent_cycle(self, company_id: int, user_id: int, phases: Optional[List[str]] = None):
    """Run an agent cycle for a single company."""
    return _run_async(_run_cycle(company_id, user_id, phases))


async def _run_cycle(company_id: int, user_id: int, phases: Optional[List[str]] = None):
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from sqlalchemy import select
    from app.core.config import settings
    from app.models.user import User
    from app.models.company import Company
    from app.agent.orchestrator import run_full_cycle

    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        try:
            result = await db.execute(select(Company).where(Company.id == company_id))
            company = result.scalar_one_or_none()
            if not company:
                return {"error": f"Company {company_id} not found"}

            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()

            results = await run_full_cycle(company, db, phases)

            # Increment task usage
            if user:
                user.tasks_used += 1

            await db.commit()
            return {"success": True, "company_id": company_id, "results": str(results)}
        except Exception as e:
            await db.rollback()
            return {"error": str(e)}
    await engine.dispose()


@celery.task(name="app.tasks.celery_tasks.run_all_daily_cycles")
def run_all_daily_cycles():
    """Scheduled task: run cycles for all active companies."""
    return _run_async(_run_all_cycles())


async def _run_all_cycles():
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from sqlalchemy import select
    from app.core.config import settings
    from app.models.company import Company, CompanyStatus

    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        result = await db.execute(
            select(Company).where(Company.status.notin_([CompanyStatus.PAUSED, CompanyStatus.IDEA]))
        )
        companies = result.scalars().all()

        queued = 0
        for company in companies:
            run_agent_cycle.delay(company.id, company.owner_id)
            queued += 1

    await engine.dispose()
    return {"queued": queued}
