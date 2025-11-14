# Google Trends Data Fetcher Skill

## Purpose

Fetch Google Trends data using the `pytrends` library. This skill retrieves search trend data, geographic interest, related queries, and trending searches. **Data-only skill** - does not create visualizations.

## When to Invoke This Skill

- User asks for Google Trends data for specific keywords
- User wants to compare search interest across terms
- User requests geographic distribution of searches
- User needs related queries or topics
- User wants trending searches data
- User wants to export trends data (CSV, JSON)

## Prerequisites

Before fetching data, ensure pytrends is installed:

```bash
pip install pytrends --break-system-packages
```

## Core Operations

### 1. Interest Over Time

**Use when:** User wants historical search interest trends

```python
from pytrends.request import TrendReq
import json
import time

pytrends = TrendReq(hl='en-US', tz=360)

# Build payload (max 5 keywords)
pytrends.build_payload(
    kw_list=['keyword1', 'keyword2'],
    timeframe='today 12-m',  # Options: 'now 1-H', 'now 7-d', 'today 1-m', 'today 3-m', 'today 12-m', 'today 5-y', 'all'
    geo='',  # '' = worldwide, 'US' = USA, 'US-CA' = California
    gprop=''  # '' = web, 'youtube', 'news', 'images', 'froogle'
)

data = pytrends.interest_over_time()

# Clean and format
if not data.empty:
    if 'isPartial' in data.columns:
        data = data.drop('isPartial', axis=1)
    data = data.reset_index()
    data['date'] = data['date'].astype(str)
    print(json.dumps(data.to_dict(orient='records'), indent=2))
else:
    print("No data returned - try broader timeframe or different keywords")
```

### 2. Interest by Region

**Use when:** User wants geographic distribution

```python
pytrends.build_payload(kw_list=['keyword'])
geo_data = pytrends.interest_by_region(
    resolution='COUNTRY',  # Options: 'CITY', 'COUNTRY', 'DMA', 'REGION'
    inc_low_vol=True
)

if not geo_data.empty:
    geo_data = geo_data.reset_index()
    geo_data = geo_data.sort_values(by='keyword', ascending=False)
    print(geo_data.head(20).to_string())
```

### 3. Related Queries

**Use when:** User wants to see related search terms

```python
pytrends.build_payload(kw_list=['keyword'])
related = pytrends.related_queries()

for term, data_dict in related.items():
    print(f"\n=== Related Queries for '{term}' ===")

    if data_dict['top'] is not None:
        print("\nTop Related:")
        print(data_dict['top'].to_string())

    if data_dict['rising'] is not None:
        print("\nRising Related:")
        print(data_dict['rising'].to_string())
```

### 4. Trending Searches (Real-time)

**Use when:** User wants current trending searches

```python
trending = pytrends.trending_searches(pn='united_states')
print("Current Trending Searches:")
print(trending.head(20).to_string())
```

## Complete Example Workflow

