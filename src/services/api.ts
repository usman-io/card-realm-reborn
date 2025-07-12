// API service functions
const API_BASE_URL = 'http://localhost:8000/api';
const POKEMON_API_BASE = 'https://api.pokemontcg.io/v2';

// Get Pokemon API key from environment
const POKEMON_API_KEY = import.meta.env.VITE_POKEMON_API_KEY;

// Pokemon TCG API calls
export const pokemonApi = {
  async getCards(params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${POKEMON_API_BASE}/cards?${searchParams}`, {
      headers: {
        'X-Api-Key': POKEMON_API_KEY || '',
      },
    });
    return response.json();
  },

  async getCard(id: string) {
    const response = await fetch(`${POKEMON_API_BASE}/cards/${id}`, {
      headers: {
        'X-Api-Key': POKEMON_API_KEY || '',
      },
    });
    return response.json();
  },

  async getSets(params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${POKEMON_API_BASE}/sets?${searchParams}`, {
      headers: {
        'X-Api-Key': POKEMON_API_KEY || '',
      },
    });
    return response.json();
  },

  async getSet(id: string) {
    const response = await fetch(`${POKEMON_API_BASE}/sets/${id}`, {
      headers: {
        'X-Api-Key': POKEMON_API_KEY || '',
      },
    });
    return response.json();
  },
};

// Backend API calls
export const backendApi = {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async addToCollection(token: string, cardData: {
    card_id: string;
    quantity: number;
    condition: string;
    variant?: string;
    language?: string;
    is_graded?: boolean;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/collection/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  async getCollection(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/collection/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async updateCollectionItem(token: string, id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/collection/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCollectionItem(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/collection/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.ok;
  },

  async addToWishlist(token: string, cardData: {
    card_id: string;
    priority: string;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/wishlist/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  async getWishlist(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/wishlist/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async updateWishlistItem(token: string, id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteWishlistItem(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.ok;
  },

  async addCardNote(token: string, cardData: {
    card_id: string;
    note: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(cardData),
    });
    return response.json();
  },

  async getCardNotes(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/notes/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async updateCardNote(token: string, id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCardNote(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.ok;
  },

  async getCollectionStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/collection/stats/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getDashboardAnalytics(token: string) {
    const response = await fetch(`${API_BASE_URL}/dashboard/analytics/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getUserActivities(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/activities/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getUserCollectionCards(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/user/collection/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getUserWishlistCards(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/user/wishlist/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getUserGradedCards(token: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/user/graded/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async getSubscription(token: string) {
    const response = await fetch(`${API_BASE_URL}/subscription/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async createCheckoutSession(token: string, plan: 'monthly' | 'yearly') {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ plan }),
    });
    return response.json();
  },

  async createPortalSession(token: string) {
    const response = await fetch(`${API_BASE_URL}/create-portal-session/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async cancelSubscription(token: string) {
    const response = await fetch(`${API_BASE_URL}/cancel-subscription/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },
};
