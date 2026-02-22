import requests
from dotenv import load_dotenv
import os
from bs4 import BeautifulSoup
import json
from google import genai
import concurrent.futures
import re
import spacy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

NEWSDATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "newsdata.json"))
REDDITDATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "redditdata.json"))

client = genai.Client(api_key=os.getenv("geminiapikey"))
model = "gemini-2.5-flash"

nlp = spacy.load("en_core_web_sm")


def extract_search_query(topic: str) -> str:
    """Use Gemini to extract the most important and relevant proper noun/topic from the input."""
    prompt = (
        "Given the following market topic, extract the single most important and relevant proper noun or topic "
        "for news and discussion search. Respond with only the keyword or phrase, no extra text.\n\n"
        f"Market topic: {topic}"
    )
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        keyword = response.text.strip()
        print(f"[Gemini Search Query] '{topic}' → '{keyword}'")
        return keyword
    except Exception as e:
        print(f"Gemini extraction failed: {e}")
        return topic


def analyze_sentiment_articles(text):
    prompt = f"Assuming both sentiments have properly generated, analyze the sentiment of the following collection \
        of article snippets. Respond with 'positive', 'negative', \
            or 'neutral'. Then, respond with a summary of the \
                contents and the sentiment. If one sentiment hasn't generated, just mention how one sentiment failed due to server issues and relay what you said for the other sentiment.\
                    Respond without bias.:\n{text}"
    try:
        print("Analyzing sentiment of articles...")
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        print("Sentiment analysis of articles completed.")
        return response.text
    except Exception as e:
        return f"Sentiment analysis of articles failed due to an error: {e}"


def analyze_sentiment_discussions(text):
    prompt = f"Analyze the sentiment of the following collection of forum snippets. Respond with 'positive', 'negative', or 'neutral'. Then, respond with a summary of the contents and the sentiment.:\n{text}"
    try:
        print("Analyzing sentiment of discussions...")
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        print("Sentiment analysis of discussions completed.")
        return response.text
    except Exception as e:
        return f"Sentiment analysis of discussions failed due to an error: {e}"


def analyze_sentiment_combined(text):
    prompt = f"Discuss how the sentiment you analyzed from recent \
        news articles compares to the sentiment you analyzed from \
            recent online discussions. Are they similar or \
                different? Think from a divergence analysis \
                    perspective as if you are analyzing a \
                        prediction market centered around the \
                            topic. Limit your output to 60 words.:\n{text}"
    try:
        print("Analyzing combined sentiment...")
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        print("Combined sentiment analysis completed.")
        return response.text
    except Exception as e:
        return f"Combined sentiment analysis failed due to an error: {e}"


def brave_search_discussions(topic, original_topic=None):
    no_of_discussions = 5
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": os.getenv("braveapikey")
    }

    params = {
        "q": extract_search_query(topic),
        "result_filter": "discussions"
    }
    print("Searching for online discussions...")
    response = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers=headers,
        params=params,
    )

    data = response.json()
    discussions = data.get('discussions')
    if discussions and discussions.get('results'):
        data['discussions']['results'] = discussions['results'][:no_of_discussions]
    else:
        data['discussions'] = {'results': []}
    data['topic'] = original_topic if original_topic else topic

    with open(REDDITDATA_PATH, "w") as f:
        json.dump(data, f, indent=4)
    #print(data)

    aggregated_discussion_text = ""
    for discussion in data.get("discussions", {}).get("results", []):
        aggregated_discussion_text += f'Title: {discussion.get("title")}\n\n'
        aggregated_discussion_text += f'Description/Top Comment: {discussion.get("description", "")}\n\n'

    response = None
    if aggregated_discussion_text == "":
        response = f"No discussions could be retrieved for the topic {topic}"
    else:
        response = analyze_sentiment_discussions(aggregated_discussion_text)
    return response


def newsdataio_search_news(topic, original_topic=None):
    number_of_articles = 4
    number_of_characters_per_article = 700
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
    )
    newsdata = response.json()
    newsdata['topic'] = original_topic if original_topic else topic

    with open(NEWSDATA_PATH, "w") as f:
        json.dump(newsdata, f, indent=4)

    with open(NEWSDATA_PATH, "r") as f:
        newsdata = json.load(f)
    article_text_aggregated = ""
    article_count = 0
    print("extracting articles")
    for article in newsdata.get("results", []):
        response = requests.get(article.get("link"),
                                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'}
                                )
        if response.status_code == 200 and article_count < number_of_articles:
            article_count += 1
            soup = BeautifulSoup(response.content, "html.parser")
            paragraphs = soup.find_all("p")
            article_text = "\n".join(p.get_text() for p in paragraphs)[:number_of_characters_per_article]
            article_text_aggregated += article_text + "\n\n"
        elif article_count >= number_of_articles:
            break
        else:
            print(response)

    #print(article_text_aggregated)
    response = ""
    if article_text_aggregated == "":
        response = f"No articles could be retrieved for the topic {topic}"
    else:
        response = analyze_sentiment_articles(article_text_aggregated)
    return response


def main(topic):
    original_topic = topic
    search_query = extract_search_query(topic)
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        brave_future = executor.submit(brave_search_discussions, search_query, original_topic)
        news_future = executor.submit(newsdataio_search_news, search_query, original_topic)
    brave_response = brave_future.result()
    news_response = news_future.result()
    combined = analyze_sentiment_combined(
        f"Online Discussion Sentiment Analysis: {brave_response}\n\nNews Article Sentiment Analysis: {news_response}"
    )
    print(f'\n\nCombined analysis: {combined}')
    return combined


if __name__ == "__main__":
    topic = "When will Cluely officially announce an IPO?"
    #brave_search_discussions(extract_search_query(topic))
    #newsdataio_search_news(topic)
    #main(topic)
    extract_search_query(topic)