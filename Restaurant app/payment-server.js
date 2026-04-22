import express from "express"
import cors from 'cors'
const app = express();
app.use(cors());
app.use(express.json());

const payments = new Map();

app.post('/api/payments/start', (req, res) => {
  const { orderNumber, tableNumber } = req.body;

  if (!orderNumber) {
    return res.status(400).json({ error: 'orderNumber is required' });
  }

  payments.set(orderNumber, {
    orderNumber,
    tableNumber,
    paid: false,
    updatedAt: Date.now(),
  });

  res.json({ ok: true });
});

app.get('/api/payments/:orderNumber', (req, res) => {
  const payment = payments.get(req.params.orderNumber);

  if (!payment) {
    return res.json({ paid: false });
  }

  res.json(payment);
});

app.post('/api/payments/:orderNumber/paid', (req, res) => {
  const existing = payments.get(req.params.orderNumber) || {
    orderNumber: req.params.orderNumber,
    tableNumber: req.body.tableNumber || '',
    paid: false,
  };

  const updated = {
    ...existing,
    paid: true,
    updatedAt: Date.now(),
  };

  payments.set(req.params.orderNumber, updated);
  res.json(updated);
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Payment server running on http://0.0.0.0:3001');
});
