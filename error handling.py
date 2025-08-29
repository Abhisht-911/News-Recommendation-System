import requests
from datetime import datetime
from time import sleep

# Retry function
def fetch_with_retry(url, retries=3, delay=5):
    for attempt in range(retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            sleep(delay)
    print("All attempts failed.")
    return None

# Function to fetch news from NewsAPI
def fetch_newsapi(api_key):
    url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"
    data = fetch_with_retry(url)
    if not data:
        print("Failed to fetch data from NewsAPI.")
        return []
    articles = data.get("articles", [])
    return [
        {
            "source": "NewsAPI",
            "title": article.get("title"),
            "author": article.get("author"),
            "description": article.get("description"),
            "url": article.get("url"),
            "image_url": article.get("urlToImage"),
            "published_at": article.get("publishedAt"),
            "content": article.get("content"),
        }
        for article in articles
    ]

# Function to fetch news from MediastackAPI
def fetch_mediastack(api_key):
    url = f"http://api.mediastack.com/v1/news?access_key={api_key}&countries=us"
    data = fetch_with_retry(url)
    if not data:
        print("Failed to fetch data from MediastackAPI.")
        return []
    articles = data.get("data", [])
    return [
        {
            "source": "MediastackAPI",
            "title": article.get("title"),
            "author": article.get("author"),
            "description": article.get("description"),
            "url": article.get("url"),
            "image_url": article.get("image"),
            "published_at": article.get("published_at"),
            "content": None,  # MediastackAPI doesn't provide content
        }
        for article in articles
    ]

# Function to fetch news from AdditionalAPI
def fetch_additional_api(api_key):
    url = f"https://additionalapi.example.com/news?api_key={api_key}"
    data = fetch_with_retry(url)
    if not data:
        print("Failed to fetch data from AdditionalAPI.")
        return []
    articles = data.get("articles", [])
    return [
        {
            "source": "AdditionalAPI",
            "title": article.get("headline"),
            "author": article.get("writer"),
            "description": article.get("summary"),
            "url": article.get("link"),
            "image_url": article.get("image"),
            "published_at": article.get("date_published"),
            "content": article.get("body"),
        }
        for article in articles
    ]

# Unified function to fetch and normalize news
def fetch_all_news(newsapi_key, mediastack_key, additionalapi_key):
    newsapi_articles = fetch_newsapi(newsapi_key)
    mediastack_articles = fetch_mediastack(mediastack_key)
    additionalapi_articles = fetch_additional_api(additionalapi_key)

    all_articles = newsapi_articles + mediastack_articles + additionalapi_articles

    # Sort by published date
    for article in all_articles:
        if article["published_at"]:
            article["published_at"] = datetime.fromisoformat(article["published_at"]).isoformat()

    sorted_articles = sorted(all_articles, key=lambda x: x["published_at"] or "", reverse=True)

    return sorted_articles

# Example usage
if __name__ == "__main__":
    NEWSAPI_KEY = "05d99e5db00d46f9b344f43b85a58f59"
    MEDIASTACK_KEY = "a6a633b5fc8a5bac5406638c88699246"
    ADDITIONALAPI_KEY = "b0a36ecabae141029714540850eb4b4a"

    news = fetch_all_news(NEWSAPI_KEY, MEDIASTACK_KEY, ADDITIONALAPI_KEY)
    for article in news:
        print(f"[{article['source']}] {article['title']} - {article['published_at']}")



