from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app import models, schemas, queue as job_queue
from app.models import Task

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    filters = {
        "start_year": task.start_year,
        "end_year": task.end_year,
        "source_a_brands": task.source_a_brands,
        "source_b_brands": task.source_b_brands,
        "price_range": task.price_range.dict() if task.price_range else None,
        "location": task.location
    }
    db_task = Task(name=task.name, filters=filters)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    job_queue.task_queue.put(db_task.id)
    return db_task

@app.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.get("/tasks/{task_id}", response_model=dict)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"error": "Task not found"}
    records = [r for r in task.records]
    return {
        "id": task.id,
        "status": task.status,
        "filters": task.filters,
        "records": [
            {
                "company": r.company,
                "model": r.model,
                "date_of_sale": r.date_of_sale,
                "price": r.price,
                "location": r.location,
                "customer_type": r.customer_type,
            } for r in records
        ]
    }
