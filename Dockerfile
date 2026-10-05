# syntax=docker/dockerfile:1

# ---- Bygg ----------------------------------------------------------------
FROM node:22-alpine AS bygg
WORKDIR /app

# Avhengighetene først, slik at laget gjenbrukes når bare kildekoden endres.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Produksjonsavhengigheter -------------------------------------------
# Egen omgang uten dev-avhengigheter. Det halverer bildet og fjerner byggeverktøy
# fra containeren som faktisk står på nett.
FROM node:22-alpine AS pakker
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Kjøring -------------------------------------------------------------
FROM node:22-alpine AS drift
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

# Kjører som node-brukeren, ikke root. Bildet inneholder ingen pakkebehandler
# og ingen kildekode – bare det som skal til for å svare på forespørsler.
COPY --from=pakker --chown=node:node /app/node_modules ./node_modules
COPY --from=bygg   --chown=node:node /app/dist ./dist
COPY --chown=node:node server.mjs sikkerhet.mjs package.json ./

USER node
EXPOSE 8080

# Fly sjekker /status. Denne er for lokal docker run og for andre plattformer.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
