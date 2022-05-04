// @flow
export default function generatePrefix() {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') return '';

  const prefixes = ['Moz', 'Webkit', 'O', 'ms'];
  const style = window.document.documentElement.style;

  if ('transform' in style) {
    return '';
  }

  for (let i = 0; i < prefixes.length; ++i) {
    if (prefixes[i] + 'Transform' in style) {
      return prefixes[i];
    }
  }
  return '';
}

