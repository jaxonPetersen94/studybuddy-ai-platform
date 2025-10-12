declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    ALLOWED_ORIGINS?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    JWT_SECRET?: string;
    USER_SERVICE_BASE_URL?: string;
    AI_SERVICE_BASE_URL?: string;
    USER_SERVICE_CLIENT_URL?: string;
    AI_SERVICE_CLIENT_URL?: string;
  }
}
