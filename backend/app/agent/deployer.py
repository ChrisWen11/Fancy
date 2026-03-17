"""
Agent Phase 3: DEPLOYER
Builds and deploys the company's code using Docker.
"""
import os
import json
from typing import Optional

DOCKERFILE_TEMPLATE = """FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
"""


async def deploy_company(company, repo_path: str) -> dict:
    """
    Deploy the company's code.
    In the MVP, this creates a Dockerfile and simulates deployment.
    In production, this would use Docker SDK to build and run containers.
    """
    try:
        # Ensure Dockerfile exists
        dockerfile_path = os.path.join(repo_path, "Dockerfile")
        if not os.path.exists(dockerfile_path):
            with open(dockerfile_path, "w") as f:
                f.write(DOCKERFILE_TEMPLATE)

        # In a real deployment, we'd use the Docker SDK:
        # import docker
        # client = docker.from_env()
        # image, logs = client.images.build(path=repo_path, tag=f"polsia-{company.id}")
        # container = client.containers.run(image.id, detach=True, ports={'3000/tcp': None})

        # For MVP, simulate deployment
        port = 3000 + company.id
        domain = f"company-{company.id}.localhost"

        return {
            "success": True,
            "port": port,
            "domain": domain,
            "container_id": f"sim-container-{company.id}",
            "message": f"Deployed {company.name} at {domain}:{port}",
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Deployment failed: {str(e)}",
        }


async def check_health(company) -> dict:
    """Check if a deployed company's service is healthy."""
    if not company.container_id:
        return {"healthy": False, "message": "Not deployed"}

    # In production, would ping the container health endpoint
    return {
        "healthy": True,
        "message": f"Service running on port {company.port}",
        "uptime": "simulated",
    }
