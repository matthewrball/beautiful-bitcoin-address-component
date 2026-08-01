import test from 'node:test';
import assert from 'node:assert/strict';
import { setupDOM } from './setup.js';

setupDOM();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import('react')).default;
const { act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { BitcoinAddress } = await import('../react.js');

const BECH32 = 'bc1qvhu3557twysq2ldn6dut6rmaj3qk04p60h9l79wk4lzgy0ca8mfsnffz65';

test('renders an upgraded <bitcoin-address> element with props applied', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  await act(async () => {
    root.render(React.createElement(BitcoinAddress, {
      address: BECH32,
      label: 'Deposit address',
      theme: 'dark',
      className: 'mt-4',
    }));
  });

  const el = host.querySelector('bitcoin-address');
  assert.ok(el, 'custom element rendered');
  assert.equal(el.getAttribute('address'), BECH32);
  assert.equal(el.getAttribute('class'), 'mt-4');
  assert.equal(el.shadowRoot.querySelector('.label').textContent, 'Deposit address');
  assert.ok(el.hasAttribute('data-dark'));

  await act(async () => root.unmount());
  host.remove();
});

test('forwards custom events to onCopy and onToggle callbacks', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  const copies = [];
  const toggles = [];

  await act(async () => {
    root.render(React.createElement(BitcoinAddress, {
      address: BECH32,
      onCopy: (detail) => copies.push(detail),
      onToggle: (detail) => toggles.push(detail),
    }));
  });

  const el = host.querySelector('bitcoin-address');
  el.shadowRoot.querySelector('[data-action="toggle"]').click();
  assert.deepEqual(toggles, [{ expanded: true }]);

  el.dispatchEvent(new CustomEvent('bitcoin-address:copy', {
    detail: { address: BECH32, success: true },
  }));
  assert.deepEqual(copies, [{ address: BECH32, success: true }]);

  await act(async () => root.unmount());
  host.remove();
});
