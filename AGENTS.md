# Agent Instructions for GH-Quick-Review

## Core Principles

### 1. Human Directives
**Always follow human directives without question.** When a human provides specific instructions or requests changes, implement them exactly as specified. Do not second-guess or question the human's decisions.

### 2. Code Pattern Analysis
**Read code extensively before making changes.** Always:
- Review existing files and patterns in the codebase thoroughly
- Understand the current architecture and conventions
- Match existing coding styles and patterns
- Look for similar implementations to use as reference
- Ensure consistency with the established codebase patterns

### 3. Code Quality Standards

#### Nesting
**Avoid excessive nesting.** Keep code flat and readable:
- Prefer early returns over deep nesting
- Extract complex logic into well-named functions
- Use guard clauses to reduce indentation levels
- Maximum recommended nesting depth: 3 levels

#### Line Length
**Keep lines under 120 columns.** This ensures readability across different editors and screens:
- Break long lines into multiple lines
- Use appropriate line breaks for method chains
- Split long parameter lists across multiple lines
- Keep string concatenation readable

## Modern JavaScript Best Practices

### ES Modules
- Use ES6 `import`/`export` syntax (this project uses `"type": "module"`)
- Avoid CommonJS `require()` unless absolutely necessary for compatibility

### Async/Await
- Prefer `async`/`await` over raw Promises for better readability
- Always handle errors with try/catch blocks
- Use `Promise.all()` for concurrent operations

### Destructuring
- Use object and array destructuring for cleaner code
- Destructure function parameters when appropriate

### Arrow Functions
- Use arrow functions for short, single-purpose functions
- Use regular functions when `this` context matters
- Keep arrow functions concise and readable

### Modern Array Methods
- Use `.map()`, `.filter()`, `.reduce()`, `.find()`, etc. over loops
- Prefer declarative over imperative code

### Template Literals
- Use template literals for string interpolation
- Use tagged templates for advanced formatting

### Const and Let
- Default to `const` for all variables
- Use `let` only when reassignment is necessary
- Never use `var`

### Error Handling
- Always handle errors appropriately
- Use custom error classes for specific error types
- Provide meaningful error messages

### Code Organization
- One responsibility per function/module
- Keep functions small and focused
- Use descriptive, meaningful names
- Group related functionality together

### Comments
- Write self-documenting code with clear names
- Add comments only when code intent isn't obvious
- Keep comments up-to-date with code changes
- Use JSDoc for public APIs and complex functions

## Continuous Improvement

### Self-Correction Protocol
**When corrected on any matter, update this AGENTS.md file immediately.** Add the correction as a new guideline in the appropriate section to prevent repeating the same mistake. This ensures continuous learning and improvement of coding standards.

## Project-Specific Guidelines

*(Additional guidelines specific to this project will be added here as they emerge)*
