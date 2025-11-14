# D3.js Data Visualizer Skill

## Overview

This skill enables Claude to create interactive D3.js visualizations from any structured data. Works with time series, geographic data, network graphs, hierarchical data, and more. Creates React artifacts with professional, interactive charts and maps.

## When to Use This Skill

**Proactively use when user:**
- Provides structured data (JSON, CSV, arrays) and asks to visualize it
- Says "chart this", "map this", "visualize this", or "graph this"
- Asks for specific chart types (line chart, bar chart, scatter plot, etc.)
- Wants to see trends, patterns, or distributions in data
- Requests a dashboard or multiple related views

**Don't use for:**
- Simple text tables (use markdown tables)
- Single numbers or basic stats (just show them)
- Data that's better as a list

## Critical Setup Information

### Library Access in React Artifacts

React artifacts can import D3.js from CDN:

```jsx
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
```

For simpler charts, Recharts is also available:

```jsx
// Recharts imports work in React artifacts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

### Data Embedding Workflow

**IMPORTANT:** React artifacts cannot load external files. All data must be embedded inline:

```jsx
const data = [
  {date: "2024-01-01", value: 45},
  {date: "2024-01-08", value: 52},
  // ... all data here
];
```

**Workflow:**
1. User provides data or you fetch it
2. Format data as JavaScript array/object
3. Embed directly in artifact code
4. Keep to <500 rows if possible for performance

## Supported Data Types

### Time Series Data
Any data with dates/times and numeric values:

```json
[
  {"date": "2024-01-01", "value": 45, "category": "A"},
  {"date": "2024-01-08", "value": 52, "category": "A"}
]
```

### Geographic Data
Data with location identifiers:

```json
[
  {"location": "California", "value": 100},
  {"location": "Texas", "value": 87}
]
```

**Note:** For geographic data, prefer simple bar charts over complex maps unless user specifically wants a choropleth.

### Hierarchical Data
Nested structures:

```json
{
  "name": "root",
  "children": [
    {"name": "branch1", "value": 100},
    {"name": "branch2", "children": [...]}
  ]
}
```

### Network Data
Nodes and edges:

```json
{
  "nodes": [{"id": "A"}, {"id": "B"}],
  "links": [{"source": "A", "target": "B", "value": 1}]
}
```

### Tabular Data
Simple rows and columns:

```json
[
  {"category": "Product A", "sales": 1500},
  {"category": "Product B", "sales": 2300}
]
```

## Quick Start Templates

### Recharts Simple Line Chart (Recommended for Speed)

**Use this first** - much simpler than D3, works great for standard charts:

```jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function App() {
  const data = [
    {date: "Jan", value: 45, value2: 30},
    {date: "Feb", value: 52, value2: 35},
    {date: "Mar", value: 48, value2: 42},
  ];

  return (
    <div className="w-full h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Time Series Visualization</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="value2" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### Recharts Bar Chart

```jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function App() {
  const data = [
    {name: 'Category A', value: 4000},
    {name: 'Category B', value: 3000},
    {name: 'Category C', value: 2000},
  ];

  return (
    <div className="w-full h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Category Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### D3.js Advanced Line Chart

**Use when you need more control** than Recharts provides:

```jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const svgRef = useRef();

  const data = [
    {date: "2024-01-01", value: 45},
    {date: "2024-02-01", value: 52},
    {date: "2024-03-01", value: 48},
  ];

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = {top: 20, right: 30, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const parsedData = data.map(d => ({
      date: parseDate(d.date),
      value: +d.value
    }));

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.value)])
      .nice()
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    // Draw line
    svg.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#8884d8')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('circle')
      .data(parsedData)
      .join('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', '#8884d8');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

  }, []);

  return (
    <div className="w-full h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">D3 Line Chart</h2>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
```

## D3.js Visualization Templates

### D3 Horizontal Bar Chart (Great for Rankings)

```jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const svgRef = useRef();

  const data = [
    {name: "Item A", value: 95},
    {name: "Item B", value: 80},
    {name: "Item C", value: 65},
    {name: "Item D", value: 45},
  ];

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Sort descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = {top: 20, right: 30, bottom: 40, left: 120};
    const width = 800 - margin.left - margin.right;
    const height = Math.max(400, sortedData.length * 40);

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.value)])
      .nice()
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, height])
      .padding(0.2);

    // Color scale
    const color = d3.scaleSequential()
      .domain([0, d3.max(sortedData, d => d.value)])
      .interpolator(d3.interpolateBlues);

    // Bars
    svg.selectAll('rect')
      .data(sortedData)
      .join('rect')
      .attr('x', 0)
      .attr('y', d => y(d.name))
      .attr('width', d => x(d.value))
      .attr('height', y.bandwidth())
      .attr('fill', d => color(d.value));

    // Value labels
    svg.selectAll('text.value')
      .data(sortedData)
      .join('text')
      .attr('class', 'value')
      .attr('x', d => x(d.value) + 5)
      .attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text(d => d.value)
      .attr('font-size', '12px');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

  }, []);

  return (
    <div className="w-full p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Horizontal Bar Chart</h2>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
```

### D3 Scatter Plot

```jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const svgRef = useRef();

  const data = [
    {x: 10, y: 20, label: "A"},
    {x: 25, y: 35, label: "B"},
    {x: 40, y: 25, label: "C"},
    {x: 60, y: 55, label: "D"},
  ];

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = {top: 20, right: 30, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.x)])
      .nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .nice()
      .range([height, 0]);

    // Points
    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 6)
      .attr('fill', '#8884d8')
      .attr('opacity', 0.7)
      .append('title')
      .text(d => `${d.label}: (${d.x}, ${d.y})`);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

  }, []);

  return (
    <div className="w-full p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Scatter Plot</h2>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
```

### D3 Force-Directed Network Graph

```jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const svgRef = useRef();

  const data = {
    nodes: [
      {id: "A", group: 1},
      {id: "B", group: 1},
      {id: "C", group: 2},
      {id: "D", group: 2},
    ],
    links: [
      {source: "A", target: "B", value: 1},
      {source: "B", target: "C", value: 2},
      {source: "C", target: "D", value: 1},
      {source: "A", target: "D", value: 1},
    ]
  };

  useEffect(() => {
    if (!data) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a copy to avoid mutating original data
    const links = data.links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', d => color(d.group))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', 12)
      .attr('dx', 12)
      .attr('dy', 4);

    // Tooltips
    node.append('title').text(d => d.id);

    // Update positions
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, []);

  return (
    <div className="w-full p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Network Graph</h2>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
```

## Geographic Visualizations

### Simple Geographic Bar Chart (Recommended)

For geographic data, **start with this** instead of complex maps:

```jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const data = [
    {location: "California", value: 100},
    {location: "Texas", value: 87},
    {location: "Florida", value: 65},
    {location: "New York", value: 54},
  ].sort((a, b) => b.value - a.value);

  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(data, d => d.value)])
    .interpolator(d3.interpolateBlues);

  return (
    <div className="w-full h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Geographic Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="location" width={100} />
            <Tooltip />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScale(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### Choropleth Map (Advanced - US States)

Only use if user specifically wants a map visualization:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export default function App() {
  const svgRef = useRef();
  const [geoData, setGeoData] = useState(null);

  // Your data with state codes
  const data = {
    "CA": 100,
    "TX": 87,
    "FL": 65,
    "NY": 54,
  };

  useEffect(() => {
    // Load US states GeoJSON
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then(us => {
        const states = topojson.feature(us, us.objects.states);
        setGeoData(states);
      });
  }, []);

  useEffect(() => {
    if (!geoData) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 975;
    const height = 610;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', 'auto');

    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath(projection);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(Object.values(data))])
      .interpolator(d3.interpolateBlues);

    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        // You'll need to map state FIPS codes to your data
        const value = data[d.properties.name];
        return value ? colorScale(value) : '#ccc';
      })
      .attr('stroke', 'white')
      .append('title')
      .text(d => `${d.properties.name}: ${data[d.properties.name] || 'No data'}`);

  }, [geoData]);

  return (
    <div className="w-full p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">US Choropleth Map</h2>
        {!geoData ? <p>Loading map...</p> : <svg ref={svgRef}></svg>}
      </div>
    </div>
  );
}
```

**Note:** Choropleth maps require:
1. TopoJSON library (add script tag to artifact)
2. Matching state names/codes between your data and GeoJSON
3. More complex setup

**Prefer simple bar charts unless map is specifically requested.**

## Best Practices

### 1. Start Simple - Use Recharts First

For standard charts (line, bar, area, pie), **always try Recharts first**:
- Much simpler code
- Responsive by default
- Good tooltips out of the box
- Faster to create

Only use D3 when you need:
- Custom visualization types (networks, maps, etc.)
- Fine-grained control
- Complex interactions

### 2. Data Validation

Always check data before rendering:

```jsx
if (!data || data.length === 0) {
  return (
    <div className="p-8 text-center text-red-600">
      <p>No data available to visualize</p>
    </div>
  );
}
```

### 3. Clear State Between Renders

For D3 visualizations:

```jsx
useEffect(() => {
  d3.select(svgRef.current).selectAll('*').remove();
  // ... then draw
}, [data]);
```

### 4. Responsive Design

Recharts:
```jsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    {/* chart content */}
  </LineChart>
