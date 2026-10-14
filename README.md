# Mohd Aman · Portfolio

> 🌐 **Live Site:** [https://mr-zero0.github.io/Portfolio/](https://mr-zero0.github.io/Portfolio/)

Modular, chat-style portfolio. No build step, no backend: clean HTML structure, decoupled CSS layers, isolated personal data, and focused JavaScript modules.

## Architecture & Project Structure

All files reside inside the `Portfolio` folder:

```text
Portfolio/
├── index.html               # Main HTML entry point & layout
├── manifest.json            # Web App Manifest
├── assets/                  # Static assets (avatar, icons, résumé PDF, og-image)
├── data/
│   └── personalData.js      # Isolated personal data (profile, skills, experience, etc.)
├── css/
│   ├── style.css            # Master stylesheet importing modular layers
│   ├── tokens.css           # Color variables, dark mode & 4 time-of-day themes
│   ├── base.css             # Resets, typography, utilities
│   ├── backgrounds.css      # Ambient gradient orbs, sky, storm & canvas containers
│   ├── components.css       # Header, landing hero, avatar, chat, cards, modals
│   ├── animations.css       # Keyframes, word reveal, spring entrances
│   └── responsive.css       # Mobile ergonomics, notch insets, reduced motion
├── js/
│   ├── icons.js             # Lucide SVG paths & icon builder
│   ├── utils.js             # DOM helpers, escaping, template parser
│   ├── modal.js             # Accessible modal controller & project details
│   ├── cards.js             # Presentation, skills, experience, project cards
│   ├── theme.js             # 4-theme cycle, night starfield, live rain engine
│   ├── chat.js              # Intent routing, quick chips, message rendering
│   ├── effects.js           # Live clock, magnetic buttons, 3D avatar tilt
│   ├── fluid.js             # Pointer-following WebGL fluid simulation
│   └── main.js              # Application bootstrapper & deep link router
├── tests/
│   └── portfolio.spec.js    # Playwright smoke test suite
└── playwright.config.js     # Playwright configuration
```

## Run locally

```bash
# From inside the Portfolio directory:
python -m http.server 8765

# Or from the parent directory:
python -m http.server 8765 --directory Portfolio
```

Then open <http://localhost:8765/>. Opening `index.html` directly from disk also works.

## Live Deployment (GitHub Pages)

The portfolio is deployed live via GitHub Pages:
👉 **[https://mr-zero0.github.io/Portfolio/](https://mr-zero0.github.io/Portfolio/)**

Deep links work directly into the conversation:
`https://mr-zero0.github.io/Portfolio/?query=What%20are%20your%20skills%3F` opens straight into the chat.

## Editing Personal Data

All personal content is cleanly isolated in `data/personalData.js`:

| Constant     | What it drives                                           |
|--------------|----------------------------------------------------------|
| `PROFILE`    | Name, title, location, contact links, summary paragraph  |
| `SKILLS`     | Skill groups and chips (plus certifications)             |
| `EXPERIENCE` | Timeline, nested engagements, impact tags, bullets       |
| `EDUCATION`  | Degree, school, year                                     |
| `PROJECTS`   | Carousel cards, modal bullets, GitHub links              |
| `FUN`        | The "outside of work" tiles                              |
| `QUICK`      | The six quick-question chips and the question each asks  |

Free-text questions are routed by keyword in `route()` inside `js/chat.js`; add words there if you add a new section.

## Tests

Playwright smoke tests live in `tests/portfolio.spec.js` (zero console errors, every quick chip renders its card, all four themes cycle, résumé link resolves, deep links open the chat):

```bash
npm i -D @playwright/test
npx playwright test
```

The config uses the system Edge (`channel: 'msedge'`), so no browser download is needed.

## Avatar

`assets/avatar.png` is the GitHub profile picture. Replace the file with any square image (a memoji-style PNG with a transparent background looks closest to the reference). If the file is missing, the page falls back to the GitHub avatar URL automatically.

## Motion

- **Fluid cursor.** A WebGL fluid simulation (after Pavel Dobryakov's MIT-licensed WebGL-Fluid-Simulation) runs on a full-screen canvas behind the content. Moving the pointer or a finger leaves iridescent colour trails. Tuning lives in the `config` object inside `js/fluid.js` (`SPLAT_FORCE` controls trail speed, `DENSITY_DISSIPATION` how long trails linger, `SPLAT_RADIUS` their thickness).
- **Everything else** is CSS keyframes plus small JS helpers: staggered entrances, drifting gradient orbs, the avatar's halo, float and spring-eased cursor tilt, and word-by-word reply streaming.
- All of it is disabled automatically when the OS asks for reduced motion.

## Theming

Colours are CSS custom properties on `:root` in `css/tokens.css`. The theme button in the top bar cycles four themes — Day, Evening, Night and Rainy (`day`, `evening`, `night`, `rainy`); the first visit picks one from the local clock, and the choice persists in `localStorage` (`tod-theme`). The Rainy theme adds live canvas rain, drifting storm clouds and random lightning flashes (all skipped under reduced motion). With no saved theme, dark mode also follows the OS setting (`prefers-color-scheme`).
