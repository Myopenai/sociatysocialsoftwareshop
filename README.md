# sociatysocialsoftwareshop.-
sociaty social software shop 
Info: https://8sociatysocialsoftwareshop8.netlify.app 

## Netlify deployment

The root project is a NestJS application, not a Jekyll site. `netlify.toml`
overrides the dashboard build settings with `npm run build` and publishes
`public/`. Node.js 24 is required for the Netlify Server runtime.

Netlify serves the frontend from `public/` and starts the compiled NestJS API
through `netlify/server/index.mjs`. The application uses Netlify's `PORT`
environment variable, with port 3000 as the local default. Do not publish the
repository root or `dist/`: they contain application code rather than public assets.
