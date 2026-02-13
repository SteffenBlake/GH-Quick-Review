/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useEffect, useRef } from 'preact/hooks';
import { highlightTheme } from '../stores/highlightThemeStore.js';

// Explicitly import ALL themes - Vite requires static imports
import hljsTheme1cLight from 'highlight.js/styles/1c-light.min.css?inline';
import hljsThemeA11yDark from 'highlight.js/styles/a11y-dark.min.css?inline';
import hljsThemeA11yLight from 'highlight.js/styles/a11y-light.min.css?inline';
import hljsThemeAgate from 'highlight.js/styles/agate.min.css?inline';
import hljsThemeAnOldHope from 'highlight.js/styles/an-old-hope.min.css?inline';
import hljsThemeAndroidstudio from 'highlight.js/styles/androidstudio.min.css?inline';
import hljsThemeArduinoLight from 'highlight.js/styles/arduino-light.min.css?inline';
import hljsThemeArta from 'highlight.js/styles/arta.min.css?inline';
import hljsThemeAscetic from 'highlight.js/styles/ascetic.min.css?inline';
import hljsThemeAtomOneDark from 'highlight.js/styles/atom-one-dark.min.css?inline';
import hljsThemeAtomOneDarkReasonable from 'highlight.js/styles/atom-one-dark-reasonable.min.css?inline';
import hljsThemeAtomOneLight from 'highlight.js/styles/atom-one-light.min.css?inline';
import hljsThemeBrownPaper from 'highlight.js/styles/brown-paper.min.css?inline';
import hljsThemeCodepenEmbed from 'highlight.js/styles/codepen-embed.min.css?inline';
import hljsThemeColorBrewer from 'highlight.js/styles/color-brewer.min.css?inline';
import hljsThemeCybertopiaCherry from 'highlight.js/styles/cybertopia-cherry.min.css?inline';
import hljsThemeCybertopiaDimmer from 'highlight.js/styles/cybertopia-dimmer.min.css?inline';
import hljsThemeCybertopiaIcecap from 'highlight.js/styles/cybertopia-icecap.min.css?inline';
import hljsThemeCybertopiaSaturated from 'highlight.js/styles/cybertopia-saturated.min.css?inline';
import hljsThemeDark from 'highlight.js/styles/dark.min.css?inline';
import hljsThemeDefault from 'highlight.js/styles/default.min.css?inline';
import hljsThemeDevibeans from 'highlight.js/styles/devibeans.min.css?inline';
import hljsThemeDocco from 'highlight.js/styles/docco.min.css?inline';
import hljsThemeFar from 'highlight.js/styles/far.min.css?inline';
import hljsThemeFelipec from 'highlight.js/styles/felipec.min.css?inline';
import hljsThemeFoundation from 'highlight.js/styles/foundation.min.css?inline';
import hljsThemeGithub from 'highlight.js/styles/github.min.css?inline';
import hljsThemeGithubDark from 'highlight.js/styles/github-dark.min.css?inline';
import hljsThemeGithubDarkDimmed from 'highlight.js/styles/github-dark-dimmed.min.css?inline';
import hljsThemeGml from 'highlight.js/styles/gml.min.css?inline';
import hljsThemeGooglecode from 'highlight.js/styles/googlecode.min.css?inline';
import hljsThemeGradientDark from 'highlight.js/styles/gradient-dark.min.css?inline';
import hljsThemeGradientLight from 'highlight.js/styles/gradient-light.min.css?inline';
import hljsThemeGrayscale from 'highlight.js/styles/grayscale.min.css?inline';
import hljsThemeHybrid from 'highlight.js/styles/hybrid.min.css?inline';
import hljsThemeIdea from 'highlight.js/styles/idea.min.css?inline';
import hljsThemeIntellijLight from 'highlight.js/styles/intellij-light.min.css?inline';
import hljsThemeIrBlack from 'highlight.js/styles/ir-black.min.css?inline';
import hljsThemeIsblEditorDark from 'highlight.js/styles/isbl-editor-dark.min.css?inline';
import hljsThemeIsblEditorLight from 'highlight.js/styles/isbl-editor-light.min.css?inline';
import hljsThemeKimbieDark from 'highlight.js/styles/kimbie-dark.min.css?inline';
import hljsThemeKimbieLight from 'highlight.js/styles/kimbie-light.min.css?inline';
import hljsThemeLightfair from 'highlight.js/styles/lightfair.min.css?inline';
import hljsThemeLioshi from 'highlight.js/styles/lioshi.min.css?inline';
import hljsThemeMagula from 'highlight.js/styles/magula.min.css?inline';
import hljsThemeMonoBlue from 'highlight.js/styles/mono-blue.min.css?inline';
import hljsThemeMonokai from 'highlight.js/styles/monokai.min.css?inline';
import hljsThemeMonokaiSublime from 'highlight.js/styles/monokai-sublime.min.css?inline';
import hljsThemeNightOwl from 'highlight.js/styles/night-owl.min.css?inline';
import hljsThemeNnfxDark from 'highlight.js/styles/nnfx-dark.min.css?inline';
import hljsThemeNnfxLight from 'highlight.js/styles/nnfx-light.min.css?inline';
import hljsThemeNord from 'highlight.js/styles/nord.min.css?inline';
import hljsThemeObsidian from 'highlight.js/styles/obsidian.min.css?inline';
import hljsThemePandaSyntaxDark from 'highlight.js/styles/panda-syntax-dark.min.css?inline';
import hljsThemePandaSyntaxLight from 'highlight.js/styles/panda-syntax-light.min.css?inline';
import hljsThemeParaisoDark from 'highlight.js/styles/paraiso-dark.min.css?inline';
import hljsThemeParaisoLight from 'highlight.js/styles/paraiso-light.min.css?inline';
import hljsThemePojoaque from 'highlight.js/styles/pojoaque.min.css?inline';
import hljsThemePurebasic from 'highlight.js/styles/purebasic.min.css?inline';
import hljsThemeQtcreatorDark from 'highlight.js/styles/qtcreator-dark.min.css?inline';
import hljsThemeQtcreatorLight from 'highlight.js/styles/qtcreator-light.min.css?inline';
import hljsThemeRainbow from 'highlight.js/styles/rainbow.min.css?inline';
import hljsThemeRosePine from 'highlight.js/styles/rose-pine.min.css?inline';
import hljsThemeRosePineDawn from 'highlight.js/styles/rose-pine-dawn.min.css?inline';
import hljsThemeRosePineMoon from 'highlight.js/styles/rose-pine-moon.min.css?inline';
import hljsThemeRouteros from 'highlight.js/styles/routeros.min.css?inline';
import hljsThemeSchoolBook from 'highlight.js/styles/school-book.min.css?inline';
import hljsThemeShadesOfPurple from 'highlight.js/styles/shades-of-purple.min.css?inline';
import hljsThemeSrcery from 'highlight.js/styles/srcery.min.css?inline';
import hljsThemeStackoverflowDark from 'highlight.js/styles/stackoverflow-dark.min.css?inline';
import hljsThemeStackoverflowLight from 'highlight.js/styles/stackoverflow-light.min.css?inline';
import hljsThemeSunburst from 'highlight.js/styles/sunburst.min.css?inline';
import hljsThemeTokyoNightDark from 'highlight.js/styles/tokyo-night-dark.min.css?inline';
import hljsThemeTokyoNightLight from 'highlight.js/styles/tokyo-night-light.min.css?inline';
import hljsThemeTomorrowNightBlue from 'highlight.js/styles/tomorrow-night-blue.min.css?inline';
import hljsThemeTomorrowNightBright from 'highlight.js/styles/tomorrow-night-bright.min.css?inline';
import hljsThemeVs from 'highlight.js/styles/vs.min.css?inline';
import hljsThemeVs2015 from 'highlight.js/styles/vs2015.min.css?inline';
import hljsThemeXcode from 'highlight.js/styles/xcode.min.css?inline';
import hljsThemeXt256 from 'highlight.js/styles/xt256.min.css?inline';

