export const CATALOG_PRODUCT_CONTRACT = 'catalog-product-v1';
export const CART_CHECKOUT_CONTRACT = 'cart-checkout-v1';

export function addCatalogProductToCart(product, quantity) {
  if (!product || !Number.isInteger(product.priceCents)) throw new Error('invalid catalog product');
  if (product.stockStatus !== 'in-stock') throw new Error('cannot add out-of-stock product');
  const line = {
    productId: product.id,
    unitPriceCents: product.priceCents,
    quantity,
    category: product.category,
    taxClass: product.taxClass,
    stockStatus: product.stockStatus,
    fulfillmentRegion: product.fulfillmentRegion,
  };
  return {
    lines: [line],
    subtotalCents: line.unitPriceCents * quantity,
    lineCount: 1,
    currency: 'JPY',
  };
}

export function buildCheckoutCart(cart) {
  return {
    lines: cart.lines,
    subtotalCents: cart.subtotalCents,
    totalCents: cart.subtotalCents,
    lineCount: cart.lines.length,
    currency: cart.currency,
    pricingMode: 'gross',
  };
}
