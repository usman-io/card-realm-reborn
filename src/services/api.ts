
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

  async getCollection(token: string) {
    const response = await fetch(`${API_BASE_URL}/collection/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },

  async addToWishlist(token: string, cardData: {
    card_id: string;
    priority: string;
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

  async getWishlist(token: string) {
    const response = await fetch(`${API_BASE_URL}/wishlist/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    return response.json();
  },
};
