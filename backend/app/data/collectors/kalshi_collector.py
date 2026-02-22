import aiohttp
import asyncio
import json
import requests
from pathlib import Path

URL = "https://api.elections.kalshi.com/trade-api/v2"


class AsyncKalshiCollector:

    def __init__(self, num_sessions=2):
        self.url = URL
        self.last_update = None
        self.sessions = [aiohttp.ClientSession() for _ in range(num_sessions)]
        self.session_idx = 0
    
    async def rotate_sessions(self, url, params, max_retries=5):
        for attempt in range(max_retries):
            session = self.sessions[self.session_idx]
            self.session_idx = (self.session_idx + 1) % len(self.sessions)
            
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 429:
                        continue
                    if response.status != 200:
                        return None
                    data = await response.json()
                    if 'markets' not in data:
                        return None
                    return data, None
            except asyncio.TimeoutError:
                if attempt == max_retries - 1:
                    return None
            except Exception as e:
                return None, f"{type(e).__name__}: {e}"
        return None
    
    async def close(self):
        for session in self.sessions:
            await session.close()

    async def clean_markets(self):
        page = 0
        cursor = None 
        settled_tickers = []

        while True:
            page += 1

            params = {
                'limit': 1000
            }

            if self.last_update:
                params['min_settled_ts'] = int(self.last_update)
            if cursor:
                params['cursor'] = cursor

            data, error = await self.rotate_sessions(f"{self.url}/markets", params)

            if error:
                print(f"Error fetching closed markets page {page}: {error}")
                break
            
            markets = data['markets']
            if not markets:
                break
            settled_tickers.extend(m['ticker'] for m in markets)
            cursor = data.get('cursor')
            if not cursor:
                break
        return settled_tickers
    


    async def get_categorized_markets(self):
        """Main function to fetch all markets organized by category"""
        processed = {}
        punc = ['.', '?', '!']
        cursor = None
        page = 0

        print("Starting to fetch events...")

        currAmount = 0
        while True:
            page += 1
            params = {
                'limit': 200,
                'status': 'open',
                'with_nested_markets': 'true'
            }


            
            if cursor:
                params['cursor'] = cursor
                print(f"Page {page}")
            else:
                print(f"Page {page}: Initial request (no cursor)")

            response = requests.get(self.url + '/events', params=params)
            data = response.json()
            events = data['events']

            for event in events:
                event_category = event['category']
                if event_category in ('World', 'Politics', 'Elections'):
                    event_category = 'General Affairs'
                elif event_category in ('Crypto', 'Financials', 'Economics'):
                    event_category = 'Economics'

                if event_category not in processed:
                    processed[event_category] = []
                    
                currAmount += len(event['markets'])

                for market in event['markets']:
                    ticker = market['ticker']
                    title = market['title']
                    rules_primary = market['rules_primary']
                    rules_secondary = market['rules_secondary']

                    if title[-1] not in punc:
                        title += '.'


                    processed[event_category].append((ticker, title, title + " " + rules_primary + " " + rules_secondary))

                total_markets = 0
                
                async with aiohttp.ClientSession() as session:
                    while True:
                        page += 1
                        params = {
                            'limit': 200,
                            'status': 'open',
                            'with_nested_markets': 'true'
                        }


                        cursor = data.get('cursor')

                        if cursor:
                            print(f"Page {page}: Next cursor exists, continuing...")
                        else:
                            print(f"Page {page}: No more cursor. Pagination complete.")
                            break

                        print(f"Total Markets: {currAmount}")

                        if cursor:
                            params['cursor'] = cursor
                                
                            try:
                                async with session.get(f"{self.url}/events", params=params) as response:
                                    data = await response.json()
                                    print("got a response!")
                                    events = data.get('events', [])
                                    
                                    for event in events:
                                        event_category = event['category']
                                        
                                        # Normalize categories
                                        if event_category in ('World', 'Politics', 'Elections'):
                                            event_category = 'General Affairs'
                                        elif event_category in ('Crypto', 'Financials', 'Economics'):
                                            event_category = 'Economics'
                                            
                                        if event_category not in processed:
                                            processed[event_category] = []
                                            
                                        total_markets += len(event['markets'])
                                        
                                        for market in event['markets']:
                                            ticker = market['ticker']
                                            title = market['title']
                                            rules_primary = market.get('rules_primary', '')
                                            rules_secondary = market.get('rules_secondary', '')
                                            
                                            if title and title[-1] not in punc:
                                                title += '.'
                                                
                                            full_description = f"{title} {rules_primary} {rules_secondary}"
                                            processed[event_category].append((ticker, title, full_description))
                                    
                                    cursor = data.get('cursor')
                                    
                                    if not cursor:
                                        break
                                        
                            except Exception as e:
                                print(f"Error fetching Kalshi page {page}: {e}")
                                break
                    
            print(f"Total Kalshi markets fetched: {total_markets}")
            return processed

    def save_categorized_to_json(self, categorized):
        """Save categorized markets to JSON: category -> [market arrays]."""
        if not categorized:
            print("No markets to save")
            return
        out = {}
        for category, markets in categorized.items():
            out[category] = [list(m) for m in markets]
        path = Path("data/kalshi_markets.json")
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2, ensure_ascii=False)
        print(f"Saved {sum(len(m) for m in categorized.values())} markets to {path}")

    async def fetch_markets(self):
        page, total, cursor, new_markets = 0, 0, None, []
        punc = ['.', '?', '!']

        while True:
            page += 1
            params = {
                'limit': 1000, 
                'status': 'open',
                'mve_filter': 'exclude'
            }

            if self.last_update:
                params['min_created_ts'] = int(self.last_update)
            if cursor:
                params['cursor'] = cursor

            data, error = await self.rotate_sessions(f"{self.url}/markets", params)

            if error:
                print(f"Error fetching page {page}: {error}")
                break
            
            for market in data['markets']:
                title = market['title']
                if title and title[-1] not in punc:
                    title += '.'
                full_desc = f"{title} {market.get('rules_primary', '')} {market.get('rules_secondary', '')}"
                new_markets.append((market['ticker'], title, full_desc, 'kalshi'))

            total += len(data['markets'])
            if total:
                print(f"Kalshi: {total} fetched so far!")
            cursor = data.get('cursor')
            if not cursor:
                break
        
        print(f"Total Kalshi markets fetched: {total}")
        return new_markets


if __name__ == "__main__":
    async def main():
        collector = AsyncKalshiCollector()
        try:
            categorized = await collector.get_categorized_markets()
            collector.save_categorized_to_json(categorized)
        finally:
            await collector.close()

    asyncio.run(main())
