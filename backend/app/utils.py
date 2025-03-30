from app import models
import json
import pandas as pd

def fetch_and_store_data(task, db):
    filters = task.filters
    start_year = filters["start_year"]
    end_year = filters["end_year"]
    brands = filters.get("brands", [])

    # Load Source A (JSON)
    with open("data/source_a.json") as f:
        data_a = json.load(f)

    # Load Source B (CSV)
    df_b = pd.read_csv("data/source_b.csv").to_dict(orient="records")

    combined = data_a + df_b

    for row in combined:
        year = int(row["date_of_sale"][:4])
        if start_year <= year <= end_year and (not brands or row["company"] in brands):
            record = models.SalesRecord(
                task_id=task.id,
                company=row["company"],
                model=row["model"],
                date_of_sale=row["date_of_sale"],
                price=float(row["price"]),
            )
            db.add(record)
    db.commit()
