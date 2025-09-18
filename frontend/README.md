# Music Distribution Platform

A modern, comprehensive music distribution platform that enables artists to upload, manage, and distribute their music across all major streaming services including Spotify, Apple Music, YouTube Music, and more.

## 🎵 Features

- **Artist Dashboard** - Complete artist profile management with analytics
- **Music Upload & Distribution** - Seamless upload to 100+ streaming platforms
- **Real-time Analytics** - Track streams, revenue, and audience insights
- **Subscription Management** - Flexible pricing plans for artists
- **Support System** - Integrated ticketing system for artist support
- **Admin Panel** - Comprehensive backend management tools

## 🚀 Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Clerk for authentication
- Lucide React for icons
- Recharts for data visualization

**Backend:**
- Django REST Framework
- PostgreSQL database
- Celery for background tasks
- AWS S3 for file storage

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🌐 Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:5173
```

**Backend (.env):**
```
SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

## 📱 Live Demo

Visit https://tabmusic.ng/ to see the platform in action.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or support, reach out at [iamicepick@yahoo.com](mailto:iamicepick@yahoo.com)
