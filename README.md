# Launch Feed - Foundry-Powered News Aggregator

## Overview

Launch Feed is my project submission developed for the Palantir Launch 2025 program, demonstrating the power of Palantir's Foundry platform in solving real-world problems. As a Forward Deployed Engineer (Delta) track project, it focuses on delivering an operational solution that helps users stay informed about space launches and related news through an intuitive and actionable interface.

### Problem Statement

In today's fast-paced world, space enthusiasts and professionals struggle to keep up with the latest space launches and related news. Traditional news sources often provide fragmented information, making it difficult to get a comprehensive view of upcoming launches, their significance, and related developments.

Launch Feed solves this by:

- Aggregating launch data from multiple sources
- Providing real-time updates on launch schedules
- Offering AI-powered analysis of launch significance
- Delivering personalized news feeds based on user interests

## Project Structure

```
launch-feed/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── lib/          # Utility functions and hooks
│   │   └── App.tsx       # Main application component
│   └── public/           # Static assets
└── scripts/              # Python scripts for data processing
    ├── news-fetch.py     # News aggregation script
    └── partition.py      # Data partitioning utilities
```
