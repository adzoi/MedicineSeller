// main.js - main application logic
import { ProductService } from './products.js';
import { UIService } from './ui.js';
import { CartService, renderCartSidebar, openCart, closeCart } from './cart.js';
import { AIService } from './ai.js';

// Language toggle system
const LANG_KEY = 'medicineSeller-lang';
let CURRENT_LANG = localStorage.getItem(LANG_KEY) || 'ru';

const translations = {
  en: {
    // Site elements
    siteTitle: 'MedicineSeller',
    searchPlaceholder: 'Search products...',
    allCategories: 'All Categories',
    sort: 'Sort',
    sortByNameAsc: 'Sort by Name (A-Z)',
    sortByNameDesc: 'Sort by Name (Z-A)',
    sortByPriceAsc: 'Sort by Price (Low → High)',
    sortByPriceDesc: 'Sort by Price (High → Low)',
    showingPage: 'Showing page',
    of: 'of',
    
    // Product elements
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    onlyLeft: 'Only {count} left',
    new: 'New',
    featured: 'Featured',
    
    // Cart elements
    yourCart: 'Your Cart',
    buySelected: 'Buy Selected',
    clearCart: 'Clear Cart',
    yourCartEmpty: 'Your cart is empty.',
    remove: 'Remove',
    total: 'Total',
    
    // Modal elements
    completeOrder: 'Complete Order',
    name: 'Full Name',
    address: 'Address',
    namePlaceholder: 'Enter your full name',
    addressPlaceholder: 'Enter your address',
    confirmOrder: 'Confirm Order',
    cancel: 'Cancel',
    
    // AI Chat
    aiAssistant: 'AI Stock Assistant',
    askAboutMedicines: 'Ask about medicines...',
    sendMessage: 'Send',
    aiGreeting: 'Hello! I can help you find the right medicine. What are you looking for?',
    
    // Footer
    copyright: '© 2025 MedicineSeller. Premium Healthcare Solutions.',
    
    // Messages
    addedToCart: '{name} × {qty} added to cart',
    noMoreStock: 'No more stock for {name}',
    onlyInStock: 'Only {max} in stock for {name}',
    unableToAdd: 'Unable to add {name} to cart',
    pleaseSelectItems: 'Please select items to buy.',
    cartCleared: 'Cart cleared.',
    orderSent: 'Order sent to WhatsApp!',
    pleaseFillFields: 'Please fill in all fields',
    
    // WhatsApp message
    whatsappOrder: '🛒 New Order!\n\nCustomer: {name}\nAddress: {address}\n\nItems:\n{items}\n\nTotal: {total}\n\nPlease confirm payment details.',
    
    // Product names
    productNames: {
      1: 'Aspirin Plus',
      2: 'Vitamin D3 Supreme',
      3: 'Omega-3 Complete',
      4: 'Probiotic Balance',
      5: 'Melatonin Sleep Aid',
      6: 'Collagen Beauty',
      7: 'Magnesium Complex',
      8: 'B-Complex Energy',
      9: 'Turmeric Curcumin',
      10: 'Zinc Immune Support',
      11: 'CoQ10 Heart Health',
      12: 'Glucosamine Joint Care'
    },
    
    // Product descriptions
    productDescriptions: {
      1: 'Advanced pain relief and anti-inflammatory medication. Contains 500mg acetylsalicylic acid with enhanced absorption formula for fast-acting relief from headaches, muscle pain, and fever.',
      2: 'Premium vitamin D3 supplement with 2000 IU strength. Supports bone health, immune system function, and overall wellness. Enhanced with K2 for optimal absorption and utilization.',
      3: 'High-quality fish oil supplement rich in EPA and DHA omega-3 fatty acids. Supports heart health, brain function, and joint mobility. Molecularly distilled for purity and freshness.',
      4: 'Advanced probiotic formula with 50 billion CFU of beneficial bacteria. Supports digestive health, immune function, and gut microbiome balance. Includes prebiotic fiber for optimal probiotic growth.',
      5: 'Natural sleep support supplement with extended-release melatonin. Promotes restful sleep, regulates sleep-wake cycles, and improves sleep quality without morning grogginess.',
      6: 'Premium collagen peptide supplement for skin, hair, and nail health. Hydrolyzed for maximum absorption. Includes vitamin C and biotin for enhanced collagen synthesis and beauty benefits.',
      7: 'Comprehensive magnesium supplement with multiple forms for optimal absorption. Supports muscle function, nerve health, energy production, and stress management. Gentle on the stomach.',
      8: 'Complete B-vitamin complex for energy metabolism and nervous system support. Includes all essential B vitamins in optimal ratios. Helps convert food into energy and supports cognitive function.',
      9: 'High-potency turmeric extract with enhanced curcumin bioavailability. Powerful anti-inflammatory and antioxidant properties. Supports joint health, immune function, and overall wellness.',
      10: 'Essential mineral supplement for immune system function and wound healing. Chelated form for superior absorption. Supports protein synthesis, DNA formation, and antioxidant defense.',
      11: 'Coenzyme Q10 supplement for cardiovascular health and energy production. Supports heart muscle function, blood pressure regulation, and cellular energy metabolism. Enhanced with vitamin E.',
      12: 'Comprehensive joint support supplement with glucosamine, chondroitin, and MSM. Promotes cartilage health, reduces joint discomfort, and supports mobility. Ideal for active individuals.'
    }
  },
  ru: {
    // Site elements
    siteTitle: 'МедицинскийПродавец',
    searchPlaceholder: 'Поиск товаров...',
    allCategories: 'Все категории',
    sort: 'Сортировка',
    sortByNameAsc: 'Сортировать по имени (А-Я)',
    sortByNameDesc: 'Сортировать по имени (Я-А)',
    sortByPriceAsc: 'Сортировать по цене (Низкая → Высокая)',
    sortByPriceDesc: 'Сортировать по цене (Высокая → Низкая)',
    showingPage: 'Показана страница',
    of: 'из',
    
    // Product elements
    buyNow: 'Купить сейчас',
    addToCart: 'Добавить в корзину',
    inStock: 'В наличии',
    lowStock: 'Мало в наличии',
    outOfStock: 'Нет в наличии',
    onlyLeft: 'Осталось {count}',
    new: 'Новинка',
    featured: 'Рекомендуемое',
    
    // Cart elements
    yourCart: 'Ваша корзина',
    buySelected: 'Купить выбранное',
    clearCart: 'Очистить корзину',
    yourCartEmpty: 'Ваша корзина пуста.',
    remove: 'Удалить',
    total: 'Итого',
    
    // Modal elements
    completeOrder: 'Завершить заказ',
    name: 'Полное имя',
    address: 'Адрес',
    namePlaceholder: 'Введите ваше полное имя',
    addressPlaceholder: 'Введите ваш адрес',
    confirmOrder: 'Подтвердить заказ',
    cancel: 'Отмена',
    
    // AI Chat
    aiAssistant: 'ИИ Помощник по Складу',
    askAboutMedicines: 'Спросите о лекарствах...',
    sendMessage: 'Отправить',
    aiGreeting: 'Привет! Я могу помочь вам найти подходящее лекарство. Что вы ищете?',
    
    // Footer
    copyright: '© 2025 МедицинскийПродавец. Премиальные Медицинские Решения.',
    
    // Messages
    addedToCart: '{name} × {qty} добавлено в корзину',
    noMoreStock: 'Нет в наличии {name}',
    onlyInStock: 'Только {max} в наличии для {name}',
    unableToAdd: 'Не удалось добавить {name} в корзину',
    pleaseSelectItems: 'Пожалуйста, выберите товары для покупки.',
    cartCleared: 'Корзина очищена.',
    orderSent: 'Заказ отправлен в WhatsApp!',
    pleaseFillFields: 'Пожалуйста, заполните все поля',
    
    // WhatsApp message
    whatsappOrder: '🛒 Новый заказ!\n\nКлиент: {name}\nАдрес: {address}\n\nТовары:\n{items}\n\nИтого: {total}\n\nПожалуйста, подтвердите детали оплаты.',
    
    // Product names
    productNames: {
      1: 'Аспирин Плюс',
      2: 'Витамин D3 Супреме',
      3: 'Омега-3 Комплекс',
      4: 'Пробиотик Баланс',
      5: 'Мелатонин для сна',
      6: 'Коллаген Красота',
      7: 'Магниевый Комплекс',
      8: 'В-Комплекс Энергия',
      9: 'Куркумин Куркума',
      10: 'Цинк Иммунная Поддержка',
      11: 'КоQ10 Здоровье Сердца',
      12: 'Глюкозамин Уход за Суставами'
    },
    
    // Product descriptions
    productDescriptions: {
      1: 'Продвинутое обезболивающее и противовоспалительное лекарство. Содержит 500мг ацетилсалициловой кислоты с улучшенной формулой всасывания для быстрого облегчения головной боли, мышечной боли и лихорадки.',
      2: 'Премиум добавка витамина D3 с силой 2000 МЕ. Поддерживает здоровье костей, функцию иммунной системы и общее благополучие. Усилена K2 для оптимального всасывания и усвоения.',
      3: 'Высококачественная добавка рыбьего жира, богатая омега-3 жирными кислотами EPA и DHA. Поддерживает здоровье сердца, функцию мозга и подвижность суставов. Молекулярно дистиллирована для чистоты и свежести.',
      4: 'Продвинутая пробиотическая формула с 50 миллиардами КОЕ полезных бактерий. Поддерживает здоровье пищеварения, функцию иммунитета и баланс микробиома кишечника. Включает пребиотическую клетчатку для оптимального роста пробиотиков.',
      5: 'Натуральная добавка для поддержки сна с пролонгированным мелатонином. Способствует спокойному сну, регулирует циклы сна-бодрствования и улучшает качество сна без утренней сонливости.',
      6: 'Премиум добавка коллагеновых пептидов для здоровья кожи, волос и ногтей. Гидролизована для максимального всасывания. Включает витамин C и биотин для усиленного синтеза коллагена и красоты.',
      7: 'Комплексная магниевая добавка с множественными формами для оптимального всасывания. Поддерживает функцию мышц, здоровье нервов, выработку энергии и управление стрессом. Мягкая для желудка.',
      8: 'Полный В-витаминный комплекс для энергетического метаболизма и поддержки нервной системы. Включает все необходимые В-витамины в оптимальных соотношениях. Помогает преобразовывать пищу в энергию и поддерживает когнитивную функцию.',
      9: 'Высокопотенциальный экстракт куркумы с улучшенной биодоступностью куркумина. Мощные противовоспалительные и антиоксидантные свойства. Поддерживает здоровье суставов, функцию иммунитета и общее благополучие.',
      10: 'Необходимая минеральная добавка для функции иммунной системы и заживления ран. Хелатная форма для превосходного всасывания. Поддерживает синтез белка, образование ДНК и антиоксидантную защиту.',
      11: 'Добавка кофермента Q10 для здоровья сердечно-сосудистой системы и выработки энергии. Поддерживает функцию сердечной мышцы, регуляцию артериального давления и клеточный энергетический метаболизм. Усилена витамином E.',
      12: 'Комплексная добавка для поддержки суставов с глюкозамином, хондроитином и MSM. Способствует здоровью хрящей, уменьшает дискомфорт в суставах и поддерживает подвижность. Идеальна для активных людей.'
    }
  }
};

