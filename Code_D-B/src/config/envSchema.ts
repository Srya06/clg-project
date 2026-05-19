import Joi from 'joi';

const envSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),

  // Database - REQUIRED
  MONGODB_URI: Joi.string().required().description('MongoDB connection string'),

  // JWT - REQUIRED
  JWT_SECRET: Joi.string().min(32).required().description('JWT signing secret'),
  JWT_EXPIRE: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().description('Refresh token secret'),
  JWT_REFRESH_EXPIRE: Joi.string().default('7d'),

  // OpenAI - optional if using Gemini
  OPENAI_API_KEY: Joi.string().optional().description('OpenAI API key'),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: Joi.number().default(2000),

  // GitHub OAuth
  GITHUB_CLIENT_ID: Joi.string().optional().allow(''),
  GITHUB_CLIENT_SECRET: Joi.string().optional().allow(''),
  GITHUB_CALLBACK_URL: Joi.string().uri().optional().allow(''),

  // Email (for notifications)
  EMAIL_HOST: Joi.string().default('smtp.gmail.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().email().required().description('Email for sending notifications'),
  EMAIL_PASS: Joi.string().required().description('Email app password'),

  // CORS - REQUIRED
  FRONTEND_URL: Joi.string().uri().required().description('Frontend application URL'),
  CORS_ORIGINS: Joi.string().required().description('Comma-separated allowed origins'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(5242880),
  ALLOWED_RESUME_TYPES: Joi.string().default('application/pdf'),

  // n8n Webhook
  N8N_WEBHOOK_URL: Joi.string().uri().optional().allow(''),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown(true); // Allow OS-level env vars so Node doesn't crash

export default envSchema;
