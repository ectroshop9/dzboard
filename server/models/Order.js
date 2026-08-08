let orders = [];
let nextId = 1001;

export default {
  getAll: () => orders.sort((a, b) => b.id - a.id),
  
  create: (data) => {
    const o = {
      id: nextId++,
      ...data,
      status: 'pending',
      tracking: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(o);
    return o;
  },
  
  updateStatus: (id, status, tracking = null) => {
    const o = orders.find(order => order.id === id);
    if (o) {
      o.status = status;
      if (tracking) o.tracking = tracking;
      o.updatedAt = new Date().toISOString();
      return o;
    }
    return null;
  },
  
  getByTracking: (tracking) => {
    return orders.find(o => o.tracking === tracking);
  },
  
  getById: (id) => {
    return orders.find(o => o.id === id);
  },
};