function tt(key, replacements = {}) {
  const dict = translations[CURRENT_LANG] || translations.ru;
  let text = dict[key] || key;
  
  // Debug: Log if translation key is missing
  if (!dict[key]) {
    console.warn(`Translation key '${key}' not found for language '${CURRENT_LANG}'`);
  }
  
  // Replace placeholders with object-based replacements
  text = text.replace(/\{(\w+)\}/g, (match, placeholder) => {
    return replacements[placeholder] !== undefined ? replacements[placeholder] : match;
  });
  
  return text;
}

// Fallback product data
const FALLBACK = [
  {
    "id": 1,
    "name": "Aspirin Plus",
    "price": 509.0,
    "description": "Advanced pain relief and anti-inflammatory medication. Contains 500mg acetylsalicylic acid with enhanced absorption formula for fast-acting relief from headaches, muscle pain, and fever.",
    "category": "Pain Relief",
    "image": "https://www.medline.com/media/catalog/sku/OTC/D120001304661_181220240544.jpg",
    "prescription": false,
    "active_ingredient": "Acetylsalicylic Acid",
    "strength": "500mg",
    "dosage_form": "Tablet",
    "stock": 45
  },
  {
    "id": 2,
    "name": "Vitamin D3 Supreme",
    "price": 59.0,
    "description": "Premium vitamin D3 supplement with 2000 IU strength. Supports bone health, immune system function, and overall wellness. Enhanced with K2 for optimal absorption and utilization.",
    "category": "Vitamins & Supplements",
    "image": "https://www.supznutrition.com/cdn/shop/files/SUPZ_D3Supreme_2x_81643c4a-234d-411d-974a-00e93be11b32_1200x1200.jpg?v=1702941632",
    "prescription": false,
    "active_ingredient": "Cholecalciferol",
    "strength": "2000 IU",
    "dosage_form": "Softgel",
    "stock": 45
  },
  {
    "id": 3,
    "name": "Omega-3 Complete",
    "price": 59.0,
    "description": "High-quality fish oil supplement rich in EPA and DHA omega-3 fatty acids. Supports heart health, brain function, and joint mobility. Molecularly distilled for purity and freshness.",
    "category": "Vitamins & Supplements",
    "image": "https://m.media-amazon.com/images/I/71FYUakMDxL._UF1000,1000_QL80_.jpg",
    "prescription": false,
    "active_ingredient": "Fish Oil",
    "strength": "1000mg",
    "dosage_form": "Softgel",
    "stock": 45
  },
  {
    "id": 4,
    "name": "Probiotic Balance",
    "price": 59.0,
    "description": "Advanced probiotic formula with 50 billion CFU of beneficial bacteria. Supports digestive health, immune function, and gut microbiome balance. Includes prebiotic fiber for optimal probiotic growth.",
    "category": "Digestive Health",
    "image": "https://m.media-amazon.com/images/I/71nJonX7dWL._UF894,1000_QL80_.jpg",
    "prescription": false,
    "active_ingredient": "Lactobacillus & Bifidobacterium",
    "strength": "50 Billion CFU",
    "dosage_form": "Capsule",
    "stock": 8
  },
  {
    "id": 5,
    "name": "Melatonin Sleep Aid",
    "price": 59.0,
    "description": "Natural sleep support supplement with extended-release melatonin. Promotes restful sleep, regulates sleep-wake cycles, and improves sleep quality without morning grogginess.",
    "category": "Sleep & Relaxation",
    "image": "https://images.ctfassets.net/34zny1xcpyrz/1Nl32KKieZdRTZYSqDTHCB/556e4e71d4f18480bf7aa611d9c48f1f/PDP_PureZzzs_Muscle_Relaxation_Bottle_HERO_130.jpg?fm=webp",
    "prescription": false,
    "active_ingredient": "Melatonin",
    "strength": "5mg",
    "dosage_form": "Tablet",
    "stock": 8
  },
  {
    "id": 6,
    "name": "Collagen Beauty",
    "price": 59.0,
    "description": "Premium collagen peptide supplement for skin, hair, and nail health. Hydrolyzed for maximum absorption. Includes vitamin C and biotin for enhanced collagen synthesis and beauty benefits.",
    "category": "Beauty & Wellness",
    "image": "https://static1.biotus.ua/media/catalog/product/p/h/photo_2023-07-12_14-47-22.jpg?store=ka&image-type=image",
    "prescription": false,
    "active_ingredient": "Collagen Peptides",
    "strength": "10g",
    "dosage_form": "Powder",
    "stock": 8
  },
  {
    "id": 7,
    "name": "Magnesium Complex",
    "price": 59.0,
    "description": "Comprehensive magnesium supplement with multiple forms for optimal absorption. Supports muscle function, nerve health, energy production, and stress management. Gentle on the stomach.",
    "category": "Minerals",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Magnesium",
    "strength": "400mg",
    "dosage_form": "Capsule",
    "stock": 0
  },
  {
    "id": 8,
    "name": "B-Complex Energy",
    "price": 59.0,
    "description": "Complete B-vitamin complex for energy metabolism and nervous system support. Includes all essential B vitamins in optimal ratios. Helps convert food into energy and supports cognitive function.",
    "category": "Vitamins & Supplements",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "B-Vitamin Complex",
    "strength": "Various",
    "dosage_form": "Tablet",
    "stock": 0
  },
  {
    "id": 9,
    "name": "Turmeric Curcumin",
    "price": 59.0,
    "description": "High-potency turmeric extract with enhanced curcumin bioavailability. Powerful anti-inflammatory and antioxidant properties. Supports joint health, immune function, and overall wellness.",
    "category": "Herbal Supplements",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Curcumin",
    "strength": "500mg",
    "dosage_form": "Capsule",
    "stock": 0
  },
  {
    "id": 10,
    "name": "Zinc Immune Support",
    "price": 59.0,
    "description": "Essential mineral supplement for immune system function and wound healing. Chelated form for superior absorption. Supports protein synthesis, DNA formation, and antioxidant defense.",
    "category": "Minerals",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Zinc",
    "strength": "15mg",
    "dosage_form": "Tablet",
    "stock": 15
  },
  {
    "id": 11,
    "name": "CoQ10 Heart Health",
    "price": 59.0,
    "description": "Coenzyme Q10 supplement for cardiovascular health and energy production. Supports heart muscle function, blood pressure regulation, and cellular energy metabolism. Enhanced with vitamin E.",
    "category": "Heart Health",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Coenzyme Q10",
    "strength": "100mg",
    "dosage_form": "Softgel",
    "stock": 15
  },
  {
    "id": 12,
    "name": "Glucosamine Joint Care",
    "price": 59.0,
    "description": "Comprehensive joint support supplement with glucosamine, chondroitin, and MSM. Promotes cartilage health, reduces joint discomfort, and supports mobility. Ideal for active individuals.",
    "category": "Joint Health",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Glucosamine & Chondroitin",
    "strength": "1500mg",
    "dosage_form": "Tablet",
    "stock": 15
  },
  {
    "id": 13,
    "name": "Glucosamine Joint Care 2",
    "price": 55.0,
    "description": "Comprehensive joint support supplement with glucosamine, chondroitin, and MSM. Promotes cartilage health, reduces joint discomfort, and supports mobility. Ideal for active individuals.",
    "category": "Joint Health",
    "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA0MEM2Ni42MjcgNDAgNzIgNDUuMzczIDcyIDUyQzcyIDU4LjYyNyA2Ni42MjcgNjQgNjAgNjRDNTMuMzczIDY0IDQ4IDU4LjYyNyA0OCA1MkM0OCA0NS4zNzMgNTMuMzczIDQwIDYwIDQwWiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNNjAgNzJDNjYuNjI3IDcyIDcyIDc3LjM3MyA3MiA4NEM3MiA5MC42MjcgNjYuNjI3IDk2IDYwIDk2QzUzLjM3MyA5NiA0OCA5MC42MjcgNDggODRDNDggNzcuMzczIDUzLjM3MyA3MiA2MCA3MloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
    "prescription": false,
    "active_ingredient": "Glucosamine & Chondroitin",
    "strength": "1500mg",
    "dosage_form": "Tablet",
    "stock": 1
  }
];

