/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { render } from 'preact';
import { App } from './App';
import './style.css';

// Import default highlight.js theme
import 'highlight.js/styles/github-dark.min.css';

render(<App />, document.getElementById('app'));
