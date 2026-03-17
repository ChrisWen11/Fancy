"""
Agent Orchestrator
Coordinates the full autonomous cycle: Plan -> Code -> Deploy -> Market
"""
import os
import json
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company, CompanyStatus, AgentLog, AgentTask
from app.agent.planner import create_plan
from app.agent.coder import generate_code
from app.agent.deployer import deploy_company
from app.agent.marketer import create_marketing

REPOS_BASE = "/tmp/polsia-repos"


async def run_full_cycle(company: Company, db: AsyncSession, phases: list = None):
    """
    Run a full autonomous agent cycle for a company.
    Phases: plan -> code -> deploy -> market
    """
    if phases is None:
        phases = ["plan", "code", "deploy", "market"]

    repo_path = os.path.join(REPOS_BASE, f"company-{company.id}")
    os.makedirs(repo_path, exist_ok=True)

    cycle_number = await _get_next_cycle(company, db)
    results = {}

    # ---- PHASE 1: PLAN ----
    if "plan" in phases:
        await _log(db, company.id, cycle_number, "plan", "Starting planning phase...")
        plan = await create_plan(company)
        results["plan"] = plan

        # Create tasks from the plan
        for task_data in plan.get("tasks", []):
            task = AgentTask(
                company_id=company.id,
                task_type=task_data.get("type", "engineering"),
                title=task_data.get("title", "Task"),
                description=task_data.get("description", ""),
                status="pending",
            )
            db.add(task)

        # Update company status
        new_status = plan.get("next_status")
        if new_status and hasattr(CompanyStatus, new_status.upper()):
            company.status = CompanyStatus(new_status)

        await _log(db, company.id, cycle_number, "plan",
                    f"Plan created: {plan.get('summary', 'No summary')}",
                    json.dumps(plan))

    # ---- PHASE 2: CODE ----
    if "code" in phases:
        await _log(db, company.id, cycle_number, "code", "Starting coding phase...")
        engineering_tasks = [t for t in results.get("plan", {}).get("tasks", [])
                            if t.get("type") == "engineering"]

        for task in engineering_tasks[:3]:  # Limit to 3 tasks per cycle
            code_result = await generate_code(company, task, repo_path)
            results.setdefault("code", []).append(code_result)
            await _log(db, company.id, cycle_number, "code",
                        f"Generated code: {code_result.get('summary', '')}",
                        json.dumps(code_result))

    # ---- PHASE 3: DEPLOY ----
    if "deploy" in phases:
        await _log(db, company.id, cycle_number, "deploy", "Starting deployment phase...")
        deploy_result = await deploy_company(company, repo_path)
        results["deploy"] = deploy_result

        if deploy_result.get("success"):
            company.container_id = deploy_result.get("container_id")
            company.port = deploy_result.get("port")
            company.domain = deploy_result.get("domain")
            if company.status == CompanyStatus.BUILDING:
                company.status = CompanyStatus.DEPLOYED

        await _log(db, company.id, cycle_number, "deploy",
                    deploy_result.get("message", "Deployment attempted"),
                    json.dumps(deploy_result))

    # ---- PHASE 4: MARKET ----
    if "market" in phases:
        await _log(db, company.id, cycle_number, "market", "Starting marketing phase...")
        marketing_result = await create_marketing(company)
        results["market"] = marketing_result
        await _log(db, company.id, cycle_number, "market",
                    marketing_result.get("summary", "Marketing content generated"),
                    json.dumps(marketing_result))

    # Update cycle timestamp
    company.last_cycle_at = datetime.now(timezone.utc)
    await db.flush()

    return results


async def _log(db: AsyncSession, company_id: int, cycle: int, phase: str, message: str, details: str = None):
    log = AgentLog(
        company_id=company_id,
        cycle_number=cycle,
        phase=phase,
        message=message,
        details=details,
    )
    db.add(log)
    await db.flush()


async def _get_next_cycle(company: Company, db: AsyncSession) -> int:
    from sqlalchemy import select, func
    from app.models.company import AgentLog
    result = await db.execute(
        select(func.max(AgentLog.cycle_number)).where(AgentLog.company_id == company.id)
    )
    max_cycle = result.scalar() or 0
    return max_cycle + 1
