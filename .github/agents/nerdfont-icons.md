# Nerd Font Icons Reference

This document lists the Nerd Font icons used in the GH-Quick-Review application. These icons render correctly because the app uses Nerd Font-compatible fonts (FiraCode Nerd Font and JetBrains Mono Nerd Font).

## Available Icons

- GitHub: \ue709
- Key: \udb80\udf06
- Warning: \uf071
- Logout: \udb81\uddfd

## Usage

To use these icons in the application, simply include them as UTF-16 escape sequences in your JSX:

```jsx
<span>{'\ue709'}</span>         // GitHub icon
<span>{'\udb80\udf06'}</span>   // Key icon (surrogate pair)
<span>{'\uf071'}</span>         // Warning icon
<span>{'\udb81\uddfd'}</span>   // Logout icon (surrogate pair)
```

Note: Some icons use surrogate pairs (two escape sequences) because they represent characters outside the Basic Multilingual Plane (BMP).

The icons will render correctly as long as the element inherits from or is styled with a Nerd Font.
