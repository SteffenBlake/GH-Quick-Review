import { describe, it, expect } from 'vitest';
import cspPlugin from '../vite-plugin-csp.js';

describe('CSP Plugin', () => {
  const plugin = cspPlugin();

  describe('plugin configuration', () => {
    it('has correct plugin name', () => {
      expect(plugin.name).toBe('vite-plugin-csp');
    });

    it('has transformIndexHtml hook', () => {
      expect(plugin.transformIndexHtml).toBeDefined();
      expect(plugin.transformIndexHtml.order).toBe('pre');
      expect(typeof plugin.transformIndexHtml.handler).toBe('function');
    });
  });

  describe('transformIndexHtml handler', () => {
    const handler = plugin.transformIndexHtml.handler;
    const sampleHtml = '<html><head><meta charset="UTF-8"><title>Test</title></head><body></body></html>';

    it('injects CSP meta tag in development mode', () => {
      const ctx = { server: {} }; // server object indicates dev mode
      const result = handler(sampleHtml, ctx);

      expect(result).toContain('http-equiv="Content-Security-Policy"');
      expect(result).toContain("default-src 'self'");
      expect(result).toContain("script-src 'self' 'unsafe-inline'");
      expect(result).toContain("style-src 'self' 'unsafe-inline'");
      expect(result).toContain("font-src 'self'");
      expect(result).toContain("img-src 'self' data:");
      expect(result).toContain("connect-src 'self' ws: wss:");
    });

    it('injects CSP meta tag in production mode', () => {
      const ctx = {}; // no server object indicates production mode
      const result = handler(sampleHtml, ctx);

      expect(result).toContain('http-equiv="Content-Security-Policy"');
      expect(result).toContain("default-src 'self'");
      expect(result).toContain("script-src 'self' 'unsafe-inline'");
      expect(result).toContain("style-src 'self' 'unsafe-inline'");
      expect(result).toContain("font-src 'self'");
      expect(result).toContain("img-src 'self' data:");
      expect(result).toContain("connect-src 'self'");
      expect(result).not.toContain('ws:');
      expect(result).not.toContain('wss:');
    });

    it('inserts CSP meta tag after charset meta tag', () => {
      const ctx = {};
      const result = handler(sampleHtml, ctx);

      const charsetIndex = result.indexOf('<meta charset="UTF-8">');
      const cspIndex = result.indexOf('http-equiv="Content-Security-Policy"');

      expect(charsetIndex).toBeGreaterThan(-1);
      expect(cspIndex).toBeGreaterThan(-1);
      expect(cspIndex).toBeGreaterThan(charsetIndex);
    });

    it('produces different CSP for dev vs production', () => {
      const devCtx = { server: {} };
      const prodCtx = {};

      const devResult = handler(sampleHtml, devCtx);
      const prodResult = handler(sampleHtml, prodCtx);

      expect(devResult).not.toBe(prodResult);
      expect(devResult).toContain('ws: wss:');
      expect(prodResult).not.toContain('ws: wss:');
    });
  });
});
