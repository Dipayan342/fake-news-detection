from fastapi import FastAPI
import pickle

# Load saved model and vectorizer
with open("model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("vectorizer.pkl", "rb") as vec_file:
    vectorizer = pickle.load(vec_file)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Fake News Detection API is running!"}

@app.post("/predict/")
def predict(text: str):
    text_vector = vectorizer.transform([text])

    prediction = model.predict(text_vector)[0]

    return {"prediction": "FAKE" if prediction == 1 else "REAL"}


