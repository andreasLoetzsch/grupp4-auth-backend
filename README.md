# Grupp4 Auth Backend

Backend för autentisering, sessionshantering och reCAPTCHA-verifiering inom projektet **MindJournal**.

Tjänsten hanterar inloggning, registrering, JWT-tokenlogik, sessioner i Redis och audit-loggning av känsliga användarhändelser. Fokus ligger på säker och spårbar hantering av persondata.

---

## Projektöversikt

**Frontend**  
[FWK24S-WAI-Projektarbete-Frontend](https://github.com/hampusvh/FWK24S-WAI-Projektarbete-Frontend)  
> React-app som visualiserar GDPR-flöden med Storybook, samtyckeskomponenter och transparensgränssnitt.

**Auth Backend (detta repo)**  
[grupp4-auth-backend](https://github.com/andreasLoetzsch/grupp4-auth-backend)  
> Backend för autentisering, sessionshantering, JWT-logik och audit-loggning.

**Domain Service**  
[FWK24S-WAI-projektarbete-domain-service](https://github.com/angelika-friis/FWK24S-WAI-projektarbete-domain-service)  
> Backend som hanterar journaldatan och affärslogik.

**Proxy Server**  
[grupp4-proxyserver](https://github.com/Akke/grupp4-proxyserver)  
> Proxy-lager som hanterar HTTPS och kommunikationen mellan frontend och backend-tjänster.

*Projektet är uppdelat i separata tjänster för att efterlikna en verklig applikationsarkitektur med tydlig ansvarsfördelning och fokus på dataskydd.*

---

## Starta projektet lokalt

### 1. Klona projektet

```bash
git clone https://github.com/andreasLoetzsch/grupp4-auth-backend.git
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Skapa miljöfil (.env)

Skapa en `.env`-fil i projektets rotkatalog och fyll i följande värden:

```bash
# Server
PORT=3001
NODE_ENV="development"

# Database
DB_CONNECTION_STRING="mongodb+srv://<your_username>:<your_password>@cluster.mongodb.net/<your_database_name>"

# JWT Secrets
ACCESS_TOKEN_SECRET="<your_access_token_secret_here>"
REFRESH_TOKEN_SECRET="<your_refresh_token_secret_here>"

# reCAPTCHA (server-side)
SECRET_RECAPTCHA_SERVER_KEY="<your_recaptcha_server_key_here>"

# Redis
REDIS_URL="redis://127.0.0.1:6379"
REDIS_TLS=false
REDIS_TTL_MINUTES=15
```

> **Tips:** Anpassa port, databas-URL och nycklar efter din lokala utvecklingsmiljö.

---

## Starta Swagger API-dokumentation

### 1. Starta servern

```bash
npm run dev
```

### 2. Öppna dokumentationen

Swagger UI finns på:

⮕ **http://localhost:3001/api-docs**

> **Observera:** Om porten i `.env` ändras behöver länken uppdateras.

---

## Om tjänsten

Autentiseringsbackend utgör en central del av MindJournal-projektets säkerhetsmodell.  
Tjänsten säkerställer att identiteter, tokens, sessioner och audit-loggar hanteras på ett sätt som uppfyller principer om integritet, ansvarsskyldighet och skydd av persondata.

---
