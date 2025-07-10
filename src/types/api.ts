
// API types for Pokemon TCG and our backend
export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: PokemonSet;
  number: string;
  artist?: string;
  rarity: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: Legalities;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      holofoil?: PriceRange;
      reverseHolofoil?: PriceRange;
      normal?: PriceRange;
    };
  };
}

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: Legalities;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface Legalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

export interface PriceRange {
  low: number;
  mid: number;
  high: number;
  market: number;
  directLow?: number;
}

// Backend API types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Collection {
  id: number;
  user: number;
  card_id: string;
  quantity: number;
  condition: string;
  variant: string;
  language: string;
  is_graded: boolean;
  notes: string;
  added_date: string;
  updated_date: string;
}

export interface Wishlist {
  id: number;
  user: number;
  card_id: string;
  priority: string;
  added_date: string;
  notes: string;
}

export interface CollectionStats {
  total_cards: number;
  unique_cards: number;
  wishlist_count: number;
}

export interface Subscription {
  id: number;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'incomplete' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  is_active: boolean;
  subscribed?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
