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

    // Database
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
  }
}
