# WALLPAPER

imposta l'immagine giornaliera di Bing come sfondo del desktop salvandola
in locale nel folder designato

````
$ node main.js [--provider=azure|bing|spotlight] [--date=20251110] [--path="path/to/image"] [--size=3840x2400] [--screen=all] [--scale=span] [--reset]
````

**Arguments**:
- `--provider`: sorgente immagine (default: `azure`);
   - `azure`: mirror `bingwallpaperimages.azureedge.net`, per data;
   - `bing`: Bing ufficiale (`HPImageArchive`), ultimi 8 giorni, ritagliata a `--size`;
   - `spotlight`: Windows Spotlight, immagine corrente 3840x2160 (ignora `--date` e `--size`);
- `--mkt`: mercato/lingua per `bing` e `spotlight` (default: `it-IT`);
- `--path`: cartella di salvataggio dell'immagine scaricata (default: `%USERPROFILE%/Pictures`);
- `--size`: dimensioni immagine (default: `3840x2400`);
- `--screen`: impostazione schermo (default: `all`, available: `all`, `main`);
- `--scale`: scalatura (default: `span`, available: `center`, `tile`, `stretch`, `fit`, `fill`, `span`);
- `--date`: imposta l'immagine alla data (default: today);
   - valori ammessi: `today`, `yesterday`;
   - `yyyymmdd`: data specifica;
   - valori numerici inferiori a 1000 (positivi o negativi) sono intesi come decrementi dalla data odierna;
   - il valore può essere passato nudo: `wp -2`, `wp yesterday`, `wp 20251110` equivalgono a `--date=<valore>`;
- `--reset`: attiva refresh per bug windows nel caso di multi schermo (default: assente);
**Environment**:

Ogni parametro può essere fissato con una variabile d'ambiente, usata quando l'argomento
non è specificato (priorità: argomento > variabile > `settings.js` > default):
`WALLPAPER_PROVIDER`, `WALLPAPER_MKT`, `WALLPAPER_PATH`, `WALLPAPER_SIZE`, `WALLPAPER_SCREEN`, `WALLPAPER_SCALE`.

````
setx WALLPAPER_PROVIDER bing
````