// Toast helper function
function showToast(message) {
  // Don't show toast if message is empty, undefined, or just whitespace
  if (!message || message.trim() === '') return;
  
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastClose = document.getElementById('toast-close');
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => toast.classList.remove('show'), 5000);
  
  // Close button functionality
  if (toastClose) {
    toastClose.onclick = () => toast.classList.remove('show');
  }
}

// Initialize services
const productService = new ProductService({ fallback: FALLBACK });
const ui = new UIService();
const cart = new CartService(showToast);
const ai = new AIService(productService);

// Set up UI service callbacks
ui.setCallbacks({ onPageChange: handlePageChange, tt: tt, showToast: showToast });

// Page change handler for pagination
function handlePageChange(page) {
  ui.currentPage = page;
  const listEl = document.getElementById('product-list');
  ui.renderProducts(listEl, productService.getFiltered(), onBuy, onAdd);
}

// Currency formatting
function buildCurrency(n) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n);
}

// Helper functions for product translations
function getTranslatedProductName(productId) {
  const dict = translations[CURRENT_LANG] || translations.ru;
  return dict.productNames?.[productId] || `Product ${productId}`;
}

function getTranslatedProductDescription(productId) {
  const dict = translations[CURRENT_LANG] || translations.ru;
  return dict.productDescriptions?.[productId] || 'No description available.';
}

