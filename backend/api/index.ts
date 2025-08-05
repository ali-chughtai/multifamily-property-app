import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../src/trpc';
import { initializeDatabase } from '../src/utils/db';
import { AppError } from '../src/utils/errors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

let dbInitialized = false;
let dbInitializing = false;

const ensureDatabase = async () => {
  if (dbInitialized) return;
  
  if (dbInitializing) {
    while (dbInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  dbInitializing = true;
  try {
    await initializeDatabase();
    dbInitialized = true;
  } catch (error) {
    throw error;
  } finally {
    dbInitializing = false;
  }
};

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || '']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', async (req, res) => {
  try {
    await ensureDatabase();
    res.json({
      message: 'Multifamily Property Backend API',
      status: 'running',
      endpoints: {
        health: '/health',
        trpc: '/trpc',
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    await ensureDatabase();
    const { query } = await import('../src/utils/db');
    await query('SELECT 1');
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use('/trpc', async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Database initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error, type, path, input }) => {
      throw new Error(error.message);
      
    },
  })
);

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      statusCode: error.statusCode
    });
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
});

export default app;