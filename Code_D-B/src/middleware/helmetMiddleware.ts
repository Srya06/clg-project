import helmet from 'helmet';

/**
 * Security headers for a REST API.
 */
export default helmet({
  contentSecurityPolicy: false,

  crossOriginResourcePolicy: { policy: 'cross-origin' },

  hsts:
    process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
});
