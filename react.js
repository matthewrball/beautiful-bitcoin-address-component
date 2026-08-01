'use client';

/**
 * React wrapper for <bitcoin-address>.
 *
 * Plain JS (React.createElement, no JSX) so it works in any React 17+ app
 * with no build configuration — including Next.js App Router, where the
 * 'use client' directive keeps it out of server components.
 */

import { createElement, useEffect, useRef } from 'react';
import './bitcoin-address.js';

export function BitcoinAddress(props) {
  var address = props.address;
  var format = props.format;
  var label = props.label;
  var theme = props.theme;
  var onCopy = props.onCopy;
  var onToggle = props.onToggle;
  var rest = {};
  for (var key in props) {
    if (!['address', 'format', 'label', 'theme', 'onCopy', 'onToggle'].includes(key)) {
      rest[key] = props[key];
    }
  }

  var ref = useRef(null);

  useEffect(function() {
    var el = ref.current;
    if (!el) return;

    function handleCopy(e) {
      if (onCopy) onCopy(e.detail);
    }
    function handleToggle(e) {
      if (onToggle) onToggle(e.detail);
    }

    el.addEventListener('bitcoin-address:copy', handleCopy);
    el.addEventListener('bitcoin-address:toggle', handleToggle);
    return function() {
      el.removeEventListener('bitcoin-address:copy', handleCopy);
      el.removeEventListener('bitcoin-address:toggle', handleToggle);
    };
  }, [onCopy, onToggle]);

  return createElement('bitcoin-address', Object.assign({ ref: ref, address: address, format: format, label: label, theme: theme }, rest));
}
