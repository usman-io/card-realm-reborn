const POKEMON_API_BASE = 'https://api.pokemontcg.io/v2';
const API_BASE_URL = 'http://localhost:8000';

export const pokemonApi = {
  getCards: async (params: Record<string, string> = {}) => {
    const url = new URL(`${POKEMON_API_BASE}/cards`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch cards');
    const data = await response.json();
    return {
      ...data,
      totalCount: data.totalCount
    };
  },

  getCard: async (id: string) => {
    const response = await fetch(`${POKEMON_API_BASE}/cards/${id}`);
    if (!response.ok) throw new Error('Failed to fetch card');
    return response.json();
  },

  getSets: async (params: Record<string, string> = {}) => {
    const url = new URL(`${POKEMON_API_BASE}/sets`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch sets');
    return response.json();
  },

  getSet: async (id: string) => {
    const response = await fetch(`${POKEMON_API_BASE}/sets/${id}`);
    if (!response.ok) throw new Error('Failed to fetch set');
    return response.json();
  },
};

export const backendApi = {
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  },

  login: async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  },

  getUserProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  },

  updateUserProfile: async (token: string, userData: any) => {
     const response = await fetch(`${API_BASE_URL}/api/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    return response.json();
  },

  getCollection: async (token: string, page: number = 1, pageSize: number = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/collection/?page=${page}&page_size=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch collection');
    }
    return response.json();
  },

  addToCollection: async (token: string, cardId: string, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/api/collection/add/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ card_id: cardId, quantity: quantity }),
    });
    if (!response.ok) {
      throw new Error('Failed to add to collection');
    }
    return response.json();
  },

  updateCollectionItem: async (token: string, collectionId: number, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/api/collection/update/${collectionId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: quantity }),
    });
    if (!response.ok) {
      throw new Error('Failed to update collection item');
    }
    return response.json();
  },

  deleteCollectionItem: async (token: string, collectionId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/collection/delete/${collectionId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete collection item');
    }
    return response.json();
  },

  getWishlist: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    return response.json();
  },

  addToWishlist: async (token: string, cardId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/add/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ card_id: cardId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add to wishlist');
    }
    return response.json();
  },

  deleteWishlistItem: async (token: string, wishlistItemId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/delete/${wishlistItemId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete wishlistItem');
    }
    return response.json();
  },

  getDashboardAnalytics: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard-analytics/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard analytics');
    }
    return response.json();
  },

  getSubscription: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }
    return response.json();
  },

  createCheckoutSession: async (token: string, plan: 'monthly' | 'yearly') => {
    const response = await fetch(`${API_BASE_URL}/api/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    return response.json();
  },

  createPortalSession: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/create-portal-session/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }
    
    return response.json();
  },

  cancelSubscription: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/cancel-subscription/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
    
    return response.json();
  },
};