// Make functions globally available
window.buildCurrency = buildCurrency;
window.getTranslatedProductName = getTranslatedProductName;
window.getTranslatedProductDescription = getTranslatedProductDescription;
window.getTranslatedCategory = (category) => category;
window.tt = tt;

// Product modal and buy functionality
function onBuy(id) {
  const p = productService.getProducts().find(x => x.id === id);
  if (!p) return;
  ui.openModal((container) => {
    const img = document.createElement('img');
    img.src = p.image; img.alt = `${getTranslatedProductName(p.id)} - ${getTranslatedProductDescription(p.id)}`; img.className = 'modal-product-image';
    const h2 = document.createElement('h2'); h2.textContent = getTranslatedProductName(p.id); h2.id = 'modal-title';
    const desc = document.createElement('p'); desc.textContent = getTranslatedProductDescription(p.id); desc.id = 'modal-description';
    const info = document.createElement('div'); info.className = 'modal-product-info';
    const price = document.createElement('div'); price.className = 'modal-price'; price.textContent = buildCurrency(p.price);
    const buyBtn = document.createElement('button'); buyBtn.className = 'buy-now-button'; buyBtn.textContent = tt('buyNow'); buyBtn.addEventListener('click', () => {
      const items = [{ id: p.id, name: getTranslatedProductName(p.id), price: p.price, image: p.image, qty: 1, selected: true }];
      openWhatsAppForm(items);
    });
    const addBtn = document.createElement('button'); addBtn.className='add-to-cart-button'; addBtn.textContent=tt('addToCart'); addBtn.addEventListener('click', () => { onAdd(p.id); });
    
    // Create button container for centering
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    buttonContainer.appendChild(buyBtn);
    buttonContainer.appendChild(addBtn);
    
    info.appendChild(price);
    container.appendChild(img); container.appendChild(h2); container.appendChild(desc); container.appendChild(info); container.appendChild(buttonContainer);
  });
}

