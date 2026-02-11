/**
 * Vite plugin to inject Content Security Policy meta tags
 * Different CSP policies for development and production environments
 */
export default function cspPlugin() {
  return {
    name: 'vite-plugin-csp',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const isDev = ctx.server !== undefined;
        
        // Base CSP directives (same for dev and prod)
        const baseDirectives = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self'",
          "img-src 'self' data:"
        ];
        
        // Environment-specific connect-src directive
        let connectSrc;
        if (isDev) {
          // Development: Allow connections to self, mock server, and Vite HMR WebSocket
          // Using wildcard port for WebSocket to handle any Vite dev server port (flexible)
          connectSrc = "connect-src 'self' http://localhost:3000 ws://localhost:*";
        } else {
          // Production: Allow connections to self and GitHub API
          connectSrc = "connect-src 'self' https://api.github.com";
        }
        
        // Combine all directives
        const cspDirectives = [...baseDirectives, connectSrc];
        const cspContent = cspDirectives.join('; ');
        
        // Inject CSP meta tag into the HTML head
        const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
        
        // Insert the CSP meta tag right after the charset meta tag
        return html.replace(
          /<meta charset="UTF-8">/,
          `<meta charset="UTF-8">\n  ${cspMetaTag}`
        );
      }
    }
  };
}
