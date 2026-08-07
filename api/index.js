import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

import productRoutes from '../server/routes/products.js';
import orderRoutes from '../server/routes/orders.js';
import adminRoutes from '../server/routes/admin.js';
import shippingRoutes from '../server/routes/shipping.js';

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
