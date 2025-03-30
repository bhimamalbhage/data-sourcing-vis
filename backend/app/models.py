from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="pending")
    filters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    records = relationship("SalesRecord", back_populates="task")


class SalesRecord(Base):
    __tablename__ = "sales_records"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    company = Column(String)
    model = Column(String)
    date_of_sale = Column(String)
    price = Column(Float)

    task = relationship("Task", back_populates="records")
