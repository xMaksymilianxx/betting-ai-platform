# API Configuration Guide

## Quick Start

1. **Copy `.env.example` to `.env.local`**
2. **Add your API keys**
3. **Enable/disable APIs as needed**

## Available APIs

### 1. Livescore6 (Recommended - Default)
- **Status**: ✅ Enabled by default
- **Key**: `RAPIDAPI_KEY`
- **Features**: Live matches only
- **Rate Limit**: 100 requests/day (free)
- **Best for**: Simple live scores

### 2. API-Football (Premium)
- **Status**: ⚪ Disabled by default
- **Key**: `API_FOOTBALL_KEY`
- **Features**: Full data (stats, odds, lineups, H2H)
- **Rate Limit**: 100 requests/day (free)
- **Best for**: Complete match data

### 3. The Odds API
- **Status**: ⚪ Disabled by default
- **Key**: `ODDS_API_KEY`
- **Features**: Odds only
- **Rate Limit**: 500 requests/month (free)
- **Best for**: Pre-match odds

### 4. Football-Data.org
- **Status**: ⚪ Disabled by default
- **Key**: `FOOTBALL_DATA_KEY`
- **Features**: Matches, standings
- **Rate Limit**: 10 requests/minute (free)
- **Best for**: League data

## Configuration Examples

### Minimal (Free - Live matches only)
