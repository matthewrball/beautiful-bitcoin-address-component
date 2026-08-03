import test from 'node:test';
import assert from 'node:assert/strict';

// No jsdom setup on purpose: importing the module in a DOM-less runtime
// (Next.js SSR of a 'use client' component) must be a silent no-op.
test('importing without a DOM does not throw', async () => {
  assert.equal(typeof window, 'undefined');
  await assert.doesNotReject(() => import('../bitcoin-address.js'));
});

test('importing the React wrapper without a DOM does not throw', async () => {
  await assert.doesNotReject(() => import('../react.js'));
});
