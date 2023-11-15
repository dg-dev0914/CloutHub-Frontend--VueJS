import * as winston from 'winston';
import { format } from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: (process.env.LOG_NAME || 'ch-desktop') },
  transports: [
    new winston.transports.Http({ host: 'api.efficientlogs.com', ssl: true, path: '/track' }),
  ],
  exitOnError: false,
});

export default logger;