function onAdd(id) {
  const p = productService.getProducts().find(x => x.id === id);
  if (!p) return;
  const result = cart.add(p);
  if (!result || result.ok !== true) {
    if (result?.reason === 'out_of_stock') {
      showToast(tt('noMoreStock', { name: p.name }));
    } else if (result?.reason === 'limit_reached') {
      showToast(tt('onlyInStock', { name: p.name, max: result.max }));
    } else {
      showToast(tt('unableToAdd', { name: p.name }));
    }
    return;
  }
  renderCartSidebar(cart, productService.getProducts());
  showToast(tt('addedToCart', { name: p.name, qty: result.qty }));
  renderMiniCartPreview();
}

// WhatsApp form functionality
function openWhatsAppForm(items) {
  ui.openModal((container) => {
    const title = document.createElement('h2');
    title.id = 'modal-title';
    title.textContent = tt('completeOrder');
    const form = document.createElement('form');
    form.className = 'checkout-form';
    
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = tt('name');
    nameLabel.setAttribute('for', 'customer-name');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'customer-name';
    nameInput.required = true;
    nameInput.placeholder = tt('namePlaceholder');
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    const addressGroup = document.createElement('div');
    addressGroup.className = 'form-group';
    const addressLabel = document.createElement('label');
    addressLabel.textContent = tt('address');
    addressLabel.setAttribute('for', 'customer-address');
    const addressInput = document.createElement('textarea');
    addressInput.id = 'customer-address';
    addressInput.required = true;
    addressInput.placeholder = tt('addressPlaceholder');
    addressInput.rows = 3;
    addressGroup.appendChild(addressLabel);
    addressGroup.appendChild(addressInput);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-actions';
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'submit';
    confirmBtn.className = 'buy-now-button';
    confirmBtn.textContent = tt('confirmOrder');
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'add-to-cart-button';
    cancelBtn.textContent = tt('cancel');
    cancelBtn.addEventListener('click', () => ui.closeModal());
    buttonGroup.appendChild(confirmBtn);
    buttonGroup.appendChild(cancelBtn);
    
    form.appendChild(nameGroup);
    form.appendChild(addressGroup);
    form.appendChild(buttonGroup);
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const address = addressInput.value.trim();
      if (!name || !address) {
        showToast(tt('pleaseFillFields'));
        return;
      }
      redirectToWhatsApp(name, address, items);
    });
    
    container.appendChild(title);
    container.appendChild(form);
  });
}

