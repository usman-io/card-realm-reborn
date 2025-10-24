// API service functions
const API_BASE_URL = 'http://localhost:8000/api';
const TCGDEX_API_BASE = 'https://api.tcgdex.net/v2'; // Base URL without language, will be appended

// Language mapping for TCGdex API
const getLanguageCode = (lang: string): string => {
  switch (lang) {
    case 'zh':
      return 'zh-tw';
    default:
      return lang;
  }
};

// TCGdex API calls (replacing Pokemon TCG API)
export const pokemonApi = {
  // Helper to transform TCGdex card to match our existing structure
  transformCard(card: any, setData?: any, langCode?: string): any {
    return {
      id: card.id, // Use the original TCGdx ID (e.g., "base3-1")
      localId: card.localId,
      name: card.name,
      hp: card.hp,
      types: card.types || [],
      attacks: card.attacks?.map((attack: any) => ({
        name: attack.name,
        cost: attack.cost || [],
        damage: attack.damage || '',
        text: attack.effect || '',
        effect: attack.effect,
        convertedEnergyCost: attack.cost?.length || 0,
      })) || [],
      weaknesses: card.weaknesses?.map((w: any) => ({
        type: w.type,
        value: w.value || '',
      })) || [],
      resistances: card.resistances?.map((r: any) => ({
        type: r.type,
        value: r.value || '',
      })) || [],
      retreat: card.retreat,
      set: setData || card.set || {
        id: 'unknown',
        name: 'Unknown Set',
        series: 'Unknown',
        total: 0,
        images: { symbol: '', logo: '' },
      },
      number: card.localId || card.id,
      artist: card.illustrator || card.artist,
      rarity: card.rarity || 'Common',
      flavorText: card.description,
      image: card.image,
      category: card.category,
      stage: card.stage,
      supertype: card.category || 'Pokémon',
      subtypes: card.stage ? [card.stage] : [],
      legalities: card.legal || {},
      nationalPokedexNumbers: card.dexId || [],
      images: {
        small: card.image ? `${card.image}/high.png` : `https://assets.tcgdex.net/${langCode || 'en'}/${setData?.serie?.id || 'unknown'}/${setData?.id || 'unknown'}/${card.localId || card.id}/high.png`,
        large: card.image ? `${card.image}/high.png` : `https://assets.tcgdex.net/${langCode || 'en'}/${setData?.serie?.id || 'unknown'}/${setData?.id || 'unknown'}/${card.localId || card.id}/high.png`,
      },
      illustrator: card.illustrator,
      regulationMark: card.regulationMark,
      // Add pricing data from TCGdx API
      pricing: card.pricing || null,
      // Add variants data from TCGdx API
      variants: card.variants || null,
      variants_detailed: card.variants_detailed || [],
      abilities: card.abilities || [],
    };
  },

  // Helper to transform TCGdex set to match our existing structure
  transformSet(set: any): any {
    // Add .png to image URLs if they don't have it
    const logoUrl = set.logo ? (set.logo.endsWith('.png') || set.logo.endsWith('.jpg') ? set.logo : `${set.logo}.png`) : '';
    const symbolUrl = set.symbol ? (set.symbol.endsWith('.png') || set.symbol.endsWith('.jpg') ? set.symbol : `${set.symbol}.png`) : '';
    
    return {
      id: set.id,
      name: set.name,
      logo: logoUrl,
      symbol: symbolUrl,
      series: set.serie?.name || 'Unknown',
      total: set.cardCount?.total || 0,
      printedTotal: set.cardCount?.official || set.cardCount?.total || 0,
      releaseDate: set.releaseDate,
      ptcgoCode: set.tcgOnline,
      images: {
        symbol: symbolUrl,
        logo: logoUrl,
      },
      legalities: {},
      updatedAt: new Date().toISOString(),
      cardCount: set.cardCount,
      serie: set.serie,
      tcgOnline: set.tcgOnline,
    };
  },

  async getCards(params: Record<string, string> = {}, language?: string) {
    try {
      const page = parseInt(params.page || '1');
      const pageSize = parseInt(params.pageSize || '30');
      const langCode = language ? getLanguageCode(language) : 'en';
      const apiBase = `${TCGDEX_API_BASE}/${langCode}`;

      // TCGdex doesn't support pagination parameters, so we fetch all cards and paginate client-side

      // If searching by set.id
      if (params.q && params.q.includes('set.id:')) {
        const setId = params.q.replace('set.id:', '').trim();
        const setResponse = await fetch(`${apiBase}/sets/${setId}`);
        const setData = await setResponse.json();

        if (setData.cards) {
          let cardsArray = setData.cards;
          if (langCode === 'ja') {
            cardsArray = cardsArray.filter((card: any) => card.image);
          }
          const transformedCards = cardsArray.map((card: any) =>
            this.transformCard(card, this.transformSet(setData), langCode)
          );

          // Sort by number if requested
          if (params.orderBy === 'number') {
            transformedCards.sort((a: any, b: any) => {
              const aNum = parseInt(a.number) || 0;
              const bNum = parseInt(b.number) || 0;
              return aNum - bNum;
            });
          }

          // Apply client-side pagination
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedCards = transformedCards.slice(startIndex, endIndex);

          return {
            data: paginatedCards,
            totalCount: transformedCards.length,
            page,
            pageSize,
          };
        }
      }

      // If searching by name
      if (params.q && params.q.includes('name:')) {
        const searchTerm = params.q.replace('name:', '').replace('*', '').trim();
        const response = await fetch(`${apiBase}/cards?name=${encodeURIComponent(searchTerm)}`);
        let cardsArray = await response.json();
        if (langCode === 'ja') {
          cardsArray = cardsArray.filter((card: any) => card.image);
        }

        // Apply sorting if requested
        let sortedCards = cardsArray;
        if (params.orderBy === 'number') {
          sortedCards = cardsArray.sort((a: any, b: any) => {
            const aNum = parseInt(a.localId) || 0;
            const bNum = parseInt(b.localId) || 0;
            return aNum - bNum;
          });
        } else if (params.orderBy === '-number') {
          sortedCards = cardsArray.sort((a: any, b: any) => {
            const aNum = parseInt(a.localId) || 0;
            const bNum = parseInt(b.localId) || 0;
            return bNum - aNum;
          });
        } else if (params.orderBy === 'name') {
          sortedCards = cardsArray.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else if (params.orderBy === '-name') {
          sortedCards = cardsArray.sort((a: any, b: any) => b.name.localeCompare(a.name));
        }

        // Apply client-side pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCards = sortedCards.slice(startIndex, endIndex);

        // Transform cards
        const transformedCards = paginatedCards.map((card: any) => {
          return this.transformCard(card, undefined, langCode);
        });

        return {
          data: transformedCards,
          totalCount: sortedCards.length,
          page,
          pageSize,
        };
      }

      // Default: get all cards from the /cards endpoint
      const response = await fetch(`${apiBase}/cards`);
      let cardsArray = await response.json();
      if (langCode === 'ja') {
        cardsArray = cardsArray.filter((card: any) => card.image);
      }

      // Apply sorting if requested
      let sortedCards = cardsArray;
      if (params.orderBy === 'number') {
        sortedCards = cardsArray.sort((a: any, b: any) => {
          const aNum = parseInt(a.localId) || 0;
          const bNum = parseInt(b.localId) || 0;
          return aNum - bNum;
        });
      } else if (params.orderBy === '-number') {
        sortedCards = cardsArray.sort((a: any, b: any) => {
          const aNum = parseInt(a.localId) || 0;
          const bNum = parseInt(b.localId) || 0;
          return bNum - aNum;
        });
      } else if (params.orderBy === 'name') {
        sortedCards = cardsArray.sort((a: any, b: any) => a.name.localeCompare(b.name));
      } else if (params.orderBy === '-name') {
        sortedCards = cardsArray.sort((a: any, b: any) => b.name.localeCompare(a.name));
      }

      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCards = sortedCards.slice(startIndex, endIndex);

      // Transform cards (we'll need to fetch set data for each card if needed)
      const transformedCards = paginatedCards.map((card: any) => {
        // For now, we'll transform without set data since we don't have it
        // In a real implementation, you might want to batch fetch set data
        return this.transformCard(card, undefined, langCode);
      });

      return {
        data: transformedCards,
        totalCount: sortedCards.length,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('Error fetching cards:', error);
      return { data: [], totalCount: 0, page: 1, pageSize: 30 };
    }
  },

  async getCard(id: string, language?: string) {
    try {
      const langCode = language ? getLanguageCode(language) : 'en';
      const apiBase = `${TCGDEX_API_BASE}/${langCode}`;

      // TCGdx card ID format: base3-1 (direct fetch)
      const response = await fetch(`${apiBase}/cards/${id}`);
      const card = await response.json();

      // Fetch set data for proper transformation
      const setResponse = await fetch(`${apiBase}/sets/${card.set.id}`);
      const setData = await setResponse.json();

      return { data: this.transformCard(card, this.transformSet(setData), langCode) };
    } catch (error) {
      console.error('Error fetching card:', error);
      throw error;
    }
  },

  async getSets(params: Record<string, string> = {}, language?: string) {
    try {
      const langCode = language ? getLanguageCode(language) : 'en';
      const apiBase = `${TCGDEX_API_BASE}/${langCode}`;
      const response = await fetch(`${apiBase}/sets`);
      const sets = await response.json();
      const transformedSets = sets.map((set: any) => this.transformSet(set));

      // Sort by release date if requested
      if (params.orderBy === '-releaseDate') {
        transformedSets.sort((a: any, b: any) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      }

      return {
        data: transformedSets,
        totalCount: transformedSets.length,
      };
    } catch (error) {
      console.error('Error fetching sets:', error);
      return { data: [], totalCount: 0 };
    }
  },

  async getSet(id: string, language?: string) {
    try {
      const langCode = language ? getLanguageCode(language) : 'en';
      const apiBase = `${TCGDEX_API_BASE}/${langCode}`;
      const response = await fetch(`${apiBase}/sets/${id}`);
      const set = await response.json();
      return { data: this.transformSet(set) };
    } catch (error) {
      console.error('Error fetching set:', error);
      throw error;
    }
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

  async getSharedCollection(userId: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/shared/collection/${userId}/${searchParams.toString() ? '?' + searchParams.toString() : ''}`.replace('//?', '?');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch shared collection: ${response.statusText}`);
    }
    return response.json();
  },

  async getSharedWishlist(userId: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/shared/wishlist/${userId}/${searchParams.toString() ? '?' + searchParams.toString() : ''}`.replace('//?', '?');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch shared wishlist: ${response.statusText}`);
    }
    return response.json();
  },

  async getSharedDashboardAnalytics(userId: string) {
    const response = await fetch(`${API_BASE_URL}/shared/dashboard/analytics/${userId}/`);
    return response.json();
  },
};
