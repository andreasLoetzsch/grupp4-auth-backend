# Grupp4 Auth Backend

## Beskrivning

Detta är backend-delen för autentisering i ett projekt inom kursen
**"Webbsäkerhet: Analys och implementation"**.

---

## Starta projektet lokalt

### 1. Klona projektet

Kör följande kommando i terminalen:

```bash
git clone https://github.com/hampusvh/FWK24S-WAI-Projektarbete-Frontend.git
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Skapa miljöfil (.env)

Skapa en `.env`-fil i projektets rotkatalog och fyll i relevanta värden:

```bash
PORT=3001
NODE_ENV="development"
DB_CONNECTION_STRING="mongodb+srv://<användarnamn>:<lösenord>@cluster.mongodb.net/<databasnamn>"
ACCESS_TOKEN_SECRET="<hemligt värde för access-token>"
REFRESH_TOKEN_SECRET="<hemligt värde för refresh-token>"
SECRET_RECAPTCHA_SERVER_KEY="<server key>"
REDIS_URL="redis://127.0.0.1:6379"
REDIS_TLS=false
REDIS_TTL_MINUTES=15
```

> **Tips:** Anpassa port och anslutningssträngar efter din lokala
> miljö.

---

## Starta Storybook

```bash
npm run storybook
```

---

## Starta Swagger API-dokumentation

### 1. Starta servern (utvecklingsläge)

```bash
npm run dev
```

### 2. Öppna API-dokumentationen

När servern körs kan du öppna Swagger-dokumentationen i din webbläsare:\
<http://localhost:3001/api-docs>

> **Observera:** Om servern körs på en annan port -- uppdatera
> portnumret i URL:en.
