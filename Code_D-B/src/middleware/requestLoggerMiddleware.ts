import morgan from 'morgan';
import { Request } from 'express';
import { logger } from '../utils';

/**
 * Pipe Morgan's HTTP log output through Winston.
 */
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

const skipRoutes = ['/health', '/favicon.ico'];

const skipFn = (req: Request): boolean => skipRoutes.includes(req.originalUrl);

const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

export default morgan(format, {
  stream: morganStream,
  skip: skipFn,
});