function redirectToWhatsApp(name, address, items) {
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemsText = items.map(item => `${getTranslatedProductName(item.id)} × ${item.qty} → ${buildCurrency(item.price * item.qty)}`).join('\n');
  const message = tt('whatsappOrder', { name, address, items: itemsText, total: buildCurrency(total) });
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/995597006664?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
  ui.closeModal();
  cart.clear();
  renderCartSidebar(cart, productService.getProducts());
  showToast(tt('orderSent'));
}

// Cart functions


function initCart() {
  const cartClose = document.getElementById('cart-close');
  const buySelected = document.getElementById('cart-buy-selected');
  const clearBtn = document.getElementById('cart-clear');
  cartClose?.addEventListener('click', () => closeCart());
  buySelected?.addEventListener('click', () => {
    const selected = cart.getSelected();
    if (!selected || selected.length === 0) { showToast(tt('pleaseSelectItems')); return; }
    closeCart();
    openWhatsAppForm(selected);
  });
  clearBtn?.addEventListener('click', () => { cart.clear(); renderCartSidebar(cart, productService.getProducts()); showToast(tt('cartCleared')); });
  // open cart when adding first time
  document.addEventListener('cart:open', () => openCart());
}

// Sort dropdown functionality
function initSortDropdown() {
  const toggle = document.getElementById('sort-toggle');
  const menu = document.getElementById('sort-menu');
  if (!toggle || !menu) return;
  const closeMenu = () => { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); toggle.classList.remove('active'); };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open', !expanded);
    toggle.classList.toggle('active', !expanded);
  });
  document.addEventListener('click', (e) => { if (!toggle.contains(e.target) && !menu.contains(e.target)) closeMenu(); });
  menu.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const { sort: key, order } = btn.dataset;
      productService.sortBy({ key, order });
      ui.currentPage = 1;
      ui.renderProducts(document.getElementById('product-list'), productService.getFiltered(), onBuy, onAdd);
      closeMenu();
    });
  });
}

