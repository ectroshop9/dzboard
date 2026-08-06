let orders = []; let nextId = 1001;
export default {
  getAll: () => orders.sort((a,b) => b.id - a.id),
  create: (data) => { const o = { id: nextId++, ...data, status: 'pending', tracking: null, createdAt: new Date().toISOString() }; orders.push(o); return o; },
  updateStatus: (id, status, tracking) => { const o = orders.find(o => o.id === id); if (o) { o.status = status; if (tracking) o.tracking = tracking; return o; } return null; },
};
