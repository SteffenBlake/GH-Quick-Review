# Nerd Font Icons Reference

This document lists the Nerd Font icons used in the GH-Quick-Review application. These icons render correctly because the app uses Nerd Font-compatible fonts (FiraCode Nerd Font and JetBrains Mono Nerd Font).

## Available Icons

- GitHub: \ue709
- Key: 󰌆
- Warning: \uf071
- Logout: 󰗽

## Usage

To use these icons in the application, simply include them as UTF-16 escape sequences in your JSX:

```jsx
<span>{'\ue709'}</span>  // GitHub icon
<span>󰌆</span>           // Key icon
<span>{'\uf071'}</span>  // Warning icon
<span>󰗽</span>           // Logout icon
```

The icons will render correctly as long as the element inherits from or is styled with a Nerd Font.
