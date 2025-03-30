from pydantic import BaseModel
from typing import List, Optional, Dict

class TaskCreate(BaseModel):
    name: str
    start_year: int
    end_year: int
    brands: Optional[List[str]] = []

class TaskOut(BaseModel):
    id: int
    name: str
    status: str
    filters: Dict
    class Config:
        orm_mode = True

class SalesRecordOut(BaseModel):
    company: str
    model: str
    date_of_sale: str
    price: float
    class Config:
        orm_mode = True
