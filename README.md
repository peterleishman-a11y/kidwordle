# Kid Wordle

A kid-friendly Wordle game for ages 6-8. Plays in any browser, looks like a
real app when added to the iPad/iPhone home screen.

## How to play

- **Random Word** — the game picks a secret 5-letter word; you have 6 guesses.
- **Two Players** — Player 1 types a secret word (hidden as dots), Player 2 guesses it.

## Project structure

```
index.html          Page structure + the screens (start, confirm, pass)
styles.css          All styling
words.js            ~110 kid-friendly answer words. Edit freely to add/remove.
valid-guesses.js    ~2000 accepted-guess words. Rarely edited.
game.js             Game logic, screen flow, keyboard input
```

The `?v=1.X` query string on each asset in `index.html` is a cache-buster.
When you ship a new version, bump it (in `index.html` for the asset URLs and
the `#version` div) so browsers fetch fresh files instead of stale cached ones.

## Editing

- **Want different answer words?** Edit `words.js`.
- **Player typed a real word the game rejects?** Add it to `valid-guesses.js`.
- **Visual tweaks?** Edit `styles.css`.
- **Behavior changes?** Edit `game.js`.

After any edit: commit + push, GitHub Pages re-deploys within a minute.
Hard-refresh in Safari (or close & reopen the home-screen app) if changes
don't show — and bump the `?v=` query string if you want to force everyone's
browser to pick up changes right away.

## Versions

- v1.0 — initial random-word game
- v1.1 — 2-player set-word mode
- v1.2 — smaller tiles, wider ENTER button (better fit on iPhone)
- v1.3 — version label in top-right corner
- v1.4 — refactored into separate files (no user-facing change)
- v1.5 — added a Reset button so you can bail mid-game without killing the app
- v1.6 — 2-player mode now validates Player 1's secret word and Player 2's guesses against the dictionary
