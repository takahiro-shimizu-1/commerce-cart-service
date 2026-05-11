import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { addCatalogProductToCart, buildCheckoutCart } from '../src/cart.mjs';

test('cart accepts catalog products and produces checkout cart', () => {
  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', stockStatus: 'in-stock' };
  const cart = addCatalogProductToCart(product, 2);
  const checkoutCart = buildCheckoutCart(cart);
  assert.equal(checkoutCart.subtotalCents, 2400);
  assert.equal(checkoutCart.totalCents, 2400);
  assert.equal(checkoutCart.lines[0].category, 'stationery');
  assert.equal(checkoutCart.lines[0].stockStatus, 'in-stock');
});
