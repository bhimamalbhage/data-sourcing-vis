from app import models
import json
import pandas as pd

def fetch_and_store_data(task, db):
    filters = task.filters
    start_year = filters["start_year"]
    end_year = filters["end_year"]
    source_a_brands = filters.get("source_a_brands", [])
    source_b_brands = filters.get("source_b_brands", [])
    price_range = filters.get("price_range", {})
    location_filter = filters.get("location")

    # Load Source A
    with open("data/source_a.json") as f:
        source_a = json.load(f)
    for row in source_a:
        year = int(row["sale_date"][:4])
        if not (start_year <= year <= end_year):
            continue
        if source_a_brands and row["company"] not in source_a_brands:
            continue
        if location_filter and location_filter.lower() not in row["location"].lower():
            continue
        if price_range:
            if price_range.get("min") and row["price"] < price_range["min"]:
                continue
            if price_range.get("max") and row["price"] > price_range["max"]:
                continue

        db.add(models.SalesRecord(
            task_id=task.id,
            company=row["company"],
            model=row["car_model"],
            date_of_sale=row["sale_date"],
            price=row["price"],
            location=row.get("location", ""),
            customer_type=row.get("customer_type", ""),
            source="A"
        ))

    # Load Source B
    import pandas as pd
    df_b = pd.read_csv("data/source_b.csv").to_dict(orient="records")
    for row in df_b:
        year = int(row["sale_date"][:4])
        if not (start_year <= year <= end_year):
            continue
        if source_b_brands and row["company"] not in source_b_brands:
            continue
        if location_filter and location_filter.lower() not in row["location"].lower():
            continue
        if price_range:
            if price_range.get("min") and row["price"] < price_range["min"]:
                continue
            if price_range.get("max") and row["price"] > price_range["max"]:
                continue

        db.add(models.SalesRecord(
            task_id=task.id,
            company=row["company"],
            model=row["car_model"],
            date_of_sale=row["sale_date"],
            price=row["price"],
            location=row.get("location", ""),
            customer_type=row.get("customer_type", ""),
            source="B"
        ))

    db.commit()

