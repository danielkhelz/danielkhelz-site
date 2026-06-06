# Daniel Khelz — Sito Personale

Sito portfolio di **Daniel Khelz** (Daniel Calzone): violista professionista, DJ & producer, tecnico audio e stage manager.

## Struttura del progetto

```
sito/
├── index.html          # Pagina principale
├── css/
│   └── styles.css      # Stili personalizzati
├── js/
│   └── main.js         # Interazioni (menu, galleria, video)
├── images/
│   ├── photo1.jpg
│   └── photo2.jpg
├── videos/
│   ├── video1.mp4
│   └── video2.mp4
└── README.md
```

## Anteprima locale

Apri `index.html` nel browser, oppure avvia un server locale:

```bash
# Python
python -m http.server 8000

# Node.js (se hai npx)
npx serve .
```

Poi visita `http://localhost:8000`.

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository su GitHub (es. `daniel-khelz-site`)
2. Carica tutti i file di questa cartella
3. Vai su **Settings → Pages**
4. In **Source**, seleziona il branch `main` e la cartella `/ (root)`
5. Salva — il sito sarà online su `https://tuousername.github.io/daniel-khelz-site/`

### Dominio personalizzato (opzionale)

Se hai un dominio come `danielkhelz.com`:

1. Aggiungi un file `CNAME` nella root con il dominio
2. Configura i record DNS del tuo provider verso GitHub Pages

## Tecnologie

- HTML5 semantico
- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [Font Awesome](https://fontawesome.com/) (CDN)
- Google Fonts (Inter + Space Grotesk)
- JavaScript vanilla (nessuna dipendenza)

## Licenza

© 2026 Daniel Calzone • Daniel Khelz. Tutti i diritti riservati.