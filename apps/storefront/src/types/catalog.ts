export type Money = {
  currency: "USD" | "INR" | "EUR";
  amount: number;
};

export type ProductBadge = "Collector" | "Limited" | "New" | "Low stock";

export type ProductImage = {
  id: string;
  alt: string;
  url: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  material: "PLA" | "PETG" | "Resin";
  finish: "Matte" | "Satin" | "Gloss";
  size: "Small" | "Medium" | "Large";
  inStock: boolean;
  price: Money;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  badges: ProductBadge[];
  categories: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  featuredRank?: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  productSlugs: string[];
};
