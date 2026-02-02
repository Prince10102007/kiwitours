# Google Sheets Setup Guide for NZ Tours Chatbot

This guide walks you through connecting your Google Sheet to the chatbot for real-time package synchronization.

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "NZ Tours Packages" (or any name you prefer)
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
   The Sheet ID is the long string between `/d/` and `/edit`

## Step 2: Set Up the Sheet Structure

In the first row (Row 1), add these exact column headers:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Name | Region | Type | Duration | Price | Group Size | Description | Highlights | Itinerary | Inclusions | Exclusions | Image URL | Gallery | Season | Status |

### Column Descriptions:

| Column | Header | Format | Example |
|--------|--------|--------|---------|
| A | ID | Text/Number | 1, 2, 3... |
| B | Name | Text | "Hobbiton & Rotorua Adventure" |
| C | Region | Text | "North Island", "South Island", or "Both" |
| D | Type | Text | "Adventure", "Culture", "Nature", "Food", or "Mixed" |
| E | Duration | Number | 3, 5, 7, 14 (days) |
| F | Price | Number | 1299, 3499 (NZD per person) |
| G | Group Size | Text | "2-8" or "1-12" (min-max) |
| H | Description | Text | Short package description |
| I | Highlights | Text | Comma-separated: "Hobbiton, Te Puia, Maori Culture" |
| J | Itinerary | Text | Comma-separated: "Day 1: Auckland, Day 2: Rotorua" |
| K | Inclusions | Text | Comma-separated: "Accommodation, Transport, Meals" |
| L | Exclusions | Text | Comma-separated: "Flights, Insurance, Personal expenses" |
| M | Image URL | URL | Main image URL (use Unsplash or your CDN) |
| N | Gallery | Text | Comma-separated image URLs |
| O | Season | Text | "All Year" or "Summer, Autumn" |
| P | Status | Text | "Active" or "Inactive" |

## Step 3: Add Sample Data

Copy this sample data starting from Row 2:

### Row 2:
```
1 | Hobbiton & Rotorua Adventure | North Island | Culture | 3 | 1299 | 2-12 | Experience the magic of Middle-earth at Hobbiton before exploring Rotorua's geothermal wonders and Maori culture. | Hobbiton Movie Set Tour, Te Puia Geothermal Valley, Maori Cultural Performance, Wai-O-Tapu Thermal Wonderland | Day 1: Auckland to Hobbiton and evening in Rotorua, Day 2: Te Puia and Maori village experience, Day 3: Wai-O-Tapu and return to Auckland | Accommodation, Transport, Hobbiton entry, Te Puia entry, Maori hangi dinner | Flights, Personal expenses, Travel insurance | https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800 | https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800 | All Year | Active
```

### Row 3:
```
2 | South Island Explorer | South Island | Adventure | 7 | 3499 | 2-8 | Journey through the stunning landscapes of the South Island from Queenstown's adventure capital to Milford Sound's majestic fjords. | Queenstown Adventure Activities, Milford Sound Cruise, Franz Josef Glacier, Mount Cook National Park | Day 1: Arrive Queenstown, Day 2: Adventure activities, Day 3: Milford Sound cruise, Day 4: Te Anau to Franz Josef, Day 5: Glacier exploration, Day 6: Mount Cook, Day 7: Christchurch departure | 6 nights accommodation, All transport, Milford Sound cruise, Glacier walk, Breakfast daily | Flights, Lunches and dinners, Optional activities, Travel insurance | https://images.unsplash.com/photo-1469521669194-babb45599def?w=800 | https://images.unsplash.com/photo-1508193638397-1c4234db14d9?w=800 | Summer, Autumn | Active
```

### Row 4:
```
3 | Ultimate NZ Experience | Both | Mixed | 14 | 6999 | 2-6 | The complete New Zealand journey covering both islands' must-see destinations with luxury accommodation. | Auckland City, Waitomo Caves, Rotorua, Wellington, Queenstown, Milford Sound, Christchurch | Days 1-2: Auckland exploration, Day 3: Waitomo glowworm caves, Days 4-5: Rotorua adventures, Day 6: Wellington city, Day 7: Flight to Queenstown, Days 8-10: Queenstown and surrounds, Day 11: Milford Sound, Days 12-13: West Coast glaciers, Day 14: Christchurch departure | 13 nights luxury accommodation, All transport including domestic flight, All major attractions, Daily breakfast, Selected dinners | International flights, Travel insurance, Personal expenses | https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800 | https://images.unsplash.com/photo-1513996203842-5dbed7b87c70?w=800 | All Year | Active
```

