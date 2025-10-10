# StudyBuddy AI 🤖📚

An intelligent learning assistant platform that helps students learn more effectively through AI-powered study tools and personalized learning experiences.

## 📸 Screenshots

![Login](screenshots/auth-form.png)
_Clean and intuitive authentication interface with login and registration functionality_

![Dashboard](screenshots/dashboard.png)
_Main dashboard featuring study method selection cards including flashcards, quizzes, chat, presentations, and podcasts_

![Flash Cards](screenshots/flash-cards.png)
_AI-powered flashcard generator that creates personalized study cards from any topic for efficient memorization and quick review sessions_

![Quiz](screenshots/quiz.png)
_Customizable quiz generator with adjustable difficulty levels, question count, and multiple question types (multiple choice, true/false, short answer) with percentage distribution control_

![Chat Interface](screenshots/new-chat.png)
_Chat interface with AI assistant, featuring multi-modal input options and chat history sidebar_

![Chat Session](screenshots/chat-session.png)
_Active chat session showing AI-powered responses with conversation history in the sidebar_

![Presentation](screenshots/presentation.png)
_Video presentation generator with AI voiceover narration, allowing customization of slide count, duration, and style for automated slideshow creation_

![Podcast](screenshots/podcast.png)
_AI-powered podcast generator with customizable duration, voice style, and format options (solo host, solo + guest, two hosts, or two + guest) for engaging audio learning experiences_

![User Settings](screenshots/user-settings.png)
_Personalized settings dashboard with profile customization, including user information, learning level preferences, study goals, and account management options_

## 🏗️ Architecture

```
studybuddy-ai-platform/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── services/
│   ├── api-gateway/         # Express.js API Gateway
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── user-service/        # User management microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ai-service/          # AI processing service (Python FastAPI)
│   │   ├── app/
│   │   ├── logs/
│   │   ├── Dockerfile
│   │   └── pyproject.toml
├── docker-compose.yml       # Production deployment
├── docker-compose.dev.yml   # Development containers
├── .gitignore
└── README.md
```

### Technology Stack

**Frontend**

- React 19 with TypeScript
- Vite for fast development and building
- React Router DOM for navigation
- Zustand for state management
- Tailwind CSS 4 + DaisyUI for styling
- Lucide React for comprehensive icon library
- Testing Library suite for testing

**Backend Services**

- Node.js with Express.js 5
- TypeScript with tsx for development
- TypeORM with PostgreSQL database
- JWT authentication with bcryptjs
- Security middleware (Helmet, CORS, Rate Limiting)
- Morgan for logging
- Nodemailer for email services

**Infrastructure**

- Docker & Docker Compose for full containerization
- PostgreSQL 15 (separate databases for users and documents)
- MongoDB 7 for AI service data
- Multi-stage Docker builds for production optimization
- Health checks and dependency management
- PgAdmin and Mongo Express for database management (dev mode)
- Redis for caching (planned)
- WebSocket for real-time features (planned)

**AI Integration**

- Python 3.13+ with FastAPI for AI services
- Poetry for dependency management and project scripts
- OpenAI GPT integration (planned)
- Google Gemini API (planned)
- Pydantic for data validation and settings management
- Structured logging with structlog
- Uvicorn ASGI server with standard extras

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Python 3.13+ installed
- Poetry installed for Python dependency management
- Docker Desktop running
- npm or yarn package manager

### Quick Demo (Production Mode)

For a complete demo of the application:

```bash
git clone <your-repo-url>
cd studybuddy-ai-platform
docker-compose up -d
```

This will start:

- Frontend at `http://localhost:3000`
- API Gateway at `http://localhost:3001`
- User Service at `http://localhost:5001`
- AI Service at `http://localhost:5002` (Python FastAPI)
- PostgreSQL database with health checks

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd studybuddy-ai-platform
   ```

2. **Start the databases**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

   This will start:

   - PostgreSQL for users (port 5432)
   - PostgreSQL for documents (port 5433)
   - MongoDB for AI services (port 27017)
   - PgAdmin (port 8080) and Mongo Express (port 8081) for database management

3. **Start the API Gateway**

   ```bash
   cd services/api-gateway
   npm install
   npm run dev
   ```

4. **Start the User Service**

   ```bash
   cd services/user-service
   npm install
   npm run dev
   ```

5. **Start the AI Service**

   ```bash
   cd services/ai-service
   poetry install
   poetry run ai-service
   ```

6. **Start the Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The main application will be available at `http://localhost:3000` with either the Login/Register page or the Dashboard as the landing page.

### Environment Setup

Create `.env` files in each service directory with the required environment variables:

**Frontend (.env)**

```
VITE_API_URL=http://localhost:3001
```

**API Gateway (.env)**

```
PORT=3001
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**User Service (.env)**

```
PORT=5001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/studybuddy_users
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**AI Service (.env)**

```
HOST=0.0.0.0
PORT=5002
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Database Access

The project includes development database management tools:

- **PgAdmin**: Available at `http://localhost:8080`
  - Email: `admin@studybuddy.com`
  - Password: `admin123`
