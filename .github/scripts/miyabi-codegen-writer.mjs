#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

replaceOnce(
  'src/cart.mjs',
  '    category: product.category,\n    stockStatus: product.stockStatus,',
  '    category: product.category,\n    taxClass: product.taxClass,\n    stockStatus: product.stockStatus,',
);
replaceOnce(
  'test/cart.test.mjs',
  "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', stockStatus: 'in-stock' };",
  "  const product = { id: 'sku-1', priceCents: 1200, category: 'stationery', taxClass: 'standard', stockStatus: 'in-stock' };",
);
replaceOnce(
  'test/cart.test.mjs',
  "  assert.equal(checkoutCart.lines[0].category, 'stationery');\n",
  "  assert.equal(checkoutCart.lines[0].category, 'stationery');\n  assert.equal(checkoutCart.lines[0].taxClass, 'standard');\n",
);
updateContracts((entry) => {
  if (entry.id === 'CATALOG_PRODUCT_CONTRACT') entry.version = '4';
  if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '3';
});

function updateContracts(mutator) {
  const filePath = 'config/gitnexus-contracts.json';
  const manifest = JSON.parse(readFileSync(filePath, 'utf8'));
  for (const entry of manifest.contracts) mutator(entry);
  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function replaceOnce(filePath, search, replacement) {
  const current = readFileSync(filePath, 'utf8');
  if (!current.includes(search)) {
    throw new Error(`Expected text not found in ${filePath}`);
  }
  writeFileSync(filePath, current.replace(search, replacement), 'utf8');
}
