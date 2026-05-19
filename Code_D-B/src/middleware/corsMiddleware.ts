import cors, { CorsOptions } from 'cors';

const buildAllowedOrigins = (): string[] => {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';
  if (!raw) return ['http://localhost:3000'];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

const allowedOrigins = buildAllowedOrigins();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls (no Origin header) and known origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Development bypass
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 600,
};

export default cors(corsOptions);
