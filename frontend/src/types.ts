export type TabType = 'home' | 'products' | 'contact' | 'admin';

export interface ProductSpec {
  power: string;
  voltage: string;
  diameter: string;
  heatedLength: string;
  maxTemperature: string;
  wavelength?: string;
  material?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  category: 'quartz-tubes' | 'infrared' | 'ceramic' | 'ovens' | 'tubular-heaters';
  description: string;
  longDescription: string;
  specifications: ProductSpec;
  features: string[];
  applications: string[];
  imageUrl?: string;
  additionalImages?: string[];
  order?: number;
}

export interface CompanyFact {
  id: string;
  title: string;
  value: string;
  label: string;
  icon: string;
  hoverDetail: string;
  metricLabel: string;
  metricValue: string;
}

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  isWhatsApp?: boolean;
  isCallback?: boolean;
  preferredTime?: string;
  topic?: string;
  products?: string[]; // IDs of products interested in
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  temperature?: string;
}
