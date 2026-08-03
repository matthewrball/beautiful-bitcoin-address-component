import * as React from 'react';
import type {
  BitcoinAddressCopyDetail,
  BitcoinAddressFormat,
  BitcoinAddressTheme,
  BitcoinAddressToggleDetail,
} from './bitcoin-address';

export interface BitcoinAddressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onCopy' | 'onToggle' | 'children'> {
  /** The full bitcoin address string. */
  address: string;
  /** Address format. Default: 'auto' (detected from prefix). */
  format?: BitcoinAddressFormat;
  /** Label text displayed above the address field. Default: 'Bitcoin address'. */
  label?: string;
  /** Color theme. Default: 'auto' (follows host page or prefers-color-scheme). */
  theme?: BitcoinAddressTheme;
  /** Fired when either copy button is clicked. */
  onCopy?: (detail: BitcoinAddressCopyDetail) => void;
  /** Fired when the address is expanded or collapsed. */
  onToggle?: (detail: BitcoinAddressToggleDetail) => void;
}

export declare function BitcoinAddress(props: BitcoinAddressProps): React.JSX.Element;
