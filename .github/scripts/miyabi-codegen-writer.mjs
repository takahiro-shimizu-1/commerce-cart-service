#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const scenario = resolveScenario();

if (scenario === 'small-cart-checkout') {
  applySmallCartCheckoutChange();
} else if (scenario === 'large-catalog-product') {
  applyLargeCatalogProductChange();
} else if (scenario === 'validation-cart-note-v9') {
  applyValidationCartNoteV9Change();
} else if (scenario === 'validation-catalog-signal-v10') {
  applyValidationCatalogSignalV10Change();
} else {
  throw new Error(`Unsupported cart Miyabi scenario: ${scenario}`);
}

function resolveScenario() {
  const text = [process.env.AUTOMATION_TASK_TITLE, process.env.AUTOMATION_TASK_ID].filter(Boolean).join(' ').toLowerCase();
  if (text.includes('small-cart-checkout')) return 'small-cart-checkout';
  if (text.includes('large-catalog-product')) return 'large-catalog-product';
  if (text.includes('validation-cart-note-v9')) return 'validation-cart-note-v9';
  if (text.includes('validation-catalog-signal-v10')) return 'validation-catalog-signal-v10';
  return 'unknown';
}

function applySmallCartCheckoutChange() {
  replaceOnce(
    'src/cart.mjs',
    "    pricingMode: 'gross',\n  };",
    "    pricingMode: 'gross',\n    checkoutReady: true,\n  };",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  assert.equal(checkoutCart.pricingMode, 'gross');\n",
    "  assert.equal(checkoutCart.pricingMode, 'gross');\n  assert.equal(checkoutCart.checkoutReady, true);\n",
  );
  updateContracts((entry) => {
    if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '7';
  });
}

function applyLargeCatalogProductChange() {
  replaceOnce(
    'src/cart.mjs',
    '    fulfillmentRegion: product.fulfillmentRegion,\n',
    "    fulfillmentRegion: product.fulfillmentRegion,\n    lifecycleBadge: product.lifecycleBadge,\n",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock', fulfillmentRegion: 'JP' };\n",
    "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock', fulfillmentRegion: 'JP', lifecycleBadge: 'standard-flow' };\n",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  assert.equal(checkoutCart.lines[0].fulfillmentRegion, 'JP');\n",
    "  assert.equal(checkoutCart.lines[0].fulfillmentRegion, 'JP');\n  assert.equal(checkoutCart.lines[0].lifecycleBadge, 'standard-flow');\n",
  );
  updateContracts((entry) => {
    if (entry.id === 'CATALOG_PRODUCT_CONTRACT') entry.version = '7';
    if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '8';
  });
}

function applyValidationCartNoteV9Change() {
  replaceOnce(
    'src/cart.mjs',
    "    checkoutReady: true,\n  };",
    "    checkoutReady: true,\n    handoffNote: 'ready-for-payment',\n  };",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  assert.equal(checkoutCart.checkoutReady, true);\n",
    "  assert.equal(checkoutCart.checkoutReady, true);\n  assert.equal(checkoutCart.handoffNote, 'ready-for-payment');\n",
  );
  updateContracts((entry) => {
    if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '9';
  });
}

function applyValidationCatalogSignalV10Change() {
  replaceOnce(
    'src/cart.mjs',
    '    lifecycleBadge: product.lifecycleBadge,\n',
    "    lifecycleBadge: product.lifecycleBadge,\n    qualitySignal: product.qualitySignal,\n",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock', fulfillmentRegion: 'JP', lifecycleBadge: 'standard-flow' };\n",
    "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock', fulfillmentRegion: 'JP', lifecycleBadge: 'standard-flow', qualitySignal: 'catalog-reviewed' };\n",
  );
  replaceOnce(
    'test/cart.test.mjs',
    "  assert.equal(checkoutCart.lines[0].lifecycleBadge, 'standard-flow');\n",
    "  assert.equal(checkoutCart.lines[0].lifecycleBadge, 'standard-flow');\n  assert.equal(checkoutCart.lines[0].qualitySignal, 'catalog-reviewed');\n",
  );
  updateContracts((entry) => {
    if (entry.id === 'CATALOG_PRODUCT_CONTRACT') entry.version = '10';
    if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '10';
  });
}

function updateContracts(mutator) {
  const filePath = 'config/gitnexus-contracts.json';
  const manifest = JSON.parse(readFileSync(filePath, 'utf8'));
  for (const entry of manifest.contracts) mutator(entry);
  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function replaceOnce(filePath, search, replacement) {
  const current = readFileSync(filePath, 'utf8');
  if (current.includes(search)) {
    writeFileSync(filePath, current.replace(search, replacement), 'utf8');
    return;
  }
  if (current.includes(replacement)) {
    return;
  }
  throw new Error(`Expected text not found in ${filePath}`);
}
