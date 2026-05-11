export const CATALOG_PRODUCT_CONTRACT = 'catalog-product-v1';
export const CART_CHECKOUT_CONTRACT = 'cart-checkout-v1';
export const CART_COUPON_CONTRACT = 'cart-coupon-v1';

export function addCatalogProductToCart(product, quantity) {
  if (!product || !Number.isInteger(product.priceCents)) throw new Error('invalid catalog product');
  const line = {
    productId: product.id,
    unitPriceCents: product.priceCents,
    quantity,
  };
  return {
    lines: [line],
    subtotalCents: line.unitPriceCents * quantity,
    discountCents: 0,
    currency: 'JPY',
  };
}

export function applyCoupon(cart, code) {
  if (code !== 'SAVE10') return { ...cart, couponCode: null, discountCents: 0 };
  return { ...cart, couponCode: code, discountCents: Math.round(cart.subtotalCents * 0.1) };
}

export function buildCheckoutCart(cart) {
  return {
    lines: cart.lines,
    subtotalCents: cart.subtotalCents,
    discountCents: cart.discountCents,
    couponCode: cart.couponCode ?? null,
    totalCents: cart.subtotalCents - cart.discountCents,
    currency: cart.currency,
  };
}
