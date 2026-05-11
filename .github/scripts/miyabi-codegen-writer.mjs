#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

replaceOnce(
  'src/cart.mjs',
  "    subtotalCents: line.unitPriceCents * quantity,\n    currency: 'JPY',",
  "    subtotalCents: line.unitPriceCents * quantity,\n    lineCount: 1,\n    currency: 'JPY',",
);
replaceOnce(
  'src/cart.mjs',
  '    totalCents: cart.subtotalCents,\n    currency: cart.currency,',
  '    totalCents: cart.subtotalCents,\n    lineCount: cart.lines.length,\n    currency: cart.currency,',
);
replaceOnce(
  'test/cart.test.mjs',
  '  assert.equal(checkoutCart.totalCents, 2400);\n',
  '  assert.equal(checkoutCart.totalCents, 2400);\n  assert.equal(cart.lineCount, 1);\n  assert.equal(checkoutCart.lineCount, 1);\n',
);
updateContracts((entry) => {
  if (entry.id === 'CART_CHECKOUT_CONTRACT') entry.version = '4';
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
