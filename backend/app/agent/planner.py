"""
Agent Phase 1: PLANNER
Analyzes the company state and creates a plan for the current cycle.
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

PLAN_PROMPT = """You are an autonomous AI product manager for a micro-SaaS company.

Company: {name}
Description: {description}
Niche: {niche}
Current Status: {status}
Tech Stack: {tech_stack}
Revenue: ${revenue}
Monthly Visitors: {visitors}

Based on the current state, create an actionable plan for today's cycle.
Focus on what will move the needle most. Consider:
- If IDEA status: plan the MVP features and architecture
- If PLANNING: define the code structure and key files to generate
- If BUILDING: identify the next features to build or bugs to fix
- If DEPLOYED: plan marketing activities and content
- If ACTIVE: plan optimizations, new features, or growth experiments

Return a JSON object:
{{
    "phase_focus": "engineering|marketing|ops",
    "summary": "One line summary of today's plan",
    "tasks": [
        {{
            "type": "engineering|marketing|ops|support",
            "title": "Short task title",
            "description": "What specifically to do",
            "priority": 1
        }}
    ],
    "next_status": "idea|planning|building|deployed|marketing|active"
}}

Return ONLY the JSON, no markdown."""


async def create_plan(company) -> dict:
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{
                "role": "user",
                "content": PLAN_PROMPT.format(
                    name=company.name,
                    description=company.description or "No description yet",
                    niche=company.niche or "general",
                    status=company.status,
                    tech_stack=company.tech_stack,
                    revenue=company.revenue,
                    visitors=company.monthly_visitors,
                ),
            }],
            temperature=0.7,
            max_tokens=1000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(content)
    except Exception as e:
        return {
            "phase_focus": "engineering",
            "summary": f"Default plan: continue building {company.name}",
            "tasks": [
                {
                    "type": "engineering",
                    "title": "Continue development",
                    "description": f"Continue building features for {company.name}",
                    "priority": 1,
                }
            ],
            "next_status": "building",
        }
