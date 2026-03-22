# Email Automation App

Professional full-stack email automation platform with role-based access, contact directory management, CSV import/export, dashboard analytics, and n8n webhook integration.

## Overview

This project provides a complete workflow for managing outreach operations:

- Authenticate users (`ADMIN`, `OPERATOR`)
- Manage contacts (create, update, delete, search)
- Send emails through n8n webhooks
- Track status, logs, and dashboard statistics
- Import/export records using CSV
- Optional Google Sheets synchronization layer

## Tech Stack

### Backend

- Java 21
- Spring Boot 3.2.3
- Spring Web + WebFlux (`WebClient` for n8n calls)
- Maven

### Frontend

- HTML, CSS, Vanilla JavaScript
- Hosted locally via Python HTTP server

### Integrations

- n8n Webhook (email workflow trigger)
- Google Sheets API (optional service-account based storage)

## Repository Structure

```text
EmailAutomation_app/
  backend/
    src/main/java/com/wenxt/emailautomation/
      config/
      controller/
      model/
      service/
    src/main/resources/application.properties
    pom.xml
  frontend/
    index.html
    app.js
    style.css
    logo.png
  BACKEND_COMPLETE_BUILD_DOCUMENTATION.md
  COMPLETE_TESTING_GUIDE.md
```

## Key Features

- Role-based authentication with token sessions (`X-Auth-Token`)
- Contact directory CRUD with search
- Send and add-and-send email flows
- Dashboard metrics (`queue`, `sent`, `viewed`, `failed`, `total`)
- CSV export/import utilities (admin-restricted)
- CORS configured for local frontend usage

## Configuration

Edit [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties):

```properties
server.port=8080
n8n.webhook.url=https://unfledged-dayle-forcedly.ngrok-free.dev/webhook/send-email
google.sheets.id=<your-google-sheet-id>
```

### Important Notes

- For local n8n testing, you can temporarily use:
  - `http://localhost:5678/webhook-test/send-email` (editor test mode)
  - `http://localhost:5678/webhook/send-email` (active workflow mode)
- Add Google credentials file if using Sheets:
  - `backend/src/main/resources/credentials.json`

## Run Locally

### Prerequisites

- Java 21
- Maven 3.9+
- Python 3

### 1. Start Backend

```powershell
cd d:\EmailAutomation_app\backend
mvn spring-boot:run
```

Backend health endpoint:

- `http://localhost:8080/api/health`

### 2. Start Frontend

```powershell
cd d:\EmailAutomation_app\frontend
python -m http.server 5500
```

Frontend URL:

- `http://localhost:5500`

## Demo Accounts

- `admin / admin123` (full access)
- `operator / operator123` (restricted from admin-only endpoints)

## API Summary

Base path: `/api`

- `GET /health`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /persons`
- `GET /search?query=...`
- `POST /persons`
- `PUT /persons/{email}`
- `DELETE /persons/{email}`
- `POST /send`
- `POST /add-and-send`
- `GET /logs`
- `GET /stats`
- `GET /export/csv` (admin)
- `POST /import/csv` (admin)

## n8n Integration Behavior

- Backend calls configured `n8n.webhook.url` via HTTP POST.
- If n8n returns empty or invalid response, backend marks operation as failed and returns an error to frontend.
- For reliable success handling, configure n8n workflow to return JSON from a **Respond to Webhook** node, e.g.:

```json
{
  "status": "sent",
  "message": "Email sent"
}
```

## Testing

For complete step-by-step validation:

- [BACKEND_COMPLETE_BUILD_DOCUMENTATION.md](BACKEND_COMPLETE_BUILD_DOCUMENTATION.md)
- [COMPLETE_TESTING_GUIDE.md](COMPLETE_TESTING_GUIDE.md)

## Security and Operations Notes

- Do not commit real secrets (`credentials.json`, API keys, `.env`).
- Keep n8n workflow active when using production webhook URLs.
- Restrict admin credentials and rotate them for production deployments.

## Future Improvements

- Move auth/session to persistent storage (JWT + DB/Redis)
- Add automated unit/integration tests in CI
- Add Docker support for backend/frontend/n8n stack
- Add structured logging and observability pipeline

## License

This project currently has no explicit license file. Add one (for example, MIT) before public distribution if needed.
