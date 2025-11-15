# WALLPAPER

imposta l'immagine giornaliera come sfondo del desktop salvandola
in locale nel folder designato

````
$ node main.js [--path="path/to/image"] [--size=3840x2400] [--screen=all] [--scale=span] [--date=20251110] [--reset=true]
````

**Arguments**:
- `--path`: cartella di salvataggio dell'immagine scaricata (default: `%USERPROFILE%/Pictures`);
- `--size`: dimensioni immagine (default: `3840x2400`);
- `--screen`: impostazione schermo (default: `all`, available: `all`, `main`);
- `--scale`: scalatura (default: `span`, available: `center`, `tile`, `stretch`, `fit`, `fill`, `span`);
- `--date`: imposta l'immagine alla data (default: calcolata sulla data corrente, available format: `yyyymmdd`);
- `--reset`: attiva refresh per bug windows nel caso di multi schermo (default: assente, available: `true`, `false`);
