/**
 * Type definitions for <bitcoin-address>.
 *
 * Importing this module registers the custom element (side effect) and
 * exposes type-only exports — the runtime file has no named exports.
 */

export type BitcoinAddressFormat = 'auto' | 'bech32' | 'p2sh' | 'taproot' | 'legacy';
export type BitcoinAddressTheme = 'auto' | 'light' | 'dark';

export interface BitcoinAddressCopyDetail {
  address: string;
  success: boolean;
}

export interface BitcoinAddressToggleDetail {
  expanded: boolean;
}

export interface BitcoinAddressElement extends HTMLElement {
  /** The full bitcoin address string. Reflected to the `address` attribute. */
  address: string;
  /** Address format. Reflected to the `format` attribute. Default: 'auto'. */
  format: BitcoinAddressFormat;
  /** Label text above the address field. Reflected to the `label` attribute. */
  label: string;
  /** Color theme. Reflected to the `theme` attribute. Default: 'auto'. */
  theme: BitcoinAddressTheme;
  /** The resolved format: the `format` attribute, or the prefix-detected format when 'auto'. */
  readonly detectedFormat: Exclude<BitcoinAddressFormat, 'auto'> | 'unknown';
}

declare global {
  interface HTMLElementTagNameMap {
    'bitcoin-address': BitcoinAddressElement;
  }

  interface HTMLElementEventMap {
    'bitcoin-address:copy': CustomEvent<BitcoinAddressCopyDetail>;
    'bitcoin-address:toggle': CustomEvent<BitcoinAddressToggleDetail>;
  }
}
