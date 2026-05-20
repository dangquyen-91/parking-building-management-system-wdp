import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import errorMiddleware from './middlewares/error.middleware.js';
import { apiLimiter, authLimiter } from './middlewares/rate-limit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import buildingRoutes from './routes/building.routes.js';
import floorRoutes from './routes/floor.routes.js';
import logger from './utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDocument = YAML.load(join(__dirname, '../swagger.yaml'));

const app = express();

connectDB().catch((err) => {
  logger.error('Failed to connect to MongoDB', { error: err.message });
  process.exit(1);
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buildings', buildingRoutes);
app.use('/api/v1/floors', floorRoutes);

app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'OK', data: { env: process.env.NODE_ENV } })
);

app.use((_req, res) => res.status(404).json({ status: 'fail', message: 'Route not found' }));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

export default app;