// Category filter functionality
function initCategory() {
  const select = document.getElementById('category-select');
  if (!select) return;
  select.addEventListener('change', (e) => {
    productService.filterByCategory(e.target.value);
    ui.currentPage = 1;
    ui.renderProducts(document.getElementById('product-list'), productService.getFiltered(), onBuy, onAdd);
    // reset highlight on blur/close
    select.classList.add('active');
    setTimeout(() => select.classList.remove('active'), 200);
  });
  select.addEventListener('blur', () => select.classList.remove('active'));
}

// Search functionality
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  let timeout;
  input.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      productService.search(e.target.value);
      ui.currentPage = 1;
      ui.renderProducts(document.getElementById('product-list'), productService.getFiltered(), onBuy, onAdd);
    }, 250);
  });
}

// Modal close functionality - now handled by UIService
function initModalClose() {
  ui.initModal();
}

// AI chat functionality
function initAI() {
  const toggle = document.getElementById('chat-toggle');
  const container = document.getElementById('chat-container');
  const close = document.getElementById('chat-close');
  const send = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const addMsg = (text, sender) => {
    const wrap = document.createElement('div'); wrap.className = `chat-message ${sender}-message`;
    const content = document.createElement('div'); content.className = 'message-content'; content.textContent = text; wrap.appendChild(content); messages.appendChild(wrap);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  };
  const openChat = () => { container.classList.add('open'); container.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); input.focus(); };
  const closeChat = () => { container.classList.remove('open'); container.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', openChat);
  close?.addEventListener('click', closeChat);
  send?.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    ai.ask(text).then(response => addMsg(response, 'bot')).catch(() => addMsg('Sorry, I encountered an error.', 'bot'));
  });
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') send?.click(); });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', toggleTheme);
  updateThemeSwitch();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('medicineSeller-theme', next);
  updateThemeSwitch();
}

function updateThemeSwitch() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.setAttribute('aria-pressed', String(current === 'light'));
}

// Mini-cart helpers
function renderMiniCartPreview() {
  const mini = document.getElementById('mini-cart');
  if (!mini) return;
  const items = cart.getItems();
  mini.innerHTML = '';
  if (items.length === 0) {
    const empty = document.createElement('div'); empty.className='mini-cart-empty'; empty.textContent='Cart is empty'; mini.appendChild(empty);
  } else {
    items.slice(0, 5).forEach(i => {
      const row = document.createElement('div'); row.className='mini-cart-item';
      const img = document.createElement('img'); img.src = i.image; img.alt = i.name; img.loading='lazy'; img.decoding='async';
      const name = document.createElement('div'); name.textContent = `${getTranslatedProductName(i.id)} × ${i.qty}`;
      const price = document.createElement('div'); price.className = 'ml-auto'; price.textContent = buildCurrency(i.price * i.qty);
      row.appendChild(img); row.appendChild(name); row.appendChild(price); mini.appendChild(row);
    });
  }
  mini.classList.add('open');
}

function openMiniCartPreview() { renderMiniCartPreview(); }
function closeMiniCartPreviewDelayed() { 
  setTimeout(()=>{ document.getElementById('mini-cart')?.classList.remove('open'); }, 300); 
}

