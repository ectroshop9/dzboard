let products = [
  { id: 1, name: 'T-Con Samsung 32" FHD', category: 'tcon', brand: 'samsung', price: 2500, stock: 5, description: 'كرت T-Con أصلي', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', active: true },
  { id: 2, name: 'Power Supply LG 43"', category: 'alimentation', brand: 'lg', price: 3200, stock: 3, description: 'باور سبلاي LG', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400', active: true },
  { id: 3, name: 'Main Board Condor 40"', category: 'main-board', brand: 'condor', price: 4500, stock: 2, description: 'مين بورد كوندور', image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400', active: true },
  { id: 4, name: 'LED Strips Iris 50"', category: 'parts', brand: 'iris', price: 1800, stock: 10, description: 'مساطر LED ايريس', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', active: true },
  { id: 5, name: 'T-Con Geant 28"', category: 'tcon', brand: 'geant', price: 2000, stock: 7, description: 'كرت T-Con جيون', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400', active: true },
  { id: 6, name: 'Alimentation Stream 32"', category: 'alimentation', brand: 'stream', price: 2800, stock: 4, description: 'باور سبلاي ستريم', image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400', active: true },
];

let nextId = 7;

export default {
  getAll: () => products.filter(p => p.active),
  getById: (id) => products.find(p => p.id === id && p.active),
  create: (data) => {
    const product = { id: nextId++, ...data, active: true };
    products.push(product);
    return product;
  },
  update: (id, data) => {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data };
      return products[index];
    }
    return null;
  },
  delete: (id) => {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index].active = false;
      return true;
    }
    return false;
  },
};
