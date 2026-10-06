# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Build for OSC

The frontend is a static Vite build. The API address is read at build time, so set it in the shell that runs the build. Do not commit `.env` files.

| Variable | Required | Example | Used by |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `https://<id>.apps.osaas.io` (the backend My App address), or an empty string when the backend serves this frontend itself | `src/config/api.ts` |
| `VITE_FRONTEND_URL` | No | leave unset, the code falls back to `window.location.origin` | `TeamDetailPage.tsx` |

Build, then publish the whole `dist` folder:

```bash
cd frontend
npm install
VITE_API_BASE_URL=https://<id>.apps.osaas.io npm run build
```

### Uploads

Videos and profile pictures do not go through the backend. The browser asks the backend for a signed upload ticket (`POST /uploads`), sends the file in chunks straight to the storage provider named in the ticket, and then sends only a small reference to the backend when it creates the project or saves the profile picture. The size limits come from `GET /uploads/limits`, so changing them needs no frontend build. The upload code lives in `src/utils/upload/`. Adding another storage provider means adding a driver there and one case in `uploadMedia.ts`.