// Language toggle functionality
function initLanguageToggle() {
  const flagBtn = document.getElementById('lang-flag');
  if (!flagBtn) return;
  
  const updateFlag = () => {
    flagBtn.textContent = CURRENT_LANG === 'ru' ? '🇷🇺' : '🇬🇧';
  };
  
  const applyTranslations = () => {
    // Update static elements
    const siteTitle = document.querySelector('.site-title');
    if (siteTitle) siteTitle.textContent = tt('siteTitle');
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = tt('searchPlaceholder');
    
    const allCategoriesOption = document.querySelector('#category-select option[value="all"]');
    if (allCategoriesOption) allCategoriesOption.textContent = tt('allCategories');
    
    const sortToggle = document.getElementById('sort-toggle');
    if (sortToggle) sortToggle.textContent = tt('sort');
    
    // Update sort dropdown options
    const sortOptions = document.querySelectorAll('#sort-menu .dropdown-item');
    if (sortOptions.length >= 4) {
      sortOptions[0].textContent = tt('sortByNameAsc');
      sortOptions[1].textContent = tt('sortByNameDesc');
      sortOptions[2].textContent = tt('sortByPriceAsc');
      sortOptions[3].textContent = tt('sortByPriceDesc');
    }
    
    // Update cart elements
    const cartTitle = document.getElementById('cart-title');
    if (cartTitle) cartTitle.textContent = tt('yourCart');
    
    const cartBuySelected = document.getElementById('cart-buy-selected');
    if (cartBuySelected) cartBuySelected.textContent = tt('buySelected');
    
    const cartClear = document.getElementById('cart-clear');
    if (cartClear) cartClear.textContent = tt('clearCart');
    
    // Update AI chat elements
    const chatHeader = document.querySelector('#chat-container h3');
    if (chatHeader) chatHeader.textContent = tt('aiAssistant');
    
    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.placeholder = tt('askAboutMedicines');
    
    const chatSend = document.getElementById('chat-send');
    if (chatSend) {
      const sendIcon = chatSend.querySelector('.send-icon');
      if (sendIcon) {
        // Hide icon and show text
        sendIcon.classList.add('hidden');
        chatSend.textContent = tt('sendMessage');
      }
    }
    
    // Update AI greeting
    const aiGreeting = document.querySelector('.bot-message .message-content');
    if (aiGreeting) aiGreeting.textContent = tt('aiGreeting');
    
    // Update footer
    const footer = document.querySelector('footer p');
    if (footer) footer.textContent = tt('copyright');
    
    // Update pagination text
    const showingPageText = document.getElementById('showing-page-text');
    if (showingPageText) showingPageText.textContent = tt('showingPage');
    
    const ofText = document.getElementById('of-text');
    if (ofText) ofText.textContent = tt('of');
    
    // Re-render dynamic content
    const listEl = document.getElementById('product-list');
    if (listEl) {
      ui.renderProducts(listEl, productService.getFiltered(), onBuy, onAdd);
    }
    
    // Re-render cart to update translated names
    renderCartSidebar(cart, productService.getProducts());
  };
  
  updateFlag();
  applyTranslations();
  
  flagBtn.addEventListener('click', () => {
    CURRENT_LANG = CURRENT_LANG === 'ru' ? 'en' : 'ru';
    localStorage.setItem(LANG_KEY, CURRENT_LANG);
    updateFlag();
    applyTranslations();
  });
}

// Initialize the application when DOM is loaded
async function bootstrap() {
  const listEl = document.getElementById('product-list');
  ui.renderSkeletons(listEl, 6);
  
  try {
    await productService.load();
    
    // Check if there was an error during loading
    if (productService.hasError()) {
      const error = productService.getLoadError();
      console.warn('Product loading warning:', error.message);
      
      // Show user-friendly warning if using fallback data
      if (error.message.includes('Using fallback data')) {
        showToast('⚠️ Using offline product data. Some products may not be available.');
      }
    }
    
    // Check if we have any products at all
    if (productService.getProducts().length === 0) {
      console.error('No products available!');
      showToast('❌ No products available. Please check your connection and refresh the page.');
      
      // Show error message in the product list
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <h3>No Products Available</h3>
          <p>Unable to load product data. Please check your connection and refresh the page.</p>
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); border: none; border-radius: 8px; color: white; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
      return;
    }
    
  } catch (error) {
    console.error('Critical error loading products:', error);
    showToast('💥 Critical error loading products. Please refresh the page.');
    
    // Show critical error message
    listEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <h3>Critical Error</h3>
        <p>Unable to load any product data. Please refresh the page or contact support.</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); border: none; border-radius: 8px; color: white; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
    return;
  }
  
  ui.renderCategories(document.getElementById('category-select'), productService.getCategories());
  ui.renderProducts(listEl, productService.getFiltered(), onBuy, onAdd);
  renderCartSidebar(cart, productService.getProducts());
  initSortDropdown();
  initCategory();
  initSearch();
  initCart();
  initModalClose();
  initAI();
  initThemeToggle();
  initLanguageToggle();

  // floating cart button
  const fab = document.getElementById('cart-fab');
  fab?.addEventListener('click', () => { renderCartSidebar(cart, productService.getProducts()); openCart(); });

  // close cart when clicking overlay
  document.getElementById('cart-overlay')?.addEventListener('click', () => closeCart());

}

document.addEventListener('DOMContentLoaded', bootstrap);