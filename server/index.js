import dotenv from 'dotenv';
dotenv.config();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['https://dzboard.vercel.app', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/bot-orders', botOrdersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve static files from dist
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/api/chat-logs', chatLogsRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;