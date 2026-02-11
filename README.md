# GH-Quick-Review

**A better UI/UX for reviewing GitHub pull requests.** Because GitHub's native PR review interface sucks.

🚀 **Live App:** [https://steffenblake.github.io/GH-Quick-Review/](https://steffenblake.github.io/GH-Quick-Review/)

---

## Why?

GitHub's PR review experience is clunky:
- ❌ Poor code navigation
- ❌ Difficult to track review threads
- ❌ No customizable viewing experience
- ❌ Overwhelming for large PRs

GH-Quick-Review fixes this with:
- ✅ Clean, distraction-free interface
- ✅ File tree navigation (WIP)
- ✅ Inline comment threads (WIP)
- ✅ Syntax highlighting with Nerd Font icons
- ✅ Customizable fonts (FiraCode & JetBrains Mono)

---

## ⚠️ Before You Use This

**READ THESE FIRST:**

1. **[Should You Trust This App?](docs/Should-You-Trust-This-App.md)** - Security considerations and transparency
2. **[Generating a PAT Token](docs/Generating-a-PAT-Token.md)** - How to create your GitHub token safely

**TL;DR:** This is a client-side app. Your token stays in your browser. All API calls go directly to GitHub. Auto-deploys on updates. Use at your own risk.

---

## Features

### Current
- 🎨 **Dark-themed UI** - Easy on the eyes
- 🔤 **Nerd Font support** - FiraCode & JetBrains Mono with icon glyphs
- 🎯 **Font switcher** - Toggle fonts in the top-right corner
- 🔐 **Secure token storage** - Client-side only, never sent to third parties
- 🔒 **Strict CSP** - Content Security Policy prevents XSS and data leaks
- ⚡ **Fast & lightweight** - Built with Preact and Vite

### WIP (Coming Soon)
- 📂 **File tree navigation** - nvim-tree style directory browser
- 💬 **Inline comment threads** - View and reply to review comments
- 🔍 **Better diff viewing** - Side-by-side or unified diffs
- 📋 **PR overview** - Summary, status, and metadata at a glance
- ⌨️ **Keyboard shortcuts** - Navigate like a pro

---

## Quick Start

### Using the Hosted Version

1. Go to [https://steffenblake.github.io/GH-Quick-Review/](https://steffenblake.github.io/GH-Quick-Review/)
2. Follow the [PAT Token guide](docs/Generating-a-PAT-Token.md) to create a token
3. Paste your token when prompted
4. Start reviewing PRs with a better UI

### Running Locally

**For maximum security and control:**

```bash
# Clone the repo
git clone https://github.com/SteffenBlake/GH-Quick-Review.git
cd GH-Quick-Review

# Install dependencies
npm install

# Build for production
npm run build

# Preview the build
npm run preview
```

Then visit `http://localhost:4173`

> **Note:** `npm run dev` uses a mock GitHub server for testing. For real use, you must build and preview.

See [Should You Trust This App?](docs/Should-You-Trust-This-App.md) for more details on local hosting.

---

## Development

### Prerequisites
- Node.js >= 18.0.0
- npm

### Scripts
- `npm run dev` - Development server with mock GitHub API
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run test:playwright` - Run integration tests

### Testing

All tests use Playwright for end-to-end integration testing with a mock GitHub server:

```bash
# Install Playwright browsers
npx playwright install chromium

# Run tests
npm run test:playwright
```

See `tools/README.md` for details on the mock server.

---

## Tech Stack

- **Preact** - Lightweight React alternative
- **Vite** - Lightning-fast build tool
- **Playwright** - Integration testing
- **GitHub API** - Direct API calls (no backend)
- **Nerd Fonts** - Icon-rich monospace fonts

---

## Security

- 🔒 **Client-side only** - No backend, no server-side code
- 🔐 **Token stored locally** - In browser `localStorage`, never transmitted
- 🌐 **Direct GitHub API** - No third-party proxies or services
- 🛡️ **Strict CSP** - Only allows connections to GitHub API
- ✅ **Comprehensive tests** - Security-focused Playwright tests

All code is reviewed by a human before merging. See [Should You Trust This App?](docs/Should-You-Trust-This-App.md) for more.

---

## Project Structure

```
.
├── docs/                      # Documentation
│   ├── Should-You-Trust-This-App.md
│   └── Generating-a-PAT-Token.md
├── src/                       # Application source
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── utils/                 # Utilities and services
├── tests/playwright/          # Integration tests
├── tools/                     # Mock GitHub server for testing
└── public/fonts/              # Nerd Font files
```

---

## Contributing

This is a personal "vibe coding" project, but contributions are welcome:

1. Open an issue to discuss changes
2. Fork the repo
3. Make your changes
4. Ensure tests pass (`npm run test:playwright`)
5. Open a PR

All PRs require human review before merging.

---

## License

ISC License - See `LICENSE` file

---

## Disclaimer

This app automatically deploys to GitHub Pages when changes are merged. Use at your own discretion. For maximum control, run it locally.

See [docs/Should-You-Trust-This-App.md](docs/Should-You-Trust-This-App.md) for full transparency.