```python
#!/usr/bin/env python3
from pytrends.request import TrendReq
import json
import time
import sys

def fetch_trends_data(keywords, timeframe='today 12-m', geo='', output_format='json'):
    """
    Fetch Google Trends data with error handling

    Args:
        keywords: list of keywords (max 5)
        timeframe: time period to analyze
        geo: geographic region code
        output_format: 'json', 'csv', or 'table'
    """
    if len(keywords) > 5:
        print("Error: Maximum 5 keywords allowed. Truncating to first 5.")
        keywords = keywords[:5]

    pytrends = TrendReq(hl='en-US', tz=360)
    results = {}

    try:
        # 1. Interest Over Time
        print(f"Fetching interest over time for: {', '.join(keywords)}")
        pytrends.build_payload(kw_list=keywords, timeframe=timeframe, geo=geo)
        interest_data = pytrends.interest_over_time()

        if not interest_data.empty:
            if 'isPartial' in interest_data.columns:
                interest_data = interest_data.drop('isPartial', axis=1)
            interest_data = interest_data.reset_index()
            interest_data['date'] = interest_data['date'].astype(str)
            results['interest_over_time'] = interest_data.to_dict(orient='records')
        else:
            results['interest_over_time'] = []
            print("Warning: No interest over time data returned")

        time.sleep(2)  # Rate limiting

        # 2. Interest by Region (for first keyword)
        print(f"Fetching geographic data for: {keywords[0]}")
        pytrends.build_payload(kw_list=[keywords[0]], timeframe=timeframe, geo=geo)
        geo_data = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True)

        if not geo_data.empty:
            geo_data = geo_data.reset_index()
            geo_data = geo_data.sort_values(by=keywords[0], ascending=False)
            results['geographic_interest'] = geo_data.head(20).to_dict(orient='records')
        else:
            results['geographic_interest'] = []

        time.sleep(2)  # Rate limiting

        # 3. Related Queries (for first keyword)
        print(f"Fetching related queries for: {keywords[0]}")
        related = pytrends.related_queries()

        if keywords[0] in related:
            results['related_queries'] = {
                'top': related[keywords[0]]['top'].to_dict(orient='records') if related[keywords[0]]['top'] is not None else [],
                'rising': related[keywords[0]]['rising'].to_dict(orient='records') if related[keywords[0]]['rising'] is not None else []
            }

        # Output results
        if output_format == 'json':
            print("\n=== RESULTS (JSON) ===")
            print(json.dumps(results, indent=2))
        elif output_format == 'csv':
            # Save to outputs directory
            csv_path = '/mnt/user-data/outputs/trends_data.csv'
            if results.get('interest_over_time'):
                import pandas as pd
                df = pd.DataFrame(results['interest_over_time'])
                df.to_csv(csv_path, index=False)
                print(f"\nData saved to: {csv_path}")
        elif output_format == 'table':
            print("\n=== Interest Over Time ===")
            if results.get('interest_over_time'):
                import pandas as pd
                df = pd.DataFrame(results['interest_over_time'])
                print(df.to_string())

        return results

    except Exception as e:
        print(f"Error fetching trends data: {e}")
        print("Troubleshooting tips:")
        print("- Check if keywords are valid and have search volume")
        print("- Try a longer timeframe (e.g., 'today 5-y')")
        print("- Try worldwide geo ('') instead of specific region")
        print("- Wait a few seconds and retry (rate limiting)")
        return None

if __name__ == "__main__":
    # Example usage
    keywords = ['artificial intelligence', 'machine learning']
    results = fetch_trends_data(keywords, timeframe='today 12-m', geo='US', output_format='json')
```

## Output Formats

### JSON (for piping to other tools)
```python
print(json.dumps(data.to_dict(orient='records'), indent=2))
```

### CSV (for exports)
```python
data.to_csv('/mnt/user-data/outputs/trends.csv', index=False)
```

### Table (for readability)
```python
print(data.to_string())
# or just first 10 rows
print(data.head(10).to_string())
```

## Important Configuration Options

### Timeframes
- `'now 1-H'` - Last hour
- `'now 4-H'` - Last 4 hours
- `'now 1-d'` - Last day
- `'now 7-d'` - Last 7 days
- `'today 1-m'` - Last 30 days
- `'today 3-m'` - Last 90 days
- `'today 12-m'` - Last 12 months (default)
- `'today 5-y'` - Last 5 years
- `'all'` - All available data (2004-present)
- `'YYYY-MM-DD YYYY-MM-DD'` - Custom range

### Geographic Codes
- `''` - Worldwide (default)
- `'US'` - United States
- `'US-CA'` - California
- `'GB'` - United Kingdom
- `'IN'` - India
- Use ISO 3166-2 codes

### Google Properties (gprop)
- `''` - Web Search (default)
- `'youtube'` - YouTube Search
- `'news'` - Google News
- `'images'` - Google Images
- `'froogle'` - Google Shopping

## Rate Limiting (CRITICAL)