- **Mongo Express**: Available at `http://localhost:8081`
  - Username: `admin`
  - Password: `admin123`

## 🔧 Development

### User Interface Features

The application flow centers around the Dashboard landing page:

**Dashboard (Landing Page)**

- **Study Method Selection**: Choose from five learning methods:
  - **Flash Cards**: Interactive memorization cards
  - **Quiz**: Test your knowledge with generated questions
  - **Chat**: AI-powered conversational learning assistant
  - **Presentation**: Visual learning slides
  - **Podcast**: Audio learning experience
- **Personalized Learning**: Each method creates content tailored to your learning style
- **Responsive Design**: Grid layout adapts from mobile to desktop

**Chat Interface (via Dashboard → Chat button)**

- **Multi-Modal Input**: Support for text, file uploads, voice input, and camera integration
- **Session Management**: Chat history accessible through the sidebar with timestamps
- **Real-time AI Responses**: Streaming responses from AI service
- **Quick Start**: Create new chat sessions or continue existing conversations

### Deployment Modes

**Production Mode (Full Demo)**

```bash
# Start entire application stack
docker-compose up -d

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f [service-name]
```

**Development Mode (Hot Reload)**

```bash
# Start only databases
docker-compose -f docker-compose.dev.yml up -d

# Run services individually with hot reload
cd services/api-gateway && npm run dev
cd services/user-service && npm run dev
cd services/ai-service && poetry run ai-service
cd frontend && npm run dev
```

### Available Scripts

**Frontend**

- `npm run dev` - Start Vite development server
- `npm run build` - TypeScript compile + Vite build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

**API Gateway**

- `npm run dev` - Start with tsx hot reload
- `npm run build` - Build TypeScript to dist/
- `npm start` - Run production build

**User Service**

- `npm run dev` - Start with tsx hot reload
- `npm run build` - Build TypeScript to dist/
- `npm start` - Run production build
- `npm run migration:generate` - Generate TypeORM migrations
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run schema:drop` - Drop database schema

**AI Service**

- `poetry install` - Install dependencies
- `poetry run ai-service` - Start FastAPI development server
- `poetry run pytest` - Run tests (requires dev dependencies)
- `poetry install --with dev` - Install with development dependencies

### Testing

```bash
# Run frontend tests with Testing Library
cd frontend && npm run lint

# Database migrations (user service)
cd services/user-service
npm run migration:generate src/migrations/MigrationName
npm run migration:run

# AI service tests
cd services/ai-service
poetry install --with dev
poetry run pytest
```

## 📋 Roadmap

### Phase 1: Core Platform ✅

- [x] Basic project structure
- [x] Frontend setup with React + TypeScript
- [x] Dashboard landing page with study method selection
- [x] Chat interface with multi-modal input support
- [x] Sidebar with chat history management
- [x] API Gateway implementation
- [x] User service with authentication
- [x] Database setup with Docker
- [x] AI service foundation with Python FastAPI and Poetry

### Phase 2: AI Integration 🚧

- [x] OpenAI API integration for chat responses
- [x] Real-time streaming AI responses
- [x] Frontend-backend WebSocket/streaming communication
- [ ] Google Gemini API integration
- [ ] Context-aware responses based on selected study methods
- [ ] File upload processing for documents and images
- [ ] Voice input transcription and processing

### Phase 3: Enhanced Learning Tools 📅

- [ ] Interactive flashcard system with spaced repetition
- [ ] Adaptive quiz generation with multiple question types
- [ ] Presentation generator with visual slides
- [ ] Podcast creator with text-to-speech integration
- [ ] Progress tracking and learning analytics
- [ ] Personalized learning path recommendations

### Phase 4: Advanced Features 📅

- [ ] Collaborative study sessions and group features
- [ ] Mobile app with offline capabilities
- [ ] Advanced document processing and content extraction
- [ ] Real-time notifications and reminders
- [ ] Performance optimization and caching
- [ ] Cross-method learning integration

## 🎯 Project Goals

This project demonstrates:

- **Comprehensive Learning Platform**: Multi-method approach to personalized education
- **Modern Dashboard Interface**: Clean, intuitive study method selection with clear navigation
- **Full-Stack Development**: React frontend with comprehensive backend microservices
- **Production-Ready Architecture**: Complete Docker containerization with health checks
- **Microservices Design**: Proper service separation with API Gateway pattern
- **Educational Technology**: Practical application of AI for diverse learning experiences
- **Multi-Language Backend**: Node.js services with Python AI processing
- **User Experience Focus**: Multi-modal input support and responsive design
- **Database Architecture**: Multi-database setup with service isolation
- **DevOps Best Practices**: Development and production environments with dependency management
- **Scalable Infrastructure**: Container orchestration ready for cloud deployment
- **Security Implementation**: JWT auth, rate limiting, CORS, and security headers
- **Real-World Application**: Solving actual problems in educational technology
