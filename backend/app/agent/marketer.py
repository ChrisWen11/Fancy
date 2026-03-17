"""
Agent Phase 4: MARKETER
Generates marketing content, SEO, social media posts, etc.
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

MARKETING_PROMPT = """You are an expert digital marketer for a micro-SaaS product.

Company: {name}
Description: {description}
Niche: {niche}
Target Audience: Based on the niche
Current Revenue: ${revenue}
Monthly Visitors: {visitors}

Generate marketing content for today's cycle. Return a JSON object:
{{
    "landing_page_copy": {{
        "headline": "Main headline",
        "subheadline": "Supporting text",
        "cta": "Call to action button text",
        "features": ["Feature 1", "Feature 2", "Feature 3"]
    }},
    "social_posts": [
        {{
            "platform": "twitter|linkedin|reddit",
            "content": "Post content"
        }}
    ],
    "seo": {{
        "title": "SEO title",
        "description": "Meta description",
        "keywords": ["keyword1", "keyword2"]
    }},
    "email_subject": "Subject line for outreach",
    "summary": "What marketing activities were completed"
}}

Return ONLY the JSON, no markdown."""


async def create_marketing(company) -> dict:
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{
                "role": "user",
                "content": MARKETING_PROMPT.format(
                    name=company.name,
                    description=company.description or "",
                    niche=company.niche or "general",
                    revenue=company.revenue,
                    visitors=company.monthly_visitors,
                ),
            }],
            temperature=0.8,
            max_tokens=1500,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(content)
    except Exception as e:
        return {
            "summary": f"Marketing generation failed: {str(e)}",
            "error": str(e),
        }
