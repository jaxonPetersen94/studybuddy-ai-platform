# StudyBuddy AI 🤖📚

An intelligent learning assistant platform that helps students learn more effectively through AI-powered study tools and personalized learning experiences.

## 📸 Screenshots

![StudyBuddy AI Login](screenshots/auth-form.png)
_Clean and intuitive authentication interface with login and registration functionality_

![StudyBuddy AI Landing Page](screenshots/new-chat.png)
_Main landing page featuring subject selection cards and quick action prompts for starting learning sessions_

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
│   ├── ai-service/          # AI processing service (planned)
│   └── document-service/    # Document processing (planned)
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

**AI Integration** (Planned)

- OpenAI GPT integration
- Google Gemini API
- Python FastAPI for AI services

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
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

- Frontend at `http://localhost:3000` (Main StudyBuddy interface)
- API Gateway at `http://localhost:3001`
- User Service at `http://localhost:5001`
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

5. **Start the Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The main application will be available at `http://localhost:3000` with the NewChat interface as the landing page.

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
PORT=3002
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/studybuddy_users
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
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

The NewChat component serves as the main interaction hub:

- **Subject Selection**: Click on programming, math, science, languages, writing, or business cards to focus your learning session
- **Quick Actions**: Use pre-built prompts for common learning tasks like explanations, quizzes, and study guides
- **Multi-Modal Input**: Support for text, file uploads, voice input, and camera integration
- **Chat History**: Access previous learning sessions through the sidebar with timestamps and starred conversations
- **Responsive Design**: Optimized for desktop and mobile learning experiences

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

### Testing

```bash
# Run frontend tests with Testing Library
cd frontend && npm run lint

# Database migrations (user service)
cd services/user-service
npm run migration:generate src/migrations/MigrationName
npm run migration:run
```

## 📋 Roadmap

### Phase 1: Core Platform ✅

- [x] Basic project structure
- [x] Frontend setup with React + TypeScript
- [x] Interactive NewChat landing page with subject selection
- [x] Quick action prompts for learning tasks
- [x] Chat interface with multi-modal input support
- [x] Sidebar with chat history management
- [x] API Gateway implementation
- [x] User service with authentication
- [x] Database setup with Docker

### Phase 2: AI Integration 🚧

- [ ] OpenAI API integration for chat responses
- [ ] Real-time AI processing for study materials
- [ ] Context-aware responses based on selected subjects
- [ ] File upload processing for documents and images
- [ ] Voice input transcription and processing

### Phase 3: Enhanced Learning Tools 📅

- [ ] Advanced study guide generation with structured content
- [ ] Interactive flashcard system with spaced repetition
- [ ] Adaptive quiz generation based on performance
- [ ] Progress tracking and learning analytics
- [ ] Personalized learning path recommendations

### Phase 4: Advanced Features 📅

- [ ] Collaborative study sessions and group features
- [ ] Mobile app with offline capabilities
- [ ] Advanced document processing and content extraction
- [ ] Real-time notifications and reminders
- [ ] Performance optimization and caching

## 🎯 Project Goals

This project demonstrates:

- **Modern Learning Interface**: Intuitive subject-based navigation with AI-powered quick actions
- **Full-Stack Development**: React frontend with comprehensive backend microservices
- **Production-Ready Architecture**: Complete Docker containerization with health checks
- **Microservices Design**: Proper service separation with API Gateway pattern
- **Educational Technology**: Practical application of AI for personalized learning experiences
- **User Experience Focus**: Multi-modal input support and responsive design
- **Database Architecture**: Multi-database setup with service isolation
- **DevOps Best Practices**: Development and production environments with dependency management
- **Scalable Infrastructure**: Container orchestration ready for cloud deployment
- **Security Implementation**: JWT auth, rate limiting, CORS, and security headers
- **Real-World Application**: Solving actual problems in educational technology
