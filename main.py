from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

# Load your ML model and vectorizer
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

app = FastAPI()

# 🔥 CORS FIX HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://127.0.0.1:5500"] if using Live Server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    news: str

@app.post("/predict")
def predict_news(item: NewsRequest):
    X = vectorizer.transform([item.news])
    y = model.predict(X)[0]
    return {"prediction": "Fake" if y == 1 else "Real"}



