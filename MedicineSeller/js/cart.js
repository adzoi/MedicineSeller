// cart.js - cart logic with localStorage persistence
const STORAGE_KEY = 'medicineSeller-cart';

export class CartService {
  constructor(showToast = null) {
    this.items = this.load();
    this.showToast = showToast;
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    const max = typeof product.stock === 'number' ? product.stock : Infinity;
    const currentQty = existing ? existing.qty : 0;
    if (max <= 0) {
      return { ok: false, reason: 'out_of_stock', max: 0 };
    }
    if (currentQty >= max) {
      return { ok: false, reason: 'limit_reached', max };
    }
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, max);
    } else {
      this.items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1, selected: true });
    }
    this.save();
    return { ok: true, qty: (existing ? existing.qty : 1), max };
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  toggleSelected(id) {
    const item = this.items.find(i => i.id === id);
    if (item) { item.selected = !item.selected; this.save(); }
  }

  clear() { this.items = []; this.save(); }

  getItems() { return this.items; }

  getSelected() { return this.items.filter(i => i.selected); }

  getTotalQty() { return this.items.reduce((sum, i) => sum + i.qty, 0); }
  getTotalPrice() { return this.items.reduce((sum, i) => sum + i.qty * i.price, 0); }
}

export function renderCartSidebar(cart, products, tt = null) {
  const sidebar = document.getElementById('cart-sidebar');
  const list = document.getElementById('cart-items');
  const badge = document.getElementById('cart-badge');
  if (!sidebar || !list) return;
  list.innerHTML = '';
  if (cart.items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'loading';
    empty.textContent = window.tt ? window.tt('yourCartEmpty') : 'Your cart is empty.';
    list.appendChild(empty);
    if (badge) badge.textContent = '0';
    return;
  }
  cart.items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const row = document.createElement('div');
    row.className = 'cart-item';
    const img = document.createElement('img');
    img.src = item.image || product?.image; img.alt = item.name; img.loading='lazy'; img.decoding='async'; img.className='cart-item-image';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!item.selected;
    checkbox.addEventListener('change', () => { cart.toggleSelected(item.id); });
    const name = document.createElement('span');
    name.textContent = `${window.getTranslatedProductName ? window.getTranslatedProductName(item.id) : item.name} × ${item.qty}`;
    const qty = document.createElement('input');
    qty.type = 'number'; qty.min = '1'; qty.value = String(item.qty);
    qty.className = 'cart-qty-input';
    qty.addEventListener('change', () => {
      let v = Math.max(1, parseInt(qty.value||'1', 10));
      const max = Math.max(1, product?.stock || v);
  if (v > max) {
    v = max;
    if (this.showToast) this.showToast(`Only ${max} in stock for ${item.name}`);
  }
      item.qty = v;
      qty.value = String(v);
      cart.save();
      renderCartSidebar(cart, products);
    });
    const price = document.createElement('span');
    price.textContent = window.buildCurrency ? window.buildCurrency(item.price * item.qty) : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(item.price * item.qty);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = window.tt ? window.tt('remove') : 'Remove';
    removeBtn.addEventListener('click', () => { cart.remove(item.id); renderCartSidebar(cart, products); });
    row.appendChild(checkbox); row.appendChild(img); row.appendChild(name); row.appendChild(qty); row.appendChild(price); row.appendChild(removeBtn);
    list.appendChild(row);
  });
  if (badge) badge.textContent = String(cart.getTotalQty());
  // total row
  const totalRow = document.createElement('div'); totalRow.className = 'cart-total-row';
  const translate = window.tt || ((k,...a)=>k);
  totalRow.textContent = `${translate('total')}: ${window.buildCurrency ? window.buildCurrency(cart.getTotalPrice()) : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(cart.getTotalPrice())}`;
  list.appendChild(totalRow);
}

export function openCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (!sidebar) return;
  sidebar.setAttribute('aria-hidden', 'false');
  sidebar.classList.add('open');
  overlay?.classList.add('open');
}

export function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (!sidebar) return;
  sidebar.setAttribute('aria-hidden', 'true');
  sidebar.classList.remove('open');
  overlay?.classList.remove('open');
}


