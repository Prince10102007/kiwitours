# NZ Tours Chatbot

A flow-based chatbot for New Zealand tours and travel agencies featuring:
- Google Sheets integration for real-time package data
- Gemini AI for intelligent text responses
- Smart flow-based conversation for package recommendations
- Beautiful card-based package display with detailed views

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Google Gemini API
- **Data Source**: Google Sheets API (real-time sync)
- **Deployment**: Vercel

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Chat    │────▶│   FastAPI API   │────▶│  Google Sheets  │
│   Interface     │◀────│   Backend       │◀────│  (Package Data) │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Gemini AI     │
                        │   (Smart Chat)  │
                        └─────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud project with Sheets API enabled
- Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables in `.env`

6. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Google Sheets Setup

> **Detailed Guide**: See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for step-by-step instructions with screenshots.

> **Quick Start**: Import [sample_packages.csv](./sample_packages.csv) into a new Google Sheet to get started immediately!

### Required Columns

| Column | Description |
|--------|-------------|
| ID | Unique package ID |
| Name | Package name |
| Region | North Island / South Island / Both |
| Type | Adventure / Culture / Nature / Food / Mixed |
| Duration | Number of days |
| Price | Price per person (NZD) |
| Group Size | Format: "2-8" or just "4" |
| Description | Short description |
| Highlights | Comma-separated list |
| Itinerary | Comma or newline-separated day descriptions |
| Inclusions | Comma-separated list |
| Exclusions | Comma-separated list |
| Image URL | Main package image URL |
| Gallery | Comma-separated image URLs |
| Season | Comma-separated (Summer, Autumn, Winter, Spring, All Year) |
| Status | Active / Inactive |

### Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and create
5. Create a key:
   - Click on the service account
   - Go to Keys tab
   - Add Key > Create new key > JSON
   - Download the JSON file
6. Base64 encode the JSON file:
   ```bash
   base64 -i service-account.json
   ```
7. Add the encoded string to `GOOGLE_SERVICE_ACCOUNT_KEY` in your `.env`
8. Share your Google Sheet with the service account email

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Health status |
| GET | `/api/packages` | Get all packages |
| GET | `/api/packages/{id}` | Get package by ID |
| POST | `/api/packages/filter` | Filter packages |
| POST | `/api/chat` | Send chat message |
| GET | `/api/sync` | Force refresh from sheets |

## Chat Flow

```
1. GREETING
   └── "Kia Ora! Welcome to NZ Tours..."
       ├── [Browse Packages]
       ├── [Plan Custom Trip]
       └── [Talk to AI Assistant]

2. DESTINATION
   ├── [North Island]
   ├── [South Island]
   ├── [Both Islands]
   └── [Not Sure - Recommend]

3. TRIP TYPE
   ├── [Adventure & Outdoors]
   ├── [Culture & Heritage]
   ├── [Nature & Wildlife]
   ├── [Food & Wine]
   └── [Mixed Experience]

4. DURATION
   ├── [3-5 Days]
   ├── [1 Week]
   ├── [2 Weeks]
   └── [Flexible]

5. BUDGET
   ├── [Budget ($500-$1,500)]
   ├── [Mid-Range ($1,500-$3,000)]
   ├── [Premium ($3,000-$5,000)]
   └── [Luxury ($5,000+)]

6. GROUP SIZE
   ├── [Solo Traveler]
   ├── [Couple]
   ├── [Small Group (3-5)]
   └── [Large Group (6+)]

7. SHOW PACKAGES
   └── Display matching packages as cards
```

## Deployment (Vercel)

### Backend

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Frontend

1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add `VITE_API_URL` environment variable pointing to backend URL
5. Deploy

## Features

- **Real-Time Google Sheets Sync**: 5-minute cache with manual refresh
- **Smart Package Matching**: Filter by region, type, duration, budget, group size
- **NZ-Specific Features**: Maori greetings, season-aware recommendations
- **Responsive Design**: Works on desktop and mobile
- **AI Chat**: Fall back to Gemini AI for custom questions

## License

MIT
