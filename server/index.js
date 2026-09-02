
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import shippingRoutes from './routes/shipping.js';
import requestRoutes from './routes/requests.js';
import inventoryRoutes from './routes/inventory.js';
import backupRoutes from './routes/backup.js';
import botOrdersRoutes from './routes/botOrders.js';
import chatLogsRoutes from './routes/chatLogs.js';
import liveChatRoutes from './routes/liveChat.js';
import serialsRoutes from './routes/serials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['https://dzboard.vercel.app', 'https://serialcotv.onrender.com', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// ✅ API Routes - كلها قبل static
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/bot-orders', botOrdersRoutes);
app.use('/api/chat-logs', chatLogsRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/serials', serialsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ✅ Serve static files from dist - بعد API routes
app.use(express.static(path.join(__dirname, '../dist')));

// ✅ Catch-all route for SPA - أخيراً
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


export default app;