let orders = [];
let nextId = 1001;
module.exports = {
  getAll: () => orders.sort((a,b) => b.id - a.id),
  getById: (id) => orders.find(o => o.id === id),
  create: (data) => { const o = { id: nextId++, ...data, status: 'pending', tracking: null, createdAt: new Date().toISOString() }; orders.push(o); return o; },
  updateStatus: (id, status, tracking) => { const o = orders.find(o => o.id === id); if (o) { o.status = status; if (tracking) o.tracking = tracking; return o; } return null; },
};
