export interface Channel {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 country code */
  country: string;
  /** category ids (max 3) */
  categories: string[];
  /** ISO 639-3 language code */
  language: string | null;
  logo: string | null;
  stream: string;
  quality: string;
  is247: boolean;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Dataset {
  generatedAt: string;
  source: string;
  stats: {
    channels: number;
    countries: number;
    categories: number;
  };
  categories: Category[];
  countries: Country[];
  channels: Channel[];
}

export interface ChannelsResponse {
  items: Channel[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CategoriesResponse {
  items: Array<Category & { count: number }>;
}

export interface CountriesResponse {
  items: Array<Country & { count: number }>;
}

export interface MetaResponse {
  stats: { channels: number; countries: number; categories: number };
  generatedAt: string;
  source: string;
  dataOrigin: "remote" | "snapshot";
}
