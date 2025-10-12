import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeDatabase } from './config/database';
import './config/passport';
import passport from './config/passport';
import routes from './routes';
import { errorHandler } from './middleware/errorHandlerMiddleware';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

const startServer = async () => {
  try {
    await initializeDatabase();

    app.use(helmet());
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());

    // Session middleware (required for Passport OAuth)
    app.use(
      session({
        secret:
          process.env.SESSION_SECRET ||
          'fallback-session-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          maxAge: 10 * 60 * 1000, // 10 minutes
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(routes);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
