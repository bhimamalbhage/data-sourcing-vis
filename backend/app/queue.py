import threading
import time
import queue
from app.database import SessionLocal
from app import models
from app.utils import fetch_and_store_data

task_queue = queue.Queue()

def worker():
    while True:
        task_id = task_queue.get()
        db = SessionLocal()
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if task:
            print(f"[{task.id}] Task is pending...")
            time.sleep(5)
            task.status = "in_progress"
            db.commit()

            time.sleep(5)  # simulate fetch delay
            fetch_and_store_data(task, db)  # to implement

            task.status = "completed"
            db.commit()
        task_queue.task_done()

threading.Thread(target=worker, daemon=True).start()
