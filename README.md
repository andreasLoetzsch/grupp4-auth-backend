# grupp4-auth-backend

## Beskrivning
Det här en backend för autentisering i ett projekt i kursen "Webbsäkerhet: analys och implementation".

## Starta projektet lokalt

### Initiera projektet

1. Klona ner projektet.

Skriv i terminalen t.ex:
```bash
git clone https://github.com/hampusvh/FWK24S-WAI-Projektarbete-Frontend.git
```

2. Ladda ner beroenden:
```bash
npm install
```

3. Skapa `.env`:
```
PORT=3001
NODE_ENV="development"
DB_CONNECTION_STRING="mongodb+srv://<användarnamn>:<lösenord>@cluster.mongodb.net/databasnamn"
ACCESS_TOKEN_SECRET=<valfritt hemligt värde för access-token>
REFRESH_TOKEN_SECRET=<valfritt hemligt värde för refresh-token>
SECRET_RECAPTCHA_SERVER_KEY=6Lfb_OkrAAAAAG2L77k3fN3vjUjcNT5edWJy2wtN
```

## Starta Storybook

```bash
npm run storybook
```

## Starta Swagger API docs

1. Starta servern (development mode):

```bash
npm run dev
```

3. Öppna API dokumentation i din browser (server default port är 3001):

http://localhost:3001/api-docs

OBS: Om din server använder en annan port, ändra portnummer i URL:en.
