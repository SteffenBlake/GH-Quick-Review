# GH-Quick-Review

A basic self-hostable web app for reviewing GitHub PR comments quickly.

## Features

- 🎨 Dark-themed UI for comfortable viewing
- 🔤 Support for FiraCode and JetBrains Mono Nerd Fonts
- 🎯 Font switcher in the top-right corner
- ⚡ Built with Preact and Vite for fast performance
- ✅ Tested with Vitest
- 🚀 Automated deployment to GitHub Pages

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

### Testing

Tests are located in the `/tests` directory and use Vitest with Testing Library.

```bash
npm test
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The workflow:

1. Installs dependencies
2. Runs tests
3. Builds the app
4. Deploys to GitHub Pages

## Project Structure

```
.
├── .github/workflows/  # GitHub Actions workflows
├── public/fonts/       # Font files (FiraCode & JetBrains Mono)
├── src/
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # App entry point
│   └── style.css      # Global styles
├── tests/             # Test files
└── index.html         # HTML template
```

## License

ISC