# AI MediScan Backend

> A calm, intelligent, and trustworthy pharmaceutical companion - Backend API

## 🏗️ Architecture

**Framework:** FastAPI (Python 3.11+)  
**Deployment:** Google Cloud Run (Containerized)  
**AI:** Google Gemini (Vision + Chat)  
**Auth:** Firebase Authentication  
**Storage:** Google Cloud Storage + Cloud SQL (PostgreSQL) + Firestore

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Google Cloud Project
- Firebase Project
- Gemini API Key

### Local Development

1. **Install dependencies:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run development server:**
```bash
# Sans auto-reload (recommandé - pas de --reload)
uvicorn app.main:app --host 0.0.0.0 --port 8888

# Ou utiliser le script
# Windows: start.bat
# Linux/Mac: ./start.sh
```

4. **Access API docs:**
- Swagger UI: http://localhost:8080/api/v1/docs
- ReDoc: http://localhost:8080/api/v1/redoc

## 🐳 Docker

### Build
```bash
docker build -t mediscan-backend .
```

### Run
```bash
docker run -p 8080:8080 --env-file .env mediscan-backend
```

## ☁️ Google Cloud Deployment

### Manual Deployment

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy to Cloud Run
gcloud run deploy mediscan-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

### Automated CI/CD

Push to main branch triggers automatic deployment via Cloud Build.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/        # API route handlers
│   │   │   ├── scan.py       # Medication scanning
│   │   │   ├── assistant.py  # AI chat
│   │   │   ├── history.py    # User history
│   │   │   ├── medication.py # Medication database
│   │   │   └── feedback.py   # User feedback
│   │   └── routes.py         # Route configuration
│   ├── core/
│   │   ├── exceptions.py     # Custom exceptions
│   │   └── logging_config.py # Structured logging
│   ├── middleware/
│   │   ├── rate_limiter.py   # Rate limiting
│   │   └── security.py       # Security headers
│   ├── models/
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── medication.py     # Database models
│   │   └── schemas.py        # Pydantic schemas
│   ├── services/
│   │   ├── auth_service.py   # Firebase auth
│   │   ├── firebase_service.py # Firestore operations
│   │   ├── gemini_service.py  # AI integration
│   │   └── storage_service.py # GCS operations
│   ├── config.py             # Configuration
│   └── main.py               # FastAPI application
├── Dockerfile
├── requirements.txt
└── README.md
```

## 🔒 Security

- **JWT Validation:** Firebase token verification
- **Rate Limiting:** 20 req/min per user
- **Input Validation:** Pydantic schemas
- **Security Headers:** CORS, CSP, HSTS
- **Medical Disclaimer:** Mandatory for all responses

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## 📊 Monitoring

- **Logging:** Structured logs with structlog
- **Errors:** Sentry integration
- **Metrics:** Cloud Run metrics
- **Tracing:** Cloud Trace

## 🔧 Environment Variables

See `.env.example` for all configuration options.

**Critical variables:**
- `GEMINI_API_KEY`: Google Gemini API key
- `FIREBASE_PROJECT_ID`: Firebase project
- `GOOGLE_CLOUD_PROJECT`: GCP project
- `DB_PASSWORD`: PostgreSQL password

## 📝 API Documentation

### Core Endpoints

**POST /api/v1/scan**
- Upload medication image
- Returns AI analysis

**POST /api/v1/assistant/chat**
- Chat with AI assistant
- Get pharmaceutical guidance

**GET /api/v1/history**
- Retrieve scan history

**POST /api/v1/feedback**
- Submit user feedback

## 🤝 Contributing

1. Follow Python PEP 8 style guide
2. Add type hints to all functions
3. Write docstrings for public APIs
4. Add tests for new features
5. Update documentation

## 📄 License

Proprietary - All rights reserved

## 💙 Support

For issues or questions, contact the development team.

---

**Built with ❤️ to create emotions, not just apps.**


