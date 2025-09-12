// ai.js - AI assistant with comprehensive local product knowledge

export class AIService {
  constructor(productService) {
    this.productService = productService;
  }

  buildProductContext() {
    const products = this.productService.getProducts();
    return products.map(p => `${p.name} | ${p.category} | ${p.active_ingredient} | ₽${p.price} | Stock: ${p.stock}`).join('\n');
  }

  async ask(prompt) {
    // First try to answer from local product data
    const local = this.answerFromLocal(prompt);
    if (local) return local;

    // Fallback to OpenAI via server-side proxy
    try {
      // TODO: This endpoint must be a server-side proxy that securely attaches the OPENAI_API_KEY.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          context: this.buildProductContext()
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data?.response?.trim() || 'I recommend consulting a healthcare professional for medical advice.';
    } catch (error) {
      console.error('AI service error:', error);
      return 'I recommend consulting a healthcare professional for medical advice.';
    }
  }

  answerFromLocal(query) {
    const q = query.toLowerCase();
    const products = this.productService.getProducts();
    
    // Helper function to get translated product info
    const getProductInfo = (product) => {
      const name = window.getTranslatedProductName ? window.getTranslatedProductName(product.id) : product.name;
      const description = window.getTranslatedProductDescription ? window.getTranslatedProductDescription(product.id) : product.description;
      const price = window.buildCurrency ? window.buildCurrency(product.price) : `₽${product.price}`;
      const stock = product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock';
      return { name, description, price, stock, original: product };
    };

    // Helper function to format product response
    const formatProducts = (products, maxCount = 5) => {
      return products.slice(0, maxCount).map(p => {
        const info = getProductInfo(p);
        return `${info.name} - ${info.price}\n${info.description}\nStock: ${info.stock}`;
      }).join('\n\n');
    };

    // Product search by name (handles "Do you have X in stock?" queries)
    if (q.includes('do you have') || q.includes('есть ли') || q.includes('have') || q.includes('stock') || q.includes('наличи')) {
      // Extract product name from query - improved logic
      const searchTerms = q
        .replace(/do you have|есть ли|in stock|в наличии|available|доступн|\?/g, '')
        .trim()
        .split(' ')
        .filter(word => word.length >= 3 && !['the', 'a', 'an', 'any', 'you', 'and'].includes(word.toLowerCase()));
      
      console.log('Search terms extracted:', searchTerms); // Debug log
      
      const matches = products.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.description.toLowerCase().includes(term.toLowerCase()) ||
          p.active_ingredient.toLowerCase().includes(term.toLowerCase())
        )
      );
      
      console.log('Matches found:', matches.map(p => p.name)); // Debug log
      
