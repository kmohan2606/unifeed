import requests
import json


class PolymarketCollector:

    def __init__(self):
        self.base_url = "https://gamma-api.polymarket.com"

        # Map tag IDs to categories
        self.tag_to_category = {
            "1": "Sports",
            "2": "General Affairs",
            "100265": "General Affairs",
            "144": "General Affairs",
            "101970": "General Affairs",
            "159": "General Affairs",
            "100343": "Mentions",
            "120": "Economics",
            "21": "Economics",
            "100328": "Economics",
            "1013": "Earnings",
            "596": "Culture",
            "1401": "Tech",
            "74": "Tech",
            "84": "Weather",
            "414": "Health"
        }

        # Structure: category -> list of markets
        self.marketsByCategory = {
            "Sports": [],
            "General Affairs": [],
            "Mentions": [],
            "Economics": [],
            "Earnings": [],
            "Culture": [],
            "Tech": [],
            "Weather": [],
            "Health": [],
            "NoTag": []
        }


    def collect_and_organize(self):

        print("Starting Polymarket Fetch")

        offset = 0
        limit = 500
        total_markets = 0

        while True:
            url = f"{self.base_url}/markets"
            params = {
                "limit": limit,
                "offset": offset,
                "closed": "false",
                "include_tag": "true"
            }

            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if not data:
                    print("Data empty")
                    break
                
                for market in data:
                    categories = []
                    if "tags" in market.keys():
                        for tag in market["tags"]:
                            tag_id = tag["id"]
                            if tag_id in self.tag_to_category:
                                categories.append(self.tag_to_category[tag_id])
                    if not categories:
                        categories = ["NoTag"]

                    title = market["question"]
                    description = market["description"]
                    for category in categories:
                        self.marketsByCategory[category].append((title, title + description))


                total_markets += len(data)
                print(f"Fetched and organized {len(data)} markets (total: {total_markets})")

                if len(data) < limit:
                    break

                offset += limit

            except requests.exceptions.RequestException as e:
                print(f"Error fetching markets: {e}")
                break

        print(f"\nTotal markets organized: {total_markets}")

        return self.marketsByCategory

    def save_to_json(self):

        if not self.marketsByCategory:
            print("No markets to save")
            return
        
        with open("data/polymarket_markets.json", 'w', encoding='utf-8') as f:
            json.dump(self.marketsByCategory, f, indent=2, ensure_ascii=False)

        print(f"\nSaved markets to data")

    def print_summary(self):
        
        if not self.marketsByCategory:
            print("No markets loaded. Run collect_and_organize() first.")
            return
        
        print("FINISHED FETCHING POLYMARKET MARKETS")



if __name__ == "__main__":
    collector = PolymarketCollector()
    markets_dict = collector.collect_and_organize()
    collector.print_summary()
    collector.save_to_json()