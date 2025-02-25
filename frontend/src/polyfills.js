// src/polyfills.js
import { Buffer } from 'buffer';
import process from 'process/browser';

// Fix for console-browserify
import consoleBrowserify from 'console-browserify';

// Make polyfills available globally
window.Buffer = Buffer;
window.process = process;

// Only override console if it doesn't exist (which shouldn't happen in a browser)
if (!window.console) {
  window.console = consoleBrowserify;
}

// Add any additional Solana-specific polyfills if needed
if (typeof window !== 'undefined') {
  window.global = window;
}