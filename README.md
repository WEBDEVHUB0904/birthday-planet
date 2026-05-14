# Stardust Wish Launch

A cosmic-themed TanStack Start app built with Vite, React, TypeScript, Tailwind CSS, and Cloudflare tooling.

## Prerequisites

- Node.js 20 or newer
- npm

## Installation

Follow these steps to install and run the project locally:

1. Clone the repository:

```bash
git clone <repository-url>
cd stardust-wish-launch-main
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser at the local URL shown in the terminal.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run build:dev` — build in development mode
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run format` — format code with Prettier

## Project Notes

- The app uses TanStack Start routing and SSR.
- `src/server.ts` provides the server entry and error handling.
- `wrangler.jsonc` is configured for Cloudflare deployment.

## Deployment

To prepare a production build, run:

```bash
npm run build
```

If you deploy to Cloudflare, make sure your Wrangler configuration matches your target environment.
