// ui.js - modal handling, accessibility, focus management, rendering
export class UIService {
  constructor() {
    this.focusedElementBeforeModal = null;
    this.productsPerPage = 6;
    this.currentPage = 1;
    this.onPageChange = null;
    this.tt = null;
    this.showToast = null;
    this.modalInitialized = false;
    this.keydownHandler = null;
  }

  setCallbacks({ onPageChange, tt, showToast }) {
    this.onPageChange = onPageChange;
    this.tt = tt;
    this.showToast = showToast;
  }

  // Initialize modal event listeners only once
  initModal() {
    if (this.modalInitialized) return;
    
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Modal close button
    const close = modal.querySelector('.close-modal');
    close?.addEventListener('click', () => this.closeModal());
    
    // Click outside modal to close
    modal.addEventListener('click', (e) => { 
      if (e.target === modal) this.closeModal(); 
    });
    
    // Global keydown handler for ESC key (cart only - modal handles its own ESC)
    this.keydownHandler = (e) => {
      if (e.key === 'Escape') {
        // Close cart if open
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar?.classList.contains('open')) {
          const closeCart = window.closeCart;
          if (closeCart) closeCart();
        }
      }
    };
    
    document.addEventListener('keydown', this.keydownHandler);
    this.modalInitialized = true;
  }

  // Cleanup method to remove event listeners
  destroy() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.modalInitialized = false;
  }

  renderSkeletons(container, count = 6) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'product-skeleton';
      const thumb = document.createElement('div'); thumb.className = 'skeleton-thumb';
      const line1 = document.createElement('div'); line1.className = 'skeleton-line lg';
      const line2 = document.createElement('div'); line2.className = 'skeleton-line';
      card.appendChild(thumb); card.appendChild(line1); card.appendChild(line2);
      container.appendChild(card);
    }
  }

  renderCategories(selectEl, categories) {
    if (!selectEl) return;
    const allCategoriesText = window.tt ? window.tt('allCategories') : 'All Categories';
    selectEl.innerHTML = `<option value="all">${allCategoriesText}</option>`;
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; 
      opt.textContent = window.getTranslatedCategory ? window.getTranslatedCategory(cat) : cat;
      selectEl.appendChild(opt);
    });
  }

  renderProducts(container, products, onBuy, onAddToCart) {
    if (!container) return;
    container.innerHTML = '';
    if (products.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'loading';
      empty.innerHTML = '<p>No products available.</p>';
      container.appendChild(empty);
      return;
    }
    const start = (this.currentPage - 1) * this.productsPerPage;
    const pageProducts = products.slice(start, start + this.productsPerPage);
    pageProducts.forEach((p, idx) => {
      container.appendChild(this.createProductCard(p, start + idx, onBuy, onAddToCart));
    });
    // render pagination controls
    this.renderPagination(products.length);
  }

  renderPagination(totalCount) {
    const paginationContainer = document.getElementById('pagination');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalCount / this.productsPerPage);
    if (currentPageSpan) currentPageSpan.textContent = String(this.currentPage);
    if (totalPagesSpan) totalPagesSpan.textContent = String(totalPages);
    if (totalPages <= 1) return;
    
    const makeBtn = (label, handler, isEllipsis = false) => { 
      const b = document.createElement('button'); 
      b.className = isEllipsis ? 'pagination-ellipsis' : 'pagination-btn'; 
      b.textContent = label; 
      if (!isEllipsis) {
        b.addEventListener('click', handler);
      } else {
        b.disabled = true;
        b.setAttribute('aria-hidden', 'true');
      }
      return b; 
    };
    
    // Previous button
    if (this.currentPage > 1) {
      paginationContainer.appendChild(makeBtn('‹', () => {
        this.currentPage -= 1;
        if (this.onPageChange) this.onPageChange(this.currentPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }));
    }
    
    // Smart pagination logic
    const current = this.currentPage;
    const total = totalPages;
    const delta = 2; // Number of pages to show on each side of current page
    
    // Always show first page
    if (current > delta + 2) {
      paginationContainer.appendChild(makeBtn('1', () => {
        this.currentPage = 1;
        if (this.onPageChange) this.onPageChange(this.currentPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }));
      if (current > delta + 3) {
        paginationContainer.appendChild(makeBtn('...', null, true));
      }
    }
    
    // Show pages around current page
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    
    for (let i = start; i <= end; i++) {
      const b = makeBtn(String(i), () => {
        this.currentPage = i;
        if (this.onPageChange) this.onPageChange(this.currentPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
      if (i === current) b.classList.add('active');
      paginationContainer.appendChild(b);
    }
    
    // Always show last page
    if (current < total - delta - 1) {
      if (current < total - delta - 2) {
        paginationContainer.appendChild(makeBtn('...', null, true));
      }
      paginationContainer.appendChild(makeBtn(String(total), () => {
        this.currentPage = total;
        if (this.onPageChange) this.onPageChange(this.currentPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }));
    }
    
    // Next button
    if (this.currentPage < totalPages) {
      paginationContainer.appendChild(makeBtn('›', () => {
        this.currentPage += 1;
        if (this.onPageChange) this.onPageChange(this.currentPage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }));
    }
  }

  createProductCard(product, index, onBuy, onAddToCart) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = `${product.name} - ${product.description}`;
    img.className = 'product-image';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+';
      img.alt = 'Product image placeholder';
    });

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = window.getTranslatedProductName ? window.getTranslatedProductName(product.id) : product.name;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = window.buildCurrency ? window.buildCurrency(product.price) : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(product.price);

    // stock badges
    const stockBadge = document.createElement('div');
    stockBadge.className = 'stock-badge';
    if (product.stock > 10) { 
      stockBadge.classList.add('in-stock'); 
      stockBadge.textContent = window.tt ? window.tt('inStock') : 'In Stock'; 
    }
    else if (product.stock > 0) { 
      stockBadge.classList.add('low-stock'); 
      stockBadge.textContent = window.tt ? window.tt('lowStock') : 'Low Stock'; 
    }
    else { 
      stockBadge.classList.add('out-of-stock'); 
      stockBadge.textContent = window.tt ? window.tt('outOfStock') : 'Out of Stock'; 
    }
    if (product.stock < 5 && product.stock > 0) {
      stockBadge.textContent = window.tt ? window.tt('onlyLeft', { count: product.stock }) : `Only ${product.stock} left`;
    }

    const buyBtn = document.createElement('button');
    buyBtn.className = 'buy-button';
    buyBtn.textContent = window.tt ? window.tt('buyNow') : 'Buy Now';
    buyBtn.addEventListener('click', () => onBuy(product.id));

    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-cart-button';
    addBtn.textContent = window.tt ? window.tt('addToCart') : 'Add to Cart';
    if (product.stock <= 0) {
      addBtn.disabled = true;
      addBtn.textContent = window.tt ? window.tt('outOfStock') : 'Out of Stock';
      addBtn.classList.add('disabled');
    } else {
      addBtn.addEventListener('click', () => onAddToCart(product.id));
    }

    if (product.id <= 3) {
      const badge = document.createElement('div');
      badge.className = 'lux-badge';
      badge.textContent = product.id === 1 ? (window.tt ? window.tt('featured') : 'Featured') : (window.tt ? window.tt('new') : 'New');
      card.appendChild(badge);
    }

    card.appendChild(stockBadge);
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(buyBtn);
    card.appendChild(addBtn);
    return card;
  }

  // Modal
  openModal(fillContent) {
    const modal = document.getElementById('product-modal');
    const body = modal?.querySelector('.modal-body');
    if (!modal || !body) return;
    
    // Close any open dropdowns
    const openDropdowns = document.querySelectorAll('.dropdown-menu.open');
    openDropdowns.forEach(dropdown => {
      dropdown.classList.remove('open');
      dropdown.classList.add('hidden');
    });
    
    // Create backdrop if it doesn't exist
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.addEventListener('click', () => this.closeModal());
      document.body.appendChild(backdrop);
    }
    
    // Show the backdrop
    backdrop.style.display = 'block';
    
    this.focusedElementBeforeModal = document.activeElement;
    body.innerHTML = '';
    fillContent(body);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll', 'modal-open');
    
    // Focus management
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.focus();
    } else {
      modal.focus();
    }
    
    this.trapFocus(modal);
  }

  closeModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    // Clean up focus trap event listeners
    if (this._focusCleanup) {
      this._focusCleanup();
      this._focusCleanup = null;
    }
    
    // Hide backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.style.display = 'none';
    }
    
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll', 'modal-open');
    this.focusedElementBeforeModal?.focus?.();
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    // Handle Tab key navigation
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    };

    // Handle Escape key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    };

    // Add event listeners
    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Store cleanup function
    this._focusCleanup = () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }
}


