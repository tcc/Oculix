# oculix.org — Official OculiX website

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build). Deployed on Cloudflare Pages.

## Local dev

```bash
npm install
npm run dev    # http://localhost:4321
```

## Structure

```
oculix-site/
├── public/                 # static assets (favicon)
├── src/
│   ├── assets/             # gecko logo + hero
│   ├── content/docs/
│   │   ├── en/             # English content
│   │   └── fr/             # French content
│   ├── styles/custom.css   # OculiX purple/cyan theme
│   └── content.config.ts
├── astro.config.mjs        # Starlight config (sidebar, i18n, social)
└── package.json
```

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Local dev server at `localhost:4321`    |
| `npm run build`   | Build production site to `./dist/`      |
| `npm run preview` | Preview the production build locally    |