</ResponsiveContainer>
```

D3:
```jsx
<svg
  viewBox={`0 0 ${width} ${height}`}
  className="w-full"
  style={{maxHeight: '600px'}}
/>
```

### 5. Label Everything

Always include:
- Chart title
- Axis labels
- Legend (if multiple series)
- Units (%, $, etc.)
- Tooltips for details

### 6. Color Choices

**Categorical data:**
```jsx
const color = d3.scaleOrdinal(d3.schemeCategory10);
```

**Sequential (low to high):**
```jsx
const color = d3.scaleSequential()
  .domain([0, max])
  .interpolator(d3.interpolateBlues);
```

**Diverging (below/above average):**
```jsx
const color = d3.scaleDiverging()
  .domain([min, mid, max])
  .interpolator(d3.interpolateRdBu);
```

## Decision Tree

```
User wants to visualize data
    ↓
What type?
    ├── Time series → Recharts LineChart
    ├── Categories (few) → Recharts BarChart
    ├── Categories (many) → D3 horizontal bar chart
    ├── Geographic → Simple bar chart first
    ├── Two variables → Recharts ScatterChart or D3 scatter
    ├── Network/relationships → D3 force-directed graph
    ├── Part-to-whole → Recharts PieChart
    └── Hierarchical → D3 treemap

