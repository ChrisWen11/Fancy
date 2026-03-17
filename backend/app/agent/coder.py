"""
Agent Phase 2: CODER
Generates code based on the plan. Writes files to the company's repo directory.
"""
import json
import os
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

CODE_PROMPT = """You are an expert full-stack developer building a micro-SaaS product.

Company: {name}
Description: {description}
Tech Stack: {tech_stack}
Task: {task_title}
Task Details: {task_description}

Generate the code needed to accomplish this task. Return a JSON object with files to create/update:
{{
    "files": [
        {{
            "path": "relative/path/to/file.ext",
            "content": "full file content here",
            "action": "create|update"
        }}
    ],
    "summary": "What was built/changed",
    "next_steps": ["Step 1", "Step 2"]
}}

Use modern best practices. For Next.js, use App Router. Include proper error handling.
Return ONLY the JSON, no markdown."""


async def generate_code(company, task: dict, repo_path: str) -> dict:
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{
                "role": "user",
                "content": CODE_PROMPT.format(
                    name=company.name,
                    description=company.description or "",
                    tech_stack=company.tech_stack,
                    task_title=task.get("title", "Build feature"),
                    task_description=task.get("description", ""),
                ),
            }],
            temperature=0.3,
            max_tokens=4000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        result = json.loads(content)

        # Write files to disk
        files_written = []
        for file_info in result.get("files", []):
            file_path = os.path.join(repo_path, file_info["path"])
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f:
                f.write(file_info["content"])
            files_written.append(file_info["path"])

        return {
            "files_written": files_written,
            "summary": result.get("summary", "Code generated"),
            "next_steps": result.get("next_steps", []),
        }
    except Exception as e:
        return {
            "files_written": [],
            "summary": f"Code generation failed: {str(e)}",
            "next_steps": ["Retry code generation"],
            "error": str(e),
        }