Always add delays between API calls:
```python
import time

pytrends.build_payload(kw_list=['term1'])
data1 = pytrends.interest_over_time()
time.sleep(2)  # REQUIRED - wait 2 seconds

pytrends.build_payload(kw_list=['term2'])
data2 = pytrends.interest_over_time()
```

**Recommended delays:**
- Between different API calls: 2 seconds minimum
- If hitting rate limits: increase to 3-5 seconds

## Common Issues and Solutions

### Issue: Empty DataFrame returned
**Solutions:**
- Try longer timeframe: `'today 5-y'` instead of `'today 1-m'`
- Try worldwide geo: `''` instead of specific country
- Use more popular/broader keywords
- Check spelling and capitalization

### Issue: Rate limit errors (429)
**Solutions:**
- Increase sleep time between requests to 3-5 seconds
- Reduce number of API calls
- Wait a few minutes before retrying

### Issue: Keyword limit exceeded
**Solution:**
- Maximum 5 keywords per comparison
- Split into multiple requests if needed

### Issue: Date format errors in JSON
**Solution:**
```python
data['date'] = data['date'].astype(str)
```

## Data Interpretation

**Understanding Values:**
- Values are normalized to 0-100 scale
- 100 = peak popularity within the timeframe
- Values are **relative** to the highest point
- When comparing terms, one will be at/near 100

**Example:**
If "AI" has value 100 and "ML" has value 50, it means "ML" had half the search interest of "AI" during that period.

## Step-by-Step Execution

When user requests Google Trends data:

1. **Clarify requirements** (if not specified):
   - Keywords to analyze
   - Timeframe (default: 'today 12-m')
   - Geography (default: '' for worldwide)
   - Data type needed (interest over time, geographic, related queries)
   - Output format (default: JSON)

2. **Install pytrends** (if not already installed):
   ```bash
   pip install pytrends --break-system-packages
   ```

3. **Create Python script**:
   - Use examples above as templates
   - Add 2-second delays between API calls
   - Include error handling
   - Format output as requested

4. **Execute script**:
   ```bash
   python3 script.py
   ```

5. **Provide results**:
   - Display data in requested format
   - If CSV, save to `/mnt/user-data/outputs/`
   - Summarize key findings
   - Suggest next steps (e.g., "This data can be visualized using...")

## Example User Scenarios

**Scenario 1:** "Get trend data for 'Python' vs 'JavaScript' over the past year"

**Action:**
```python
keywords = ['Python', 'JavaScript']
results = fetch_trends_data(keywords, timeframe='today 12-m', output_format='json')
```

**Scenario 2:** "Which countries search for 'machine learning' the most?"

**Action:**
```python
pytrends.build_payload(kw_list=['machine learning'])
geo_data = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True)
print(geo_data.sort_values(by='machine learning', ascending=False).head(20))
```

**Scenario 3:** "What are people searching alongside 'ChatGPT'?"

**Action:**
```python
pytrends.build_payload(kw_list=['ChatGPT'])
related = pytrends.related_queries()
# Display both top and rising related queries
```

**Scenario 4:** "Export trends for 'AI agents' - I want to analyze it later"

**Action:**
```python
# Fetch data and export as both CSV and JSON
interest_data.to_csv('/mnt/user-data/outputs/ai_agents_trends.csv', index=False)
with open('/mnt/user-data/outputs/ai_agents_trends.json', 'w') as f:
    json.dump(data.to_dict(orient='records'), f, indent=2)
```

## Best Practices

1. **Always check for empty results** before processing
2. **Always add delays** (2+ seconds) between API calls
3. **Always remove 'isPartial' column** before output
4. **Always convert dates to strings** for JSON serialization
5. **Always handle None values** in related queries/topics
6. **Limit to 5 keywords** per comparison
7. **Use try/except blocks** for error handling
8. **Provide clear output** with context and interpretation

## Next Steps After Data Retrieval

Inform the user they can:
- Visualize data using plotting libraries (matplotlib, plotly)
- Export to CSV for use in Excel/Google Sheets
- Pipe JSON data to other analysis tools
- Request additional related data (different timeframes, regions)
- Save data for long-term tracking
