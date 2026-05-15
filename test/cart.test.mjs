import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { addCatalogProductToCart, buildCheckoutCart } from '../src/cart.mjs';

test('cart accepts catalog products and produces checkout cart', () => {
  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock', fulfillmentRegion: 'JP', lifecycleBadge: 'standard-flow', qualitySignal: 'catalog-reviewed' };
  const cart = addCatalogProductToCart(product, 2);
  const checkoutCart = buildCheckoutCart(cart);
  assert.equal(checkoutCart.subtotalCents, 2400);
  assert.equal(checkoutCart.totalCents, 2400);
  assert.equal(cart.lineCount, 1);
  assert.equal(checkoutCart.lineCount, 1);
  assert.equal(checkoutCart.pricingMode, 'gross');
  assert.equal(checkoutCart.checkoutReady, true);
  assert.equal(checkoutCart.handoffNote, 'ready-for-payment');
  assert.equal(checkoutCart.lines[0].category, 'stationery');
  assert.equal(checkoutCart.lines[0].taxClass, 'standard');
  assert.equal(checkoutCart.lines[0].stockStatus, 'in-stock');
  assert.equal(checkoutCart.lines[0].fulfillmentRegion, 'JP');
  assert.equal(checkoutCart.lines[0].lifecycleBadge, 'standard-flow');
  assert.equal(checkoutCart.lines[0].qualitySignal, 'catalog-reviewed');
});
