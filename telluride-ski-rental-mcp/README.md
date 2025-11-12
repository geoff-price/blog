# Telluride Ski Rental MCP Server

A Model Context Protocol (MCP) server that provides information about ski rental shops near Telluride, Colorado.

## Overview

This MCP server offers detailed information about ski rental locations in the Telluride area, including shops in downtown Telluride and Mountain Village. It provides tools to search, filter, and get recommendations for ski rental shops based on your specific needs.

## Features

- **6 Ski Rental Locations** covering Telluride and Mountain Village
- **Detailed Information** including addresses, phone numbers, websites, and hours
- **Service Information** for each location (rentals, repairs, boot fitting, etc.)
- **Smart Recommendations** based on your needs (beginner, expert, backcountry, etc.)
- **Search Functionality** to find shops by location, service, or equipment type

## Installation

```bash
cd telluride-ski-rental-mcp
npm install
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development:

```bash
npm run dev
```

### Configuring with Claude Desktop

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "telluride-ski-rental": {
      "command": "node",
      "args": ["/absolute/path/to/telluride-ski-rental-mcp/build/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/` with the actual path to this directory.

## Available Tools

### 1. `list_ski_rentals`

Get a complete list of all ski rental shops with full details.

**Parameters**: None

**Example**:
```
List all ski rental shops near Telluride
```

### 2. `get_rental_details`

Get detailed information about a specific rental shop by its ID.

**Parameters**:
- `rental_id` (string): The shop's unique identifier

**Available IDs**:
- `telluride-sports`
- `bootdoctors`
- `jagged-edge`
- `paragon-ski-snowboard`
- `telluride-ski-rental-delivery`
- `mountain-sports-telluride`

**Example**:
```
Show me details for Bootdoctors
```

### 3. `search_rentals`

Search for rental shops by location, service type, or equipment.

**Parameters**:
- `query` (string): Search term (e.g., "Mountain Village", "backcountry", "delivery")

**Example**:
```
Find ski rental shops in Mountain Village
Search for shops with backcountry equipment
```

### 4. `get_rental_recommendations`

Get personalized recommendations based on your specific needs.

**Parameters**:
- `need` (string): One of: `beginner`, `expert`, `backcountry`, `delivery`, `budget`, `premium`, `family`

**Examples**:
```
Recommend ski rental shops for beginners
Find premium ski rental options
Which shops are good for families?
```

## Rental Shop Information

The server includes data for these shops:

1. **Telluride Sports** - Downtown Telluride, full-service rentals
2. **Bootdoctors** - Mountain Village, premium rentals and custom boot fitting
3. **Jagged Edge Mountain Gear** - Downtown Telluride, backcountry specialists
4. **Paragon Ski & Snowboard** - Mountain Village, beginner-friendly
5. **Telluride Ski Rental Delivery** - Delivery service to your accommodation
6. **Mountain Sports Telluride** - Downtown Telluride, affordable options

## Data Structure

Each rental shop includes:
- Name and location
- Full address and contact information
- Website (when available)
- Detailed description
- Services offered
- Types of equipment available
- Price range
- Operating hours

## Development

### Project Structure

```
telluride-ski-rental-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building

```bash
npm run build
```

### Modifying Data

To add or update ski rental shops, edit the `skiRentals` array in `src/index.ts`.

## License

MIT

## Contributing

Feel free to submit issues or pull requests to add more rental locations or improve functionality.