      if (matches.length > 0) {
        const product = matches[0];
        const info = getProductInfo(product);
        if (product.stock > 0) {
          return `Yes! ${info.name} is in stock. We have ${product.stock} units available.\n\nPrice: ${info.price}\n${info.description}`;
        } else {
          return `Sorry, ${info.name} is currently out of stock. \n\nPrice: ${info.price}\n${info.description}\n\nWould you like me to show you similar products?`;
        }
      }
    }

    // Ingredient queries (handles "What contains magnesium?" type queries)
    if (q.includes('contains') || q.includes('содержит') || q.includes('with') || q.includes('ingredient')) {
      const ingredients = {
        'magnesium': ['Magnesium Glycinate'],
        'melatonin': ['Melatonin Sleep Aid'],
        'vitamin d': ['Vitamin D3 Supreme'],
        'omega': ['Omega-3 Complete'],
        'aspirin': ['Aspirin Plus'],
        'probiotic': ['Probiotic Balance'],
        'collagen': ['Collagen Beauty'],
        'zinc': ['Zinc Immune Support'],
        'turmeric': ['Turmeric Curcumin'],
        'glucosamine': ['Glucosamine Joint Care'],
        'coq10': ['CoQ10 Heart Health'],
        'vitamin b': ['B-Complex Energy']
      };

      for (const [ingredient, productNames] of Object.entries(ingredients)) {
        if (q.includes(ingredient)) {
          const matchedProducts = products.filter(p => 
            productNames.some(name => p.name.includes(name)) ||
            p.active_ingredient.toLowerCase().includes(ingredient)
          );
          
          if (matchedProducts.length > 0) {
            return `Products containing ${ingredient}:\n\n${formatProducts(matchedProducts)}`;
          }
        }
      }

      // General ingredient search
      const ingredientTerms = q.split(' ').filter(word => 
        !['what', 'contains', 'with', 'ingredient', 'products', 'medicine'].includes(word)
      );
      
      const ingredientMatches = products.filter(p => 
        ingredientTerms.some(term => 
          p.active_ingredient.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term)
        )
      );
      
      if (ingredientMatches.length > 0) {
        return `Products with those ingredients:\n\n${formatProducts(ingredientMatches)}`;
      }
    }

    // Category queries
    if (q.includes('category') || q.includes('категория') || q.includes('show') || q.includes('покажи')) {
      const categoryMap = {
        'pain': 'Pain Relief',
        'боль': 'Pain Relief',
        'витамин': 'Vitamins & Supplements',
        'vitamin': 'Vitamins & Supplements',
        'сон': 'Sleep & Relaxation',
        'sleep': 'Sleep & Relaxation',
        'красота': 'Beauty & Wellness',
        'beauty': 'Beauty & Wellness',
        'пищеварение': 'Digestive Health',
        'digestive': 'Digestive Health',
        'сердце': 'Heart Health',
        'heart': 'Heart Health',
        'суставы': 'Joint Health',
        'joint': 'Joint Health'
      };

      for (const [key, category] of Object.entries(categoryMap)) {
        if (q.includes(key)) {
          const categoryProducts = products.filter(p => p.category === category);
          if (categoryProducts.length > 0) {
            return `Here are our ${category} products:\n\n${formatProducts(categoryProducts)}`;
          }
        }
      }

      // Show all categories
      if (q.includes('все категории') || q.includes('all categories')) {
        const categories = this.productService.getCategories();
        return `Available categories:\n${categories.map(cat => `• ${cat}`).join('\n')}`;
      }
    }

    // Price queries
    if (q.includes('цена') || q.includes('price') || q.includes('стоимость') || q.includes('cost')) {
      if (q.includes('дешев') || q.includes('cheap') || q.includes('недорог')) {
        const cheapProducts = products.filter(p => p.price < 200).sort((a, b) => a.price - b.price);
        if (cheapProducts.length > 0) {
          return `Here are our most affordable products:\n\n${formatProducts(cheapProducts)}`;
        }
      }
      
      if (q.includes('дорог') || q.includes('expensive') || q.includes('премиум')) {
        const expensiveProducts = products.filter(p => p.price > 500).sort((a, b) => b.price - a.price);
        if (expensiveProducts.length > 0) {
          return `Here are our premium products:\n\n${formatProducts(expensiveProducts)}`;
        }
      }
    }

    // Stock queries
    if (q.includes('наличие') || q.includes('stock') || q.includes('в наличии') || q.includes('available')) {
      const inStock = products.filter(p => p.stock > 0);
      const outOfStock = products.filter(p => p.stock === 0);
      
      return `Stock status:\n• ${inStock.length} products in stock\n• ${outOfStock.length} products out of stock\n\nAvailable products:\n\n${formatProducts(inStock)}`;
    }

    // Health condition mapping
    const healthConditions = {
      'головная боль': ['Aspirin Plus'],
      'headache': ['Aspirin Plus'],
      'боль': ['Aspirin Plus'],
      'pain': ['Aspirin Plus'],
      'витамин': ['Vitamin D3 Supreme', 'Omega-3 Complete', 'B-Complex Energy'],
      'vitamin': ['Vitamin D3 Supreme', 'Omega-3 Complete', 'B-Complex Energy'],
      'сон': ['Melatonin Sleep Aid'],
      'sleep': ['Melatonin Sleep Aid'],
      'бессонница': ['Melatonin Sleep Aid'],
      'insomnia': ['Melatonin Sleep Aid'],
      'кожа': ['Collagen Beauty'],
      'skin': ['Collagen Beauty'],
      'волосы': ['Collagen Beauty'],
      'hair': ['Collagen Beauty'],
      'пищеварение': ['Probiotic Balance'],
      'digestion': ['Probiotic Balance'],
      'иммунитет': ['Zinc Immune Support', 'Vitamin D3 Supreme'],
      'immune': ['Zinc Immune Support', 'Vitamin D3 Supreme'],
      'энергия': ['B-Complex Energy'],
      'energy': ['B-Complex Energy'],
      'суставы': ['Glucosamine Joint Care', 'Turmeric Curcumin'],
      'joints': ['Glucosamine Joint Care', 'Turmeric Curcumin'],
      'сердце': ['CoQ10 Heart Health', 'Omega-3 Complete'],
      'heart': ['CoQ10 Heart Health', 'Omega-3 Complete']
    };

    for (const [condition, productNames] of Object.entries(healthConditions)) {
      if (q.includes(condition)) {
        const matchedProducts = products.filter(p => 
          productNames.some(name => p.name.includes(name))
        );
        
        if (matchedProducts.length > 0) {
          return `For ${condition}, I recommend:\n\n${formatProducts(matchedProducts)}`;
        }
      }
    }

    // General product search
    if (q.includes('найти') || q.includes('find') || q.includes('search') || q.includes('ищу') || q.includes('looking for')) {
      const searchTerms = q
        .replace(/найти|find|search|ищу|looking for|для|for|мне|me/g, '')
        .split(' ')
        .filter(word => word.length > 2);
      
      const matches = products.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.active_ingredient.toLowerCase().includes(term)
        )
      );
      
      if (matches.length > 0) {
        return `I found ${matches.length} product(s) matching your search:\n\n${formatProducts(matches)}`;
      }
    }

    // General recommendations
    if (q.includes('рекоменд') || q.includes('recommend') || q.includes('посовет') || q.includes('suggest')) {
      const featured = products.filter(p => p.id <= 3); // Featured products
      return `Here are our top recommendations:\n\n${formatProducts(featured)}`;
    }

    // Help queries
    if (q.includes('помощь') || q.includes('help') || q.includes('что умеешь') || q.includes('what can you do')) {
      return `I can help you with:\n• Finding products by name or condition\n• Checking stock availability\n• Showing products by category\n• Getting prices and product information\n• Information about ingredients\n• Product recommendations\n\nJust ask me about any health condition or product you're looking for!`;
    }

    // Default category fallback - try to match any product names or ingredients
    const words = q.split(' ').filter(word => word.length > 2);
    const generalMatches = products.filter(p => 
      words.some(word => 
        p.name.toLowerCase().includes(word) ||
        p.description.toLowerCase().includes(word) ||
        p.active_ingredient.toLowerCase().includes(word) ||
        p.category.toLowerCase().includes(word)
      )
    );
    
    if (generalMatches.length > 0) {
      return `Here's what I found:\n\n${formatProducts(generalMatches, 3)}`;
    }

    return null; // No local match found, will fallback to API
  }
}