## Step 4: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a new project:**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: "NZ Tours Chatbot"
   - Click "Create"

3. **Enable Google Sheets API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. **Create a Service Account:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name: "nz-tours-sheets-reader"
   - Click "Create and Continue"
   - Role: Select "Viewer" (or skip)
   - Click "Done"

5. **Create a Key for the Service Account:**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON"
   - Click "Create"
   - A JSON file will download - **keep this safe!**

## Step 5: Share Your Sheet with Service Account

1. Open the downloaded JSON file
2. Find the `"client_email"` field - it looks like:
   ```
   "client_email": "nz-tours-sheets-reader@your-project.iam.gserviceaccount.com"
   ```
3. Copy this email address

4. Go back to your Google Sheet
5. Click "Share" button (top right)
6. Paste the service account email
7. Set permission to "Viewer"
8. Uncheck "Notify people"
9. Click "Share"

## Step 6: Configure the Backend

1. **Base64 encode your service account JSON:**

   **On Mac/Linux:**
   ```bash
   base64 -i path/to/your-service-account.json
   ```

   **On Windows (PowerShell):**
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\your-service-account.json"))
   ```

   **Online (if comfortable):**
   Use https://www.base64encode.org/ - paste the entire JSON content

2. **Create your `.env` file in the backend folder:**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit the `.env` file:**
   ```env
   # Your Google Sheet ID (from the URL)
   GOOGLE_SHEETS_ID=1nwIMlrjYaGcGNBzLvEXGDKj81cxJiaxQuPtNMxPaBtQ

   # The Base64-encoded service account JSON (one long line, no spaces)
   GOOGLE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Iiw...

   # Your Gemini API key (get from https://makersuite.google.com/app/apikey)
   GEMINI_API_KEY=your_gemini_api_key

   # CORS origins
   CORS_ORIGINS=["http://localhost:5173"]

   # Cache TTL (5 minutes = 300 seconds)
   CACHE_TTL_SECONDS=300
   ```

## Step 7: Test the Connection

1. **Start the backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Test the packages endpoint:**
   Open http://localhost:8000/api/packages in your browser

   You should see your Google Sheet data as JSON!

3. **Force refresh (after sheet updates):**
   Open http://localhost:8000/api/sync

## Troubleshooting

### "Error fetching from sheets" / Demo packages showing

- Verify the Sheet ID is correct
- Ensure the service account email has access to the sheet
- Check that the JSON key is properly base64 encoded
- Make sure Google Sheets API is enabled in your GCP project

### "Failed to decode service account key"

- The base64 string might have line breaks - remove them
- Ensure the entire JSON was encoded, not just part of it

### Packages not updating

- The cache lasts 5 minutes by default
- Use `/api/sync` endpoint to force refresh
- Or reduce `CACHE_TTL_SECONDS` in `.env`

### Column headers not matching

- Make sure Row 1 has exact headers: ID, Name, Region, Type, Duration, Price, Group Size, Description, Highlights, Itinerary, Inclusions, Exclusions, Image URL, Gallery, Season, Status
- Headers are case-insensitive but must match the words

## Adding/Updating Packages

Simply edit your Google Sheet:
1. Add a new row with package data
2. Set Status to "Active"
3. Wait up to 5 minutes (or call `/api/sync`)
4. The chatbot will show the new package!

To remove a package, change its Status to "Inactive".

## Image URLs

For package images, you can use:
- **Unsplash**: Free high-quality images
  - Go to unsplash.com, find an image
  - Right-click > Copy image address
  - Add `?w=800` for optimized size

- **Your own hosting**: Upload to Cloudinary, AWS S3, or any CDN

- **Google Drive** (not recommended): Images must be publicly shared and use special URL format
