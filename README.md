# WALLPAPER

Scarica un'immagine giornaliera da una delle sorgenti supportate (Bing, il suo mirror
storico o Windows Spotlight), la salva in locale nella cartella designata e la imposta
come sfondo del desktop. Le immagini già scaricate non vengono richieste di nuovo.

## Installazione

Installazione globale standard (rende disponibile il comando `wp`):

````
$ npm install -g .
````

In sviluppo, o con `nvm` quando si cambia versione di node, si può simulare l'installazione
copiando il pacchetto nel prefix globale attivo e rigenerando gli shim `wp`, `wp.cmd`, `wp.ps1`:

````
$ npm run install:local
````

(equivalente a `sh ./install-local.sh`; se `node_modules` manca o è incompleta esegue prima `npm install`).

## Uso

````
$ wp [--provider=azure|bing|spotlight] [--date=<valore>] [--path=<cartella>] [--size=3840x2400] [--screen=all] [--scale=span] [--mkt=it-IT] [--reset]
````

`wp` senza argomenti (o con `--help`/`-h`) mostra l'elenco delle opzioni e i default correnti.

**Argomenti**:
- `--provider`, `-p`: sorgente immagine (default: `azure`);
   - `azure`: mirror `bingwallpaperimages.azureedge.net`, immagini indicizzate per data;
   - `bing`: Bing ufficiale (`HPImageArchive`), disponibili solo gli ultimi 8 giorni,
     immagine ridimensionata e ritagliata a `--size`;
   - `spotlight`: Windows Spotlight, immagine corrente 3840x2160 (ignora `--date` e `--size`);
- `--date`, `-d`: immagine alla data (default: `today`);
   - `today`, `yesterday`;
   - `yyyymmdd`: data specifica;
   - valori numerici inferiori a 1000 (positivi o negativi) sono intesi come decrementi dalla data odierna;
   - il valore può essere passato nudo: `wp -2`, `wp yesterday`, `wp 20251110` equivalgono a `--date=<valore>`;
- `--mkt`: mercato/lingua per `bing` e `spotlight` (default: `it-IT`);
- `--path`: cartella di salvataggio dell'immagine scaricata (default: `%USERPROFILE%/Pictures`);
- `--size`: dimensioni immagine (default: `3840x2400`);
- `--screen`: schermo (default: `all`; valori: `all`, `main`);
- `--scale`: scalatura (default: `span`; valori: `center`, `tile`, `stretch`, `fit`, `fill`, `span`);
- `--reset`, `-r`: forza il doppio set dello sfondo che aggira un bug di Windows con più schermi.
  Scatta comunque in automatico quando `--date` è specificata o quando l'immagine da impostare
  è diversa da quella attualmente attiva.

## Configurazione

Ogni parametro si risolve in quest'ordine: argomento > variabile d'ambiente > `settings.js` > default.

**Variabili d'ambiente**: `WALLPAPER_PROVIDER`, `WALLPAPER_MKT`, `WALLPAPER_PATH`,
`WALLPAPER_SIZE`, `WALLPAPER_SCREEN`, `WALLPAPER_SCALE`.

Permanente per l'utente corrente su Windows (vale per le console aperte dopo):

````
setx WALLPAPER_PROVIDER bing
````

**`settings.js`**: default del pacchetto, modificabili prima dell'installazione:

````js
export const OPTIONS = {
  provider: 'azure',
  mkt: 'it-IT',
  size: '3840x2400',
  path: '%USERPROFILE%/Pictures',
  screen: 'all',
  scale: 'span'
}
````

## File scaricati

Le immagini vengono salvate in `--path` con nome dipendente dalla sorgente:
`bkg-<yyyymmdd>.jpg` (azure), `bing-<yyyymmdd>.jpg` (bing), `spotlight-<id>.jpg` (spotlight).
