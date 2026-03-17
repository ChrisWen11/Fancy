import json
from typing import Optional
from openai import AsyncOpenAI

from app.core.config import settings
from app.api.schemas import IdeaSuggestion

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

IDEA_PROMPT = """You are an expert startup advisor. Generate a unique, viable micro-SaaS business idea.
{niche_context}

Return a JSON object with these exact fields:
- name: A catchy product name (2-3 words)
- description: What the product does (1-2 sentences)
- niche: The market niche (e.g., "developer tools", "health & fitness")
- target_audience: Who would use this (1 sentence)
- monetization: How it makes money (e.g., "freemium with $9/mo pro plan")
- tech_stack: Recommended tech stack as comma-separated string

Return ONLY the JSON object, no markdown or extra text."""


async def generate_idea(niche: Optional[str] = None) -> IdeaSuggestion:
    niche_context = f"Focus on the '{niche}' niche." if niche else "Pick any promising niche."

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": IDEA_PROMPT.format(niche_context=niche_context)}],
            temperature=0.9,
            max_tokens=500,
        )
        content = response.choices[0].message.content.strip()
        # Strip markdown code blocks if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        data = json.loads(content)
        return IdeaSuggestion(**data)
    except Exception as e:
        # Fallback idea if AI fails
        return IdeaSuggestion(
            name="TaskFlow Pro",
            description="A lightweight project management tool for freelancers with AI-powered task prioritization.",
            niche=niche or "productivity",
            target_audience="Freelancers and solo entrepreneurs who need simple project management.",
            monetization="Freemium with $12/mo pro plan for AI features and unlimited projects.",
            tech_stack="nextjs,tailwind,postgres,openai",
        )
