
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter, authLimiter } from './middleware/rateLimit.js';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import shippingRoutes from './routes/shipping.js';
import inventoryRoutes from './routes/inventory.js';
import backupRoutes from './routes/backup.js';
import botOrdersRoutes from './routes/botOrders.js';
import chatLogsRoutes from './routes/chatLogs.js';
import liveChatRoutes from './routes/liveChat.js';
import serialsRoutes from './routes/serials.js';
import techniciansRoutes from './routes/technicians.js';
import stopdesksRoutes from './routes/stopdesks.js';
import notificationsRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Security Headers - يمنع XSS
app.use(helmet({
  contentSecurityPolicy: false, // سنضيفها بشكل مخصص
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({ 
  origin: [
    'https://dzboard-dz.vercel.app',
    'https://dzboard.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// ✅ Rate Limiting
app.use('/api/', generalLimiter);

// ✅ API Routes - كلها قبل static
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/bot-orders', botOrdersRoutes);
app.use('/api/chat-logs', chatLogsRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/serials', serialsRoutes);
app.use('/api/technicians', techniciansRoutes);
app.use('/api/stopdesks', stopdesksRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ✅ Serve static files from dist - بعد API routes
app.use(express.static(path.join(__dirname, '../dist')));

// ✅ Catch-all route for SPA - أخيراً
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


export default app;