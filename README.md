# data-sourcing-vis

A data sourcing and visualization web app for car sales analytics

## 🛠 Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, Python
- **Frontend**: React, Axios, D3.js
- **Others**: Threaded job queue, CSV + JSON data sources

## 📦 Features

- Create data tasks with filters (year, brand, price, location)
- Background data processing with status polling
- Interactive analytics:
  - 📈 Sales per year (line chart)
  - 📊 Total sales by brand (bar chart)
  - 🧁 Customer type share (pie chart)
  - 💸 Avg price per brand (bar chart)

## ▶️ Getting Started

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt  # or install FastAPI, SQLAlchemy manually
uvicorn main:app --reload 
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend: http://localhost:3000

API: http://localhost:8000

