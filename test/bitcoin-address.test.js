import test from 'node:test';
import assert from 'node:assert/strict';
import { setupDOM } from './setup.js';

setupDOM();
await import('../bitcoin-address.js');

const BECH32 = 'bc1qvhu3557twysq2ldn6dut6rmaj3qk04p60h9l79wk4lzgy0ca8mfsnffz65';
const P2SH = '3HU3JVMSGushfkoWS9eyZjGzGQK5dD1zob';

function mount(attrs) {
  const el = document.createElement('bitcoin-address');
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  document.body.appendChild(el);
  return el;
}

test('renders truncated view with prefix and suffix highlighted', () => {
  const el = mount({ address: BECH32 });
  const truncated = el.shadowRoot.querySelector('[data-role="truncated"]');

  assert.ok(truncated, 'truncated layer exists');
  assert.ok(truncated.textContent.startsWith('bc1qvh'));
  assert.ok(truncated.textContent.endsWith('nffz65'));
  assert.ok(truncated.textContent.includes('...'));
  assert.equal(truncated.querySelectorAll('.highlight').length, 2);
  el.remove();
});

test('renders full address across grouped spans', () => {
  const el = mount({ address: BECH32 });
  const full = el.shadowRoot.querySelector('[data-role="full"]');

  assert.equal(full.textContent.replace(/\s/g, ''), BECH32);
  el.remove();
});

test('detects format from prefix and reflects it as data-format', () => {
  const cases = [
    [BECH32, 'bech32'],
    [P2SH, 'p2sh'],
    ['bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs2za62mn5wjxc57ctq', 'taproot'],
    ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'legacy'],
    ['xyz-not-a-real-address-xyz', 'unknown'],
  ];

  for (const [address, format] of cases) {
    const el = mount({ address });
    assert.equal(el.getAttribute('data-format'), format, address);
    assert.equal(el.detectedFormat, format, address);
    el.remove();
  }
});

test('explicit format attribute overrides detection', () => {
  const el = mount({ address: BECH32, format: 'p2sh' });
  assert.equal(el.getAttribute('data-format'), 'p2sh');
  el.remove();
});

test('escapes HTML in the label attribute', () => {
  const el = mount({ address: BECH32, label: '<img src=x onerror="boom()">' });

  assert.equal(el.shadowRoot.querySelector('img'), null);
  assert.equal(el.shadowRoot.querySelector('.label').textContent, '<img src=x onerror="boom()">');
  el.remove();
});

test('escapes HTML in the address attribute', () => {
  const el = mount({ address: '<b>4300658901234567890123456789012345678</b>' });

  assert.equal(el.shadowRoot.querySelector('b'), null);
  el.remove();
});

test('toggle expands, collapses, and fires bitcoin-address:toggle', () => {
  const el = mount({ address: BECH32 });
  const details = [];
  el.addEventListener('bitcoin-address:toggle', (e) => details.push(e.detail));

  el.shadowRoot.querySelector('[data-action="toggle"]').click();
  assert.deepEqual(details, [{ expanded: true }]);
  assert.ok(el.shadowRoot.querySelector('[data-role="full"]').classList.contains('layer--visible'));
  el.remove();
});

test('copy writes the address to the clipboard and fires bitcoin-address:copy', async () => {
  const written = [];
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText: (text) => { written.push(text); return Promise.resolve(); } },
    configurable: true,
  });

  const el = mount({ address: BECH32 });
  const copied = new Promise((resolve) => {
    el.addEventListener('bitcoin-address:copy', (e) => resolve(e.detail));
  });

  el.shadowRoot.querySelector('[data-action="copy-inline"]').click();
  const detail = await copied;

  assert.deepEqual(written, [BECH32]);
  assert.deepEqual(detail, { address: BECH32, success: true });
  el.remove();
});

test('properties reflect to attributes', () => {
  const el = mount({ address: P2SH });

  el.label = 'Deposit address';
  assert.equal(el.getAttribute('label'), 'Deposit address');
  assert.equal(el.shadowRoot.querySelector('.label').textContent, 'Deposit address');

  el.address = BECH32;
  assert.equal(el.getAttribute('address'), BECH32);
  assert.equal(el.getAttribute('data-format'), 'bech32');

  el.theme = 'dark';
  assert.ok(el.hasAttribute('data-dark'));
  el.theme = 'light';
  assert.ok(!el.hasAttribute('data-dark'));
  el.remove();
});

test('renders nothing without an address and cleans up on disconnect', () => {
  const el = mount({});
  assert.equal(el.shadowRoot.querySelector('.container'), null);
  el.remove();

  const active = mount({ address: BECH32 });
  active.shadowRoot.querySelector('[data-action="copy-inline"]').click();
  active.remove();
  assert.deepEqual(active._copyTimers, {});
});
