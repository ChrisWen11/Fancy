from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_paid: bool
    tasks_used: int
    total_revenue: float
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---- Company ----
class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    niche: Optional[str] = None
    tech_stack: Optional[str] = "nextjs,tailwind,postgres"


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = None
    status: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str]
    niche: Optional[str]
    status: str
    tech_stack: str
    domain: Optional[str]
    port: Optional[int]
    revenue: float
    monthly_visitors: int
    last_cycle_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Agent ----
class AgentLogResponse(BaseModel):
    id: int
    company_id: int
    cycle_number: int
    phase: str
    message: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AgentTaskResponse(BaseModel):
    id: int
    company_id: int
    task_type: str
    title: str
    description: Optional[str]
    status: str
    result: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class RunCycleRequest(BaseModel):
    company_id: int
    phases: Optional[List[str]] = None  # e.g., ["plan", "code", "deploy"]


class IdeaSuggestion(BaseModel):
    name: str
    description: str
    niche: str
    target_audience: str
    monetization: str
    tech_stack: str


# ---- Dashboard ----
class DashboardStats(BaseModel):
    total_companies: int
    active_companies: int
    total_revenue: float
    tasks_completed: int
    tasks_remaining: int
