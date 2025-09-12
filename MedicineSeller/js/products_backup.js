// products.js - product data loading, search, filtering, categories
export class ProductService {
  constructor({ fallback = [] } = {}) {
    this.products = [];
    this.filteredProducts = [];
    this.categories = [];
    this.fallback = fallback;
  }

  async load() {
    try {
      const res = await fetch('products.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.products = await res.json();
    } catch (e) {
      console.warn('Failed to fetch products.json, using fallback', e);
      this.products = this.fallback;
    }
    this.filteredProducts = [...this.products];
    this.categories = [...new Set(this.products.map(p => p.category))].sort();
    return this.products;
  }

  getProducts() { return this.products; }
  getFiltered() { return this.filteredProducts; }
  getCategories() { return this.categories; }

  search(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredProducts = [...this.products];
      return this.filteredProducts;
    }
    this.filteredProducts = this.products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.active_ingredient || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
    return this.filteredProducts;
  }

  filterByCategory(category) {
    if (!category || category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    return this.filteredProducts;
  }

  sortBy({ key, order = 'asc' }) {
    const dir = order === 'desc' ? -1 : 1;
    const sorted = [...this.filteredProducts].sort((a, b) => {
      if (key === 'name') return a.name.localeCompare(b.name) * dir;
      if (key === 'price') return (a.price - b.price) * dir;
      return 0;
    });
    this.filteredProducts = sorted;
    return this.filteredProducts;
  }
}


