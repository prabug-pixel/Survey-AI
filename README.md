# Survey-AI

AI-powered survey creation agent built with React, TypeScript, Redux Toolkit, and the @birdeye/elemental design system.

## Prerequisites

- **Node.js** 20.x or later (developed against Node 22+)
- **npm** 10.x or later
- **Git** with SSH access to `github.com:prabug-pixel/Survey-AI.git` (or use the HTTPS URL below)
- An **Anthropic API key** (`sk-ant-…`) for the backend agent

## Get the code

```bash
# SSH (recommended if your GitHub key is set up)
git clone git@github.com:prabug-pixel/Survey-AI.git

# or HTTPS
git clone https://github.com/prabug-pixel/Survey-AI.git

cd Survey-AI
```

## Check out the active branch

All in-progress work lives on `Dev-v1.0`. After cloning:

```bash
git fetch origin
git checkout Dev-v1.0
git pull origin Dev-v1.0
```

To confirm you're on the right branch and up to date:

```bash
git status
git log --oneline -5
```

## Install dependencies

The `@birdeye/elemental` package is vendored as a tarball at `vendor/birdeye-elemental-1.1.81.tgz` — no separate checkout is required. The repo also ships a `.npmrc` with `legacy-peer-deps=true`, so a plain install works:

```bash
npm install
```

## Configure environment

Copy the example env file and fill in your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
PORT=3001
```

> `.env` is gitignored — never commit it.

## Run locally

The app has a Vite frontend and a small Express backend that proxies Anthropic API calls. Run both together:

```bash
npm run dev:all
```

Or run them in separate terminals:

```bash
npm run dev       # Vite frontend (http://localhost:5173)
npm run server    # Express backend (http://localhost:3001)
```

## Other scripts

| Command              | What it does                                |
| -------------------- | ------------------------------------------- |
| `npm run build`      | Type-check and produce a production bundle  |
| `npm run preview`    | Serve the production bundle locally         |
| `npm run lint`       | Run ESLint over the project                 |
| `npm run storybook`  | Launch Storybook on port 6006               |

## Branch workflow

- `main` — stable baseline
- `Dev-v1.0` — current development branch (target for PRs while v1.0 is in flight)

Create feature branches off `Dev-v1.0` and open PRs back into it:

```bash
git checkout Dev-v1.0
git pull origin Dev-v1.0
git checkout -b feat/your-change
# …commit work…
git push -u origin feat/your-change
```

## Troubleshooting

- **`@birdeye/elemental` install fails** — make sure `vendor/birdeye-elemental-1.1.81.tgz` is present (it ships in the repo). If it's missing, re-pull the branch.
- **`findDOMNode` errors at runtime** — the project includes `src/polyfills/react-dom-with-findDOMNode.ts`, aliased in `vite.config.ts`. Don't remove the alias; it's required for elemental's date picker under React 19.
- **Port already in use** — change `PORT` in `.env` (backend) or pass `--port` to `vite` (frontend).
