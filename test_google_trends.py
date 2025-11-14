#!/usr/bin/env python3
"""
Test script for Google Trends skill
Demonstrates basic functionality
"""
from pytrends.request import TrendReq
import json
import time

def test_basic_trends():
    """Test basic interest over time query"""
    print("Testing Google Trends API...")

    pytrends = TrendReq(hl='en-US', tz=360)

    # Test with simple keyword
    keywords = ['python programming']

    try:
        pytrends.build_payload(
            kw_list=keywords,
            timeframe='today 3-m',
            geo='US'
        )

        data = pytrends.interest_over_time()

        if not data.empty:
            if 'isPartial' in data.columns:
                data = data.drop('isPartial', axis=1)
            data = data.reset_index()
            data['date'] = data['date'].astype(str)

            print(f"\nSuccess! Retrieved {len(data)} data points")
            print(f"\nFirst 5 rows:")
            print(data.head().to_string())

            # Save as JSON
            result = data.to_dict(orient='records')
            print(f"\nJSON sample:")
            print(json.dumps(result[:3], indent=2))

            return True
        else:
            print("No data returned")
            return False

    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_basic_trends()
