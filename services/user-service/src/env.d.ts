declare namespace NodeJS {
  interface ProcessEnv {
    // Server
    PORT?: string;
    NODE_ENV?: string;

    // Auth
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRES_IN: string;

    // OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    SESSION_SECRET: string;

    // Database
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;

    // Email / SMTP
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM_NAME: string;
    EMAIL_FROM_ADDRESS: string;

    // Frontend URL
    FRONTEND_URL: string;
  }
}
