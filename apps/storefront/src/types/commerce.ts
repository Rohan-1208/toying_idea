import type { Money } from "./catalog";

export type CartItem = {
  id: string;
  productSlug: string;
  variantId: string;
  quantity: number;
};

export type Cart = {
  id: string;
  currency: Money["currency"];
  items: CartItem[];
  updatedAt: string;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  status:
    | "Placed"
    | "In production"
    | "Quality check"
    | "Shipped"
    | "Delivered";
  trackingId?: string;
  items: Array<{
    productSlug: string;
    variantId: string;
    quantity: number;
    unitPrice: Money;
  }>;
};

export type TrackingEvent = {
  id: string;
  at: string;
  title: string;
  description?: string;
};

export type TrackOrderResponse = {
  order?: Order;
  events: TrackingEvent[];
};