How much data?
    ├── <200 rows → Full visualization
    ├── 200-500 rows → Consider sampling
    └── >500 rows → Definitely sample or aggregate

Complexity needed?
    ├── Standard chart → Use Recharts
    └── Custom/complex → Use D3
```

## Data Processing Helpers

### Parse Multiple Date Formats

```jsx
const parseDate = (dateStr) => {
  const formats = [
    d3.timeParse('%Y-%m-%d'),
    d3.timeParse('%m/%d/%Y'),
    d3.timeParse('%Y-%m-%dT%H:%M:%S'),
  ];

  for (let format of formats) {
    const parsed = format(dateStr);
    if (parsed) return parsed;
  }

  return new Date(dateStr); // Fallback
};
```

### Get Numeric Columns

```jsx
const getNumericColumns = (data) => {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]).filter(key =>
    typeof data[0][key] === 'number'
  );
};
```

### Sort and Limit

```jsx
// Top 10
const top10 = [...data]
  .sort((a, b) => b.value - a.value)
  .slice(0, 10);
```

## Common Patterns

### Multi-Series Line Chart (Recharts)

```jsx
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line dataKey="series1" stroke="#8884d8" />
  <Line dataKey="series2" stroke="#82ca9d" />
  <Line dataKey="series3" stroke="#ffc658" />
</LineChart>
```

### Stacked Bar Chart (Recharts)

```jsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="value1" stackId="a" fill="#8884d8" />
  <Bar dataKey="value2" stackId="a" fill="#82ca9d" />
</BarChart>
```

### Area Chart (Recharts)

```jsx
import { AreaChart, Area } from 'recharts';

<AreaChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
</AreaChart>
```

## Troubleshooting

### D3 Import Not Working

Make sure you're using the ESM CDN:
```jsx
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
```

NOT the regular CDN URL.

### Chart Not Updating

For D3, make sure you're clearing previous renders:
```jsx
useEffect(() => {
  d3.select(svgRef.current).selectAll('*').remove();
  // draw code
}, [data]);
```

### Performance Issues

If >500 data points:
- Sample the data
- Aggregate to larger time buckets
- Use Canvas instead of SVG (advanced)

### Dates Not Parsing

Try multiple formats or fallback to native Date:
```jsx
const date = d3.timeParse('%Y-%m-%d')(str) || new Date(str);
```

## Resources

- **Recharts Gallery:** https://recharts.org/en-US/examples
- **D3 Gallery:** https://observablehq.com/@d3/gallery
- **Color Schemes:** https://d3js.org/d3-scale-chromatic

## Remember

1. **Start with Recharts** for standard charts
2. **Embed all data inline** - no external files
3. **Keep data to <500 rows** when possible
4. **Validate data first** before rendering
5. **Label everything clearly**
6. **Simple is better** - don't over-complicate

The goal is **insight**, not fancy graphics. Choose the simplest visualization that tells the story effectively.
