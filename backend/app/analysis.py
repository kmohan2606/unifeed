import concurrent.futures
import json
import os
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from google import genai

load_dotenv()

MODEL = "gemini-2.5-flash"
REQUEST_TIMEOUT_SECONDS = 12
HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/116.0.0.0 Safari/537.36"
    )
}


def _write_json(file_name, payload):
    Path(file_name).write_text(json.dumps(payload, indent=4), encoding="utf-8")


def _safe_text(value, fallback):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return fallback


def _model_response(prompt):
    api_key = os.getenv("geminiapikey")
    if not api_key:
        raise RuntimeError("Missing geminiapikey environment variable")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return _safe_text(getattr(response, "text", None), "Model returned an empty response")


def analyze_sentiment_articles(text):
    prompt = (
        "Assuming both sentiments have properly generated, analyze the sentiment of the following "
        "collection of article snippets. Respond with 'positive', 'negative', or 'neutral'. Then "
        "respond with a concise summary. If one source sentiment failed, mention that and continue "
        "without bias.\n"
        f"{text}"
    )
    try:
        return _model_response(prompt)
    except Exception as exc:
        return f"Sentiment analysis failed due to an error: {exc}"


def analyze_sentiment_discussions(text):
    prompt = (
        "Analyze the sentiment of the following collection of forum snippets. Respond with "
        "'positive', 'negative', or 'neutral', then provide a concise summary.\n"
        f"{text}"
    )
    try:
        return _model_response(prompt)
    except Exception as exc:
        return f"Sentiment analysis failed due to an error: {exc}"


def analyze_sentiment_combined(text):
    prompt = (
        "Compare article sentiment and forum sentiment for a prediction-market perspective. "
        "Highlight agreement/divergence and keep it within 60 words.\n"
        f"{text}"
    )
    try:
        return _model_response(prompt)
    except Exception as exc:
        return f"Combined sentiment analysis failed due to an error: {exc}"


def brave_search_discussions(topic):
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": os.getenv("braveapikey"),
    }
    params = {"q": topic, "result_filter": "discussions"}
    response = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers=headers,
        params=params,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    data = response.json()
    data["discussions"] = data.get("discussions", {})
    data["discussions"]["results"] = data.get("discussions", {}).get("results", [])[:5]
    data["topic"] = topic
    _write_json("redditdata.json", data)

    snippets = []
    for discussion in data.get("discussions", {}).get("results", []):
        snippets.append(
            f"Title: {discussion.get('title', '')}\n"
            f"Description/Top Comment: {discussion.get('description', '')}\n"
        )
    aggregated_text = "\n".join(snippets).strip()
    if not aggregated_text:
        return f"No discussions could be retrieved for the topic {topic}"
    return analyze_sentiment_discussions(aggregated_text)


def newsdataio_search_news(topic):
    params = {
        "apikey": os.getenv("newsapikey"),
        "qintitle": topic,
        "size": 10,
        "language": "en",
        "removeduplicate": 1,
    }
    response = requests.get(
        "https://newsdata.io/api/1/latest",
        params=params,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    newsdata = response.json()
    newsdata["topic"] = topic
    _write_json("newsdata.json", newsdata)

    article_chunks = []
    for article in newsdata.get("results", []):
        if len(article_chunks) >= 4:
            break
        link = article.get("link")
        if not link:
            continue
        article_response = requests.get(link, headers=HTTP_HEADERS, timeout=REQUEST_TIMEOUT_SECONDS)
        if article_response.status_code != 200:
            continue
        soup = BeautifulSoup(article_response.content, "html.parser")
        paragraphs = soup.find_all("p")
        text = "\n".join(p.get_text() for p in paragraphs)[:700].strip()
        if text:
            article_chunks.append(text)

    aggregated_text = "\n\n".join(article_chunks).strip()
    if not aggregated_text:
        return f"No articles could be retrieved for the topic {topic}"
    return analyze_sentiment_articles(aggregated_text)


def analyze_market_sentiment(topic, market_id=None):
    result = {
        "marketId": market_id,
        "topic": topic,
        "status": "ready",
        "newsSentimentText": "",
        "discussionSentimentText": "",
        "combinedSentimentText": "",
        "error": None,
    }

    try:
        for file_name in ("redditdata.json", "newsdata.json"):
            if os.path.exists(file_name):
                os.remove(file_name)

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            brave_future = executor.submit(brave_search_discussions, topic)
            news_future = executor.submit(newsdataio_search_news, topic)
            discussion_text = brave_future.result(timeout=30)
            news_text = news_future.result(timeout=30)

        combined_text = analyze_sentiment_combined(
            f"Online Discussion Sentiment Analysis: {discussion_text}\n\n"
            f"News Article Sentiment Analysis: {news_text}"
        )

        result["discussionSentimentText"] = _safe_text(discussion_text, "No discussion sentiment available")
        result["newsSentimentText"] = _safe_text(news_text, "No news sentiment available")
        result["combinedSentimentText"] = _safe_text(combined_text, "No combined sentiment available")
        return result
    except Exception as exc:
        result["status"] = "unavailable"
        result["error"] = str(exc)
        result["newsSentimentText"] = "Sentiment currently unavailable."
        result["discussionSentimentText"] = "Sentiment currently unavailable."
        result["combinedSentimentText"] = "Sentiment currently unavailable."
        return result


def main(topic):
    payload = analyze_market_sentiment(topic=topic)
    return payload.get("combinedSentimentText", "Sentiment currently unavailable.")


if __name__ == "__main__":
    print(main("Donald Trump"))
