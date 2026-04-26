# GREEN-API Test Assignment

HTML page integrating with GREEN-API. Allows sending messages, fetching settings, and checking instance state via REST API.

## Local development

### Option 1 — Docker Compose (recommended)

```bash
docker compose up --build
```

Open http://localhost:8080 in your browser. Stop with `docker compose down`.

### Option 2 — Python HTTP server

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

## Deployment

On push to the `main` branch, GitHub Actions builds an artifact and publishes the page to GitHub Pages automatically.

## Usage

1. Create an instance at https://green-api.com/
2. Scan the QR code and link your phone number
3. Copy `idInstance` and `ApiTokenInstance` from the dashboard
4. Paste the values into the form on the page
5. Click the buttons:
   - **getSettings** — fetch instance settings
   - **getStateInstance** — check instance state
   - **sendMessage** — send a text message to a number
   - **sendFileByUrl** — send a file by URL

Results are displayed in the "Response" field on the right.

## Documentation

- [GREEN-API docs](https://green-api.com/docs/api/)
- [REST API methods](https://green-api.com/docs/api/)

## Requirements

- Modern browser with ES6+ support
- Internet access for GREEN-API calls
