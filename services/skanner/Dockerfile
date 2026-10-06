# Skannertjenesten. Playwrights eget bilde, fordi Chromium og alle
# systembibliotekene det trenger allerede ligger der – å installere dem selv på
# en slank node-alpine er timer med arbeid og et skjørt resultat.
#
# Versjonen MÅ følge playwright-versjonen i package.json. Spriker de, laster
# Playwright ned en nettleser som ikke finnes i bildet, og tjenesten feiler
# først ved første skanning.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    # Nettleserne ligger ferdig i bildet. Uten denne prøver npm å laste dem ned på nytt.
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Bildet kommer med brukeren «pwuser». Chromium skal ikke kjøre som root.
RUN chown -R pwuser:pwuser /app
USER pwuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:8080/helse').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