// Map theme names to their CSS content
const themeMap = {
  '1c-light': hljsTheme1cLight,
  'a11y-dark': hljsThemeA11yDark,
  'a11y-light': hljsThemeA11yLight,
  'agate': hljsThemeAgate,
  'an-old-hope': hljsThemeAnOldHope,
  'androidstudio': hljsThemeAndroidstudio,
  'arduino-light': hljsThemeArduinoLight,
  'arta': hljsThemeArta,
  'ascetic': hljsThemeAscetic,
  'atom-one-dark': hljsThemeAtomOneDark,
  'atom-one-dark-reasonable': hljsThemeAtomOneDarkReasonable,
  'atom-one-light': hljsThemeAtomOneLight,
  'brown-paper': hljsThemeBrownPaper,
  'codepen-embed': hljsThemeCodepenEmbed,
  'color-brewer': hljsThemeColorBrewer,
  'cybertopia-cherry': hljsThemeCybertopiaCherry,
  'cybertopia-dimmer': hljsThemeCybertopiaDimmer,
  'cybertopia-icecap': hljsThemeCybertopiaIcecap,
  'cybertopia-saturated': hljsThemeCybertopiaSaturated,
  'dark': hljsThemeDark,
  'default': hljsThemeDefault,
  'devibeans': hljsThemeDevibeans,
  'docco': hljsThemeDocco,
  'far': hljsThemeFar,
  'felipec': hljsThemeFelipec,
  'foundation': hljsThemeFoundation,
  'github': hljsThemeGithub,
  'github-dark': hljsThemeGithubDark,
  'github-dark-dimmed': hljsThemeGithubDarkDimmed,
  'gml': hljsThemeGml,
  'googlecode': hljsThemeGooglecode,
  'gradient-dark': hljsThemeGradientDark,
  'gradient-light': hljsThemeGradientLight,
  'grayscale': hljsThemeGrayscale,
  'hybrid': hljsThemeHybrid,
  'idea': hljsThemeIdea,
  'intellij-light': hljsThemeIntellijLight,
  'ir-black': hljsThemeIrBlack,
  'isbl-editor-dark': hljsThemeIsblEditorDark,
  'isbl-editor-light': hljsThemeIsblEditorLight,
  'kimbie-dark': hljsThemeKimbieDark,
  'kimbie-light': hljsThemeKimbieLight,
  'lightfair': hljsThemeLightfair,
  'lioshi': hljsThemeLioshi,
  'magula': hljsThemeMagula,
  'mono-blue': hljsThemeMonoBlue,
  'monokai': hljsThemeMonokai,
  'monokai-sublime': hljsThemeMonokaiSublime,
  'night-owl': hljsThemeNightOwl,
  'nnfx-dark': hljsThemeNnfxDark,
  'nnfx-light': hljsThemeNnfxLight,
  'nord': hljsThemeNord,
  'obsidian': hljsThemeObsidian,
  'panda-syntax-dark': hljsThemePandaSyntaxDark,
  'panda-syntax-light': hljsThemePandaSyntaxLight,
  'paraiso-dark': hljsThemeParaisoDark,
  'paraiso-light': hljsThemeParaisoLight,
  'pojoaque': hljsThemePojoaque,
  'purebasic': hljsThemePurebasic,
  'qtcreator-dark': hljsThemeQtcreatorDark,
  'qtcreator-light': hljsThemeQtcreatorLight,
  'rainbow': hljsThemeRainbow,
  'rose-pine': hljsThemeRosePine,
  'rose-pine-dawn': hljsThemeRosePineDawn,
  'rose-pine-moon': hljsThemeRosePineMoon,
  'routeros': hljsThemeRouteros,
  'school-book': hljsThemeSchoolBook,
  'shades-of-purple': hljsThemeShadesOfPurple,
  'srcery': hljsThemeSrcery,
  'stackoverflow-dark': hljsThemeStackoverflowDark,
  'stackoverflow-light': hljsThemeStackoverflowLight,
  'sunburst': hljsThemeSunburst,
  'tokyo-night-dark': hljsThemeTokyoNightDark,
  'tokyo-night-light': hljsThemeTokyoNightLight,
  'tomorrow-night-blue': hljsThemeTomorrowNightBlue,
  'tomorrow-night-bright': hljsThemeTomorrowNightBright,
  'vs': hljsThemeVs,
  'vs2015': hljsThemeVs2015,
  'xcode': hljsThemeXcode,
  'xt256': hljsThemeXt256,
};

/**
 * Component that loads and manages highlight.js theme CSS
 * Loads ALL themes as <style> elements and toggles them via the disabled property
 * This is the recommended approach from highlight.js
 */
export function HighlightThemeLoader() {
  const styleElements = useRef({});
  const initialized = useRef(false);

  useEffect(() => {
    // Step 1: Create <style> elements for ALL themes (only once on mount)
    if (!initialized.current) {
      Object.entries(themeMap).forEach(([themeName, cssContent]) => {
        const style = document.createElement('style');
        style.textContent = cssContent;
        style.dataset.hljsTheme = themeName;
        style.disabled = true; // ALL disabled by default
        document.head.appendChild(style);
        styleElements.current[themeName] = style;
      });
      initialized.current = true;
    }

    // Step 2: Enable ONLY the selected theme, disable all others
    const currentTheme = highlightTheme.value;
    Object.entries(styleElements.current).forEach(([themeName, styleTag]) => {
      styleTag.disabled = (themeName !== currentTheme);
    });
    
  }, [highlightTheme.value]);

  return null; // This component doesn't render anything
}
