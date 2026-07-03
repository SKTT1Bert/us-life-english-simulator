# Daily English Lab · US Life English Simulator

A local-first English learning website for real-life U.S. daily situations. It can be deployed directly to GitHub Pages and does not require a backend, login, database, or paid API.

## V3 Highlights

- Scenario Mode upgraded from dropdown selection to immersive task cards.
- 10 real-life places: DMV, Bank, Clinic, Restaurant, Supermarket, Gym, Pharmacy, Apartment Office, Airport, Post Office, and Customer Service.
- 145+ practical purposes/errands, such as replacing a lost license, disputing a bank charge, asking about copay, returning an item, canceling a gym membership, and reporting a missing package.
- Randomized Situation Card: time, place, arrival context, staff mood, task type, random background, and complication.
- Branching dialogue choices with bilingual English/Chinese lines.
- Local progress tracking with `localStorage`.
- Expression library, daily practice, quiz, favorites, dark mode, import/export progress.

## How to run locally

Open `index.html` directly in a browser.

For a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages deployment

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to `Settings -> Pages`.
4. Choose `Deploy from a branch`.
5. Select `main` and `/root`.
6. Save and wait for GitHub Pages to publish the site.

## Suggested commit message

```bash
git add .
git commit -m "Add immersive randomized scenario mode"
git push origin main
```

## File structure

```text
index.html
styles.css
app.js
data/
  expressions.js
  scenarios.js
.nojekyll
.gitignore
```

## Notes

This project is intentionally static and local-first. It uses browser speech synthesis for reading English text aloud and stores user progress only in the current browser.
