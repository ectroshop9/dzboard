let orders = [];
let nextId = 1001;

export default {
  getAll: () => orders.sort((a, b) => b.id - a.id),
  getById: (id) => orders.find(o => o.id === id),
  create: (data) => {
    const order = {
      id: nextId++,
      ...data,
      status: 'pending',
      tracking: null,
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    return order;
  },
  updateStatus: (id, status, tracking = null) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (tracking) order.tracking = tracking;
      return order;
    }
    return null;
  },
};
