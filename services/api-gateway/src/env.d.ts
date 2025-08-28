declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    ALLOWED_ORIGINS?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    JWT_SECRET?: string;
    USER_SERVICE_URL?: string;
  }
}
