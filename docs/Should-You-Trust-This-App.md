# Should You Trust This App?

## ⚠️ Important Disclaimers

Before using GH-Quick-Review, you should be aware of the following:

### 1. Automatic GitHub Pages Deployment

**This app is hosted on GitHub Pages and automatically deploys when new changes are merged.**

- ✅ **Pro:** You always get the latest features and bug fixes automatically
- ⚠️ **Con:** Updates happen without explicit user consent
- 📌 **What this means:** The app you use today may have different code tomorrow

**Use at your own discretion.** If you prefer full control over updates, see the "Running Locally" section below.

---

### 2. Node.js/NPM Ecosystem Risks

**This is a Node.js/NPM-based application, which has well-known security considerations:**

- 📦 **Dependency chain risks** - The app relies on third-party NPM packages that could have vulnerabilities
- 🔄 **Transitive dependencies** - Some dependencies pull in their own dependencies, expanding the attack surface
- ⚠️ **Supply chain attacks** - NPM packages can be compromised, though this is relatively rare

**Current dependencies** include Preact, Vite, and development tools. You can review the full dependency tree in `package.json` and `package-lock.json`.

---

### 3. Experimental "Vibe Coded" Project

**This app was built as an exercise in AI-assisted development ("vibe coding").**

- 🤖 **AI-generated code** - Large portions were created with AI assistance
- 👁️ **Human reviewed** - All code changes are reviewed by a human before being merged
- 🧪 **Experimental nature** - This is a personal project, not enterprise-grade software

**Recommendation:** Read the source code and understand what it does before trusting it with your GitHub credentials.

---

## ✅ Security Measures in Place

Despite the warnings above, GH-Quick-Review implements several security safeguards:

### 1. Comprehensive Test Suite

**The app includes extensive Playwright and Vitest tests, many focused on security:**

- 🔒 **CSP enforcement tests** - Verify Content Security Policy is correctly applied
- 🧪 **Token handling tests** - Ensure credentials are stored and used correctly
- 🌐 **API interaction tests** - Validate that only authorized GitHub API calls are made
- ✅ **Integration tests** - Test real-world usage scenarios with a mock GitHub server

You can review the test suite in the `/tests` directory.

---

### 2. Strict Content Security Policy (CSP)

**The app enforces a rigorous Content Security Policy that prevents common web attacks:**

**Production CSP:**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data:;
connect-src 'self' https://api.github.com
```

**What this prevents:**
- ❌ **Cross-Site Scripting (XSS)** - Only scripts from the app itself can run
- ❌ **Data exfiltration** - Network requests are limited to GitHub's official API only
- ❌ **Third-party tracking** - No external resources can be loaded
- ❌ **Man-in-the-middle attacks** - Only HTTPS connections to GitHub are allowed

The CSP is enforced via a Vite plugin (`vite-plugin-csp.js`) and is tested in `tests/playwright/csp.spec.js`.

---

### 3. Human Code Review

**All code changes go through human review before being merged:**

- 👁️ **Pull request process** - No code is merged without review
- 🔍 **Security-focused reviews** - Changes affecting credentials or API calls get extra scrutiny
- 📝 **Change history** - All code changes are tracked in Git history

You can review the project's commit history and pull requests on GitHub.

---

## 🔐 How Your Token is Handled

**Your Personal Access Token (PAT) security is critical.** Here's exactly what happens:

1. ✅ **Stored locally only** - Your token is saved in your browser's `localStorage`, never on a server
2. ✅ **Direct GitHub API calls** - All API requests go directly from your browser to `api.github.com`
3. ✅ **No third-party services** - The app doesn't send data to any external service except GitHub
4. ✅ **Client-side only** - The entire app runs in your browser; there is no backend server
5. ✅ **CSP protection** - Content Security Policy prevents token theft via XSS attacks

**You can verify this by:**
- Opening browser DevTools → Network tab → See all requests go to `api.github.com`
- Checking browser DevTools → Application → Local Storage → See your token stored locally
- Reviewing the source code in `src/utils/github-client.js` where API calls are made

---

## 🏠 Running Locally (Recommended for Maximum Security)

If you want complete control over the code and updates, you can run GH-Quick-Review locally:

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SteffenBlake/GH-Quick-Review.git
   cd GH-Quick-Review
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

5. **Open in your browser:**
   ```
   http://localhost:4173
   ```

> **Note:** `npm run dev` runs in test mode and connects to a mock GitHub server, not the real GitHub API. For actual use, you must build and preview the production version.

### Running Tests Locally

You can verify the app's security and functionality by running the test suite:

```bash
# Run Playwright integration tests (requires Chromium)
npx playwright install chromium
npm run test:playwright
```

### Hosting Your Own Production Build

To host the app yourself permanently:

```bash
# Build the app
npm run build

# The built files will be in the dist/ directory
# Serve them with any static file server, e.g.:
npx serve dist
```

The built files in `dist/` can be deployed to any static hosting service (Netlify, Vercel, your own server, etc.).

---

## 🔍 Code Review Checklist

If you're reviewing the code before using the app, focus on these areas:

### Critical Security Files

1. **`src/utils/github-client.js`** - All GitHub API interactions
2. **`vite-plugin-csp.js`** - Content Security Policy enforcement
3. **`src/App.jsx`** - Token storage and retrieval
4. **`index.html`** - CSP meta tag injection

### What to Look For

- ✅ Verify all `fetch()` calls only go to `api.github.com`
- ✅ Confirm tokens are only stored in `localStorage`
- ✅ Check CSP directives match the documented policy
- ✅ Review test coverage in `/tests` directory

---

## 📊 Transparency

**This project is open source under the MIT License:**

- 📖 **Full source code:** [github.com/SteffenBlake/GH-Quick-Review](https://github.com/SteffenBlake/GH-Quick-Review)
- 🐛 **Issue tracker:** [Report security concerns or bugs](https://github.com/SteffenBlake/GH-Quick-Review/issues)
- 🔄 **Commit history:** Review all changes that have been made
- 📜 **License:** ISC License (permissive open source)

---

## 🤔 Should You Use This App?

**Use GH-Quick-Review if:**
- ✅ You understand the risks outlined above
- ✅ You've reviewed the source code (or trust the security measures described)
- ✅ You're comfortable with automatic updates OR you run it locally
- ✅ You understand how to revoke your PAT if needed

**Don't use GH-Quick-Review if:**
- ❌ You can't tolerate any security risk with your GitHub credentials
- ❌ You work in an environment that prohibits third-party GitHub apps
- ❌ You haven't read and understood this document
- ❌ You're not comfortable with the "vibe coding" disclaimer

---

## 📞 Questions or Concerns?

If you have security questions or concerns:

1. **Review the code** - All source code is available on GitHub
2. **Run locally** - Take full control by self-hosting
3. **Open an issue** - Ask questions at [github.com/SteffenBlake/GH-Quick-Review/issues](https://github.com/SteffenBlake/GH-Quick-Review/issues)
4. **Audit the tests** - Run the test suite yourself to verify security claims

**Remember:** No software is 100% secure. Use your best judgment and follow the principle of least privilege when creating your Personal Access Token.
