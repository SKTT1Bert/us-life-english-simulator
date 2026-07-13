# Daily English Lab V7

A fully static, local-first English learning website for real-life U.S. scenarios and market English. It can be deployed directly to GitHub Pages.

## V7 highlights

- 306 daily spoken expressions
- 22 real-life places and 311 practical purposes
- Immersive randomized branching dialogue simulator
- Light, dark, and low-saturation pink themes
- **Market English module**
  - 156 stock, options, earnings, brokerage, risk, technical, and portfolio terms
  - 56 role-play scenarios across Stocks, Options, Brokerage, Earnings, Risk, News, and Strategies
  - Bilingual definitions, examples, favorites, learned status, text-to-speech, and quiz mode
- LocalStorage progress; no login and no backend
- Import/export progress JSON
- Responsive desktop and mobile layouts

## Files

```text
index.html
styles.css
app.js
data/
  expressions.js
  scenarios.js
  marketEnglish.js
.nojekyll
.gitignore
README.md
```

## GitHub Pages deployment

Upload the **contents inside this folder** to the repository root so that `index.html` is at the top level. Then use either:

- Settings → Pages → Deploy from a branch → `main` / `/root`, or
- Settings → Pages → GitHub Actions with a static Pages deployment workflow.

## Privacy and disclaimer

Learning progress remains in the browser through `localStorage`. Market English content is for educational language practice only and is not financial advice.
