import json
from pathlib import Path

from fastapi import APIRouter, Query

from app.analysis import main as run_analysis

router = APIRouter(prefix="/api", tags=["sentiment"])


def _load_json_topic_file(file_name):
    # Prefer current working directory output, with a safe module-dir fallback.
    candidate_paths = [
        Path.cwd() / file_name,
        Path(__file__).resolve().parent / file_name,
    ]
    for path in candidate_paths:
        if path.exists():
            with path.open("r", encoding="utf-8") as file:
                return json.load(file)
    return None


@router.post("/analyze/")
def analyze_topic(topic: str = Query(None)):
    result = run_analysis(topic)
    return {"result": result}


@router.get("/newsdata/")
def get_newsdata(topic: str = Query(None)):
    data = _load_json_topic_file("newsdata.json")
    if not data or data.get("topic") != topic:
        return {"status": "not ready", "newsdata": None}
    return {"status": "ready", "newsdata": data}


@router.get("/redditData/")
def get_redditdata(topic: str = Query(None)):
    data = _load_json_topic_file("redditdata.json")
    if not data or data.get("topic") != topic:
        return {"status": "not ready", "redditdata": None}
    return {"status": "ready", "redditdata": data}