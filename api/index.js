import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();

// CORS مفتوح للكل مؤقتاً
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'طلبات كثيرة!' },
});

app.use('/api/', limiter);

import productRoutes from '../server/routes/products.js';
import orderRoutes from '../server/routes/orders.js';
import adminRoutes from '../server/routes/admin.js';
import shippingRoutes from '../server/routes/shipping.js';

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
