import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { addCatalogProductToCart, applyCoupon, buildCheckoutCart } from '../src/cart.mjs';

test('cart accepts catalog products and produces checkout cart', () => {
  const product = { id: 'sku-1', priceCents: 1200, stockStatus: 'in-stock' };
  const cart = addCatalogProductToCart(product, 2);
  const discounted = applyCoupon(cart, 'SAVE10');
  const checkoutCart = buildCheckoutCart(discounted);
  assert.equal(checkoutCart.subtotalCents, 2400);
  assert.equal(checkoutCart.discountCents, 240);
  assert.equal(checkoutCart.totalCents, 2160);
  assert.equal(checkoutCart.lines[0].stockStatus, 'in-stock');
});
