from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class CompanyStatus(str, enum.Enum):
    IDEA = "idea"
    PLANNING = "planning"
    BUILDING = "building"
    DEPLOYED = "deployed"
    MARKETING = "marketing"
    ACTIVE = "active"
    PAUSED = "paused"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    niche = Column(String, nullable=True)
    status = Column(SQLEnum(CompanyStatus), default=CompanyStatus.IDEA)
    tech_stack = Column(String, default="nextjs,tailwind,postgres")
    domain = Column(String, nullable=True)
    container_id = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    revenue = Column(Float, default=0.0)
    monthly_visitors = Column(Integer, default=0)
    repo_path = Column(String, nullable=True)
    last_cycle_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="companies")
    agent_logs = relationship("AgentLog", back_populates="company")
    tasks = relationship("AgentTask", back_populates="company")


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    cycle_number = Column(Integer, default=1)
    phase = Column(String, nullable=False)  # plan, code, deploy, market, ops
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)  # JSON string of detailed actions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    company = relationship("Company", back_populates="agent_logs")


class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    task_type = Column(String, nullable=False)  # engineering, marketing, ops, support
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    company = relationship("Company", back_populates="tasks")
