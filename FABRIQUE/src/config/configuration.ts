import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API configuration
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || '1.0',
    title: process.env.API_TITLE || 'Fabrique API',
    description: process.env.API_DESCRIPTION || 'API for Fabrique Manufacturing System',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  
  // Rate limiting
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60, // seconds
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100, // requests per TTL
  },
  
  // Swagger documentation
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV !== 'production',
    path: process.env.SWAGGER_PATH || 'docs',
    title: process.env.SWAGGER_TITLE || 'Fabrique API',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for Fabrique Manufacturing System',
    version: process.env.SWAGGER_VERSION || '1.0',
    contact: {
      name: process.env.SWAGGER_CONTACT_NAME || 'Support',
      url: process.env.SWAGGER_CONTACT_URL || 'https://example.com/support',
      email: process.env.SWAGGER_CONTACT_EMAIL || 'support@example.com',
    },
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || 'logs',
    maxFiles: process.env.LOG_MAX_FILES || '30d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    zippedArchive: process.env.LOG_ZIPPED_ARCHIVE === 'true' || false,
  },
  
  // Job configuration
  jobs: {
    maxRetries: parseInt(process.env.JOB_MAX_RETRIES, 10) || 3,
    retryDelay: parseInt(process.env.JOB_RETRY_DELAY, 10) || 5000, // ms
    timeout: parseInt(process.env.JOB_TIMEOUT, 10) || 300000, // 5 minutes
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 10,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  },
  
  // Database
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'fabrique',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    logging: process.env.DB_LOGGING === 'true' || false,
  },
  
  // Redis (for caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600, // 1 hour
  },
  
  // File uploads
  uploads: {
    directory: process.env.UPLOAD_DIRECTORY || 'uploads',
    maxFileSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
  },
}));
