# Setup Guide: Clone and Run on Another Computer

This guide helps you clone, configure, and run the Email Automation App on a new machine.

## 1. Prerequisites

Install the following tools first:

- Git
- Java 21 (JDK)
- Maven 3.9+
- Python 3
- (Optional) VS Code
- (Optional) n8n (for local webhook testing)

Quick checks:

```powershell
git --version
java -version
mvn -version
python --version
```

## 2. Clone the Repository

Use your GitHub URL:

```powershell
git clone https://github.com/Da-ya7/email-automation_app.git
cd email-automation_app
```

## 3. Checkout the Main Working Branch

If you want the same branch currently used for development:

```powershell
git fetch --all
git checkout appmod/java-upgrade-20260316104308
```

Or if you want latest default branch:

```powershell
git checkout main
```

## 4. Project Structure

```text
email-automation_app/
  backend/
  frontend/
  README.md
  BACKEND_COMPLETE_BUILD_DOCUMENTATION.md
  COMPLETE_TESTING_GUIDE.md
```

## 5. Backend Setup (Spring Boot)

### 5.1 Go to backend folder

```powershell
cd backend
```

### 5.2 Configure application properties

Edit file:

- `backend/src/main/resources/application.properties`

Set values for your environment:

- `server.port=8080`
- `n8n.webhook.url=<your-webhook-url>`
- `google.sheets.id=<your-sheet-id>`

### 5.3 Optional Google Sheets credentials

If you use Google Sheets integration, place credentials here:

- `backend/src/main/resources/credentials.json`

If not provided, app still runs but Sheets operations log warnings.

### 5.4 Run backend

```powershell
mvn spring-boot:run
```

Health check:

- http://localhost:8080/api/health

## 6. Frontend Setup

Open a second terminal from repo root:

```powershell
cd frontend
python -m http.server 5500
```

Frontend URL:

- http://localhost:5500

## 7. Login Credentials

Use demo users:

- Admin: `admin` / `admin123`
- Operator: `operator` / `operator123`

## 8. n8n Webhook Setup

The backend sends email requests to n8n webhook URL in `application.properties`.

### Production-style URL

Example:

- `https://<your-ngrok-or-domain>/webhook/send-email`

### Local n8n testing

Use one of these depending on workflow mode:

- `http://localhost:5678/webhook-test/send-email` (editor test mode)
- `http://localhost:5678/webhook/send-email` (active workflow mode)

Recommended in n8n workflow:

1. Webhook node method = `POST`
2. Add email sending node
3. Add `Respond to Webhook` node with JSON response, for example:

```json
{
  "status": "sent",
  "message": "Email sent"
}
```

## 9. Verify End-to-End Quickly

1. Start backend (`8080`)
2. Start frontend (`5500`)
3. Login in UI
4. Send a test email from Compose page
5. Check n8n execution log

## 10. Daily Development Workflow on New Machine

From repo root:

```powershell
git pull origin appmod/java-upgrade-20260316104308
```

Create your feature branch:

```powershell
git checkout -b feature/your-change
```

After changes:

```powershell
git add -A
git commit -m "feat: your change"
git push -u origin feature/your-change
```

Then create a Pull Request in GitHub.

## 11. Common Issues

### Maven not found

Install Maven and reopen terminal.

### Java version mismatch

Ensure Java 21 is active:

```powershell
java -version
```

### Backend says webhook error or empty response

Check n8n is running, workflow is active, and webhook path/method matches.

### CORS issues in browser

Ensure frontend is served from `http://localhost:5500` and backend is on `http://localhost:8080`.

## 12. Recommended Next Step

After successful setup, run through:

- `COMPLETE_TESTING_GUIDE.md`

for full API + UI validation.
