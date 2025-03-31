from pydantic import BaseModel
from typing import List, Optional, Dict, Union

class PriceRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None

class TaskCreate(BaseModel):
    name: str
    start_year: int
    end_year: int
    source_a_brands: Optional[List[str]] = []
    source_b_brands: Optional[List[str]] = []
    price_range: Optional[PriceRange] = None
    location: Optional[str] = None
    
class TaskOut(BaseModel):
    id: int
    name: str
    status: str
    filters: Dict
    class Config:
        orm_mode = True

class SalesRecordOut(BaseModel):
    company: str
    car_model: str
    sale_date: str
    price: float
    location: str
    customer_type: str
    source: str 

    class Config:
        orm_mode = True
