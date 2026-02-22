from fastapi import FastAPI, Query
from pydantic import BaseModel
import json
from analysis import main
import os

app = FastAPI()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
NEWSDATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "newsdata.json"))
REDDITDATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "redditdata.json"))

@app.post("/analyze/")
def analyze_topic(topic: str = Query(...)):
    result = main(topic)
    return {"result": result}

@app.get("/newsdata/")
def get_newsdata(topic: str = Query(...)):
    try:
        with open(NEWSDATA_PATH, "r") as f:
            data = json.load(f)
            if data.get('topic') != topic:
                return{"status": "not ready", "newsdata": None}
        return {"status": "ready", "newsdata": data}
    except FileNotFoundError:
        return {"status": "not ready", "newsdata": None}

@app.get("/redditData/")
def get_redditdata(topic: str = Query(...)):
    try:
        with open(REDDITDATA_PATH, "r") as f:
            data = json.load(f)
            if data.get('topic') != topic:
                return{"status": "not ready", "redditdata": None}
        return {"status": "ready", "redditdata": data}
    except FileNotFoundError:
        return {"status": "not ready", "redditdata": None}