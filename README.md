# Django Music Distribution Backend

## Project Structure

```
music-distribution/
├── manage.py                          # Django management script
├── requirements.txt                   # Python dependencies
├── .env                              # Environment variables
├── docker-compose.yml                # Docker configuration
├── Dockerfile                        # Docker build file
│
├── music_distribution_backend/        # Django project settings
│   ├── __init__.py
│   ├── settings.py                   # Main settings
│   ├── urls.py                       # URL routing
│   ├── wsgi.py                       # WSGI application
│   └── asgi.py                       # ASGI application
│
├── src/                              # Source code
│   └── apps/                         # Django applications
│       ├── users/                    # User management
│       ├── songs/                    # Song management
│       ├── artists/                  # Artist management
│       ├── payments/                 # Payment processing
│       ├── analytics/                # Analytics & reporting
│       └── admin_panel/              # Admin functionality
│
├── frontend/                         # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── media/                           # User uploaded files
├── static/                          # Static files (CSS, JS, images)
├── templates/                       # Django templates
├── logs/                           # Application logs
└── scripts/                        # Utility scripts
    ├── test_*.py                   # Test scripts
    ├── debug_*.py                  # Debug utilities
    └── migrate_apps.py             # Migration scripts
```

## Key Features

### Backend (Django)
- **User Management**: Authentication, profiles, permissions
- **Song Management**: Upload, metadata, distribution
- **Artist Management**: Artist profiles and relationships
- **Payment Processing**: Subscription, transactions via Paystack
- **Analytics**: Usage tracking and reporting
- **Admin Panel**: Administrative functionality

### Frontend (React)
- Modern React with Vite
- Authentication context
- File upload with progress
- Dashboard with analytics
- Responsive design with Tailwind CSS

### Storage & Database
- **Database**: PostgreSQL (production) / SQLite (development)
- **File Storage**: AWS S3 (production) / Local storage (development)
- **Cache**: Redis for sessions and caching

### Deployment
- Docker containerization
- Environment-based configuration
- Production-ready settings

## Installation & Setup

1. **Clone repository**
   ```bash
   git clone <repository>
   cd music-distribution
   ```

2. **Backend setup**
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment variables**
   Copy `.env.example` to `.env` and configure:
   - Database settings
   - AWS S3 credentials
   - Paystack API keys
   - Secret keys

## Development

- **Backend**: Django 5.2+ with REST Framework
- **Frontend**: React 18+ with Vite
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT tokens with refresh
- **File Upload**: Multipart uploads to S3
- **Real-time**: WebSocket support ready

## API Endpoints

- `POST /api/auth/login/` - User authentication
- `GET /api/songs/` - List songs
- `POST /api/songs/` - Upload new song
- `GET /api/artists/` - List artists
- `POST /api/payments/` - Process payments
- `GET /api/analytics/` - Get analytics data
