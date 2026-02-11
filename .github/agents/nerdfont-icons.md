# Nerd Font Icons Reference

This document lists the Nerd Font icons used in the GH-Quick-Review application. These icons render correctly because the app uses Nerd Font-compatible fonts (FiraCode Nerd Font and JetBrains Mono Nerd Font).

## Available Icons

- GitHub: \ue709
- Key: \udb80\udf06
- Warning: \uf071
- Logout: \udb81\uddfd
- Login: \udb80\udf42
- OpenBook: \ueaa4
- Copyright: \udb81\udde6
- Bug: \uf188
- Spinner1: \uee06
- Spinner2: \uee07
- Spinner3: \uee08
- Spinner4: \uee09
- Spinner5: \uee0a
- Spinner6: \uee0b
- Double Chevron Right: \udb80\udd3e
- Double Chevron Left: \udb80\udd3d

## Usage

**IMPORTANT**: Icons should be placed directly inline with text, NOT wrapped in separate span elements. The parent element using the Nerd Font will automatically render the icon at the same size as the surrounding text.

### Correct Usage

```jsx
// Icons inline with text - the h1 uses the Nerd Font
<h1>{'\ue709'} GH Quick Review</h1>

// Icon in button text
<button>{'\udb80\udf42'} Login</button>

// Icon in link text
<a>{'\ueaa4'} Guide: How to generate a PAT token</a>
```

### Incorrect Usage

```jsx
// DON'T wrap icons in separate spans
<h1><span className="icon">{'\ue709'}</span> GH Quick Review</h1>

// DON'T use icon-only elements
<span className="icon">{'\ue709'}</span>
```

The icons will render correctly as long as the parent element inherits from or is styled with a Nerd Font.
