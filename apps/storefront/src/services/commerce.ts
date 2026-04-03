import type { Cart } from "@/types/commerce";
import type { TrackOrderResponse } from "@/types/commerce";

export async function getCart(): Promise<Cart> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cart");
  const data = (await res.json()) as { cart: Cart };
  return data.cart;
}

export async function addToCart(input: {
  productSlug: string;
  variantId: string;
  quantity: number;
}): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  const data = (await res.json()) as { cart: Cart };
  return data.cart;
}

export async function updateCartItem(input: { itemId: string; quantity: number }): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update cart");
  const data = (await res.json()) as { cart: Cart };
  return data.cart;
}

export async function clearCart(): Promise<void> {
  const res = await fetch("/api/cart", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear cart");
}

export async function trackOrder(orderNumber: string): Promise<TrackOrderResponse> {
  const url = new URL("/api/track-order", window.location.origin);
  url.searchParams.set("order", orderNumber);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to track order");
  return (await res.json()) as TrackOrderResponse;
}
