#!/usr/bin/env node
'use strict';

import download from 'image-downloader';
import { resolve } from 'node:path';
import { setWallpaper, getWallpaper } from 'wallpaper';
import fs from 'fs';
import packageJson from './package.json' with { type: "json" };
import {OPTIONS} from './settings.js';

const argv = {};
(process.argv||[]).forEach((a, i) => {
  if (i<1) {
    argv['_'] = a;
  } else if (i === 1) {
    argv['__'] = a;
  } else if (/^-?\d+$/.test(a) || /^(today|yesterday)$/.test(a)) {
    // valore nudo: "wp -2", "wp 20251110", "wp yesterday" equivalgono a --date=<valore>
    argv['date'] = a;
  } else {
    const values = a.split('=');
    const pn = `${values[0]}`.replace(/^-+/g, '');
    argv[pn] = `${values[1]||''}`||true;
  }
});

const replaceEnv = (pt) => {
  return pt.replace(/%(.*?)%/g, (m, w) => process.env[w]||'');
}

const twoCharNum = (s) => `${s||''}`.length<2 ? `0${s||''}` : s;

const getDateImage = (d) => `${d.getFullYear()}${twoCharNum(d.getMonth()+1)}${twoCharNum(d.getDate())}`;

const getRelativeDateImage = (d, n) => {
  d.setDate(d.getDate() - n);
  return getDateImage(d);
}

const getImagePath = () => {
  let ip = argv['date'] || argv['d'] || 'today';
  const inv = parseInt(ip);
  const d = new Date();
  if (!isNaN(inv) && inv < 1000 && inv > -1000) {
    return getRelativeDateImage(d, Math.abs(inv));
  } else {
    switch (ip) {
      case 'today':
        return getRelativeDateImage(d, 1);
      case 'yesterday':
        return getRelativeDateImage(d, 2);
    }
  }
  return ip;
}

const PROVIDERS = ['azure', 'bing', 'spotlight'];

const parseSize = (size) => {
  const m = /^(\d+)x(\d+)$/.exec(size||'');
  return m ? { w: parseInt(m[1]), h: parseInt(m[2]) } : null;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
};

// mirror azureedge (comportamento storico): immagini nominate per data
const resolveAzure = async (ip, size) => ({
  url: `https://bingwallpaperimages.azureedge.net/Latest/${size}/${ip}.jpg`,
  name: `bkg-${ip}.jpg`
});

// Bing ufficiale: archivio degli ultimi 8 giorni, ritaglio alla dimensione richiesta
const resolveBing = async (ip, size) => {
  const mkt = argv['mkt'] || process.env.WALLPAPER_MKT || OPTIONS.mkt || 'it-IT';
  const json = await fetchJson(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${mkt}`);
  const images = json.images || [];
  const img = images.find(i => i.startdate === ip) || images.find(i => i.enddate === ip);
  if (!img) throw new Error(`immagine "${ip}" non disponibile su Bing (archivio: ${images.map(i => i.startdate).join(', ')})`);
  const sz = parseSize(size);
  const crop = sz ? `&w=${sz.w}&h=${sz.h}&rs=1&c=4` : '';
  return {
    url: `https://www.bing.com${img.urlbase}_UHD.jpg${crop}`,
    name: `bing-${img.startdate}.jpg`,
    info: img.copyright
  };
};

// Windows Spotlight: immagine corrente (3840x2160), nessuna scelta di data o dimensione
const resolveSpotlight = async () => {
  const mkt = argv['mkt'] || process.env.WALLPAPER_MKT || OPTIONS.mkt || 'it-IT';
  const country = mkt.split('-')[1] || 'IT';
  const json = await fetchJson(`https://fd.api.iris.microsoft.com/v4/api/selection?placement=88000820&bcnt=1&country=${country}&locale=${mkt}&fmt=json`);
  const raw = json?.batchrsp?.items?.[0]?.item;
  const ad = raw ? JSON.parse(raw).ad : null;
  const url = ad?.landscapeImage?.asset;
  if (!url) throw new Error('nessuna immagine restituita da Spotlight');
  const id = (/creativeservice\/([0-9a-f-]+)_/i.exec(url) || [])[1] || getDateImage(new Date());
  return { url, name: `spotlight-${id}.jpg`, info: ad.title };
};

const RESOLVERS = { azure: resolveAzure, bing: resolveBing, spotlight: resolveSpotlight };

const downloadWallpaper = async (cb) => {
  const provider = argv['provider'] || argv['p'] || process.env.WALLPAPER_PROVIDER || OPTIONS.provider || 'azure';
  if (!RESOLVERS[provider]) {
    console.error(`provider "${provider}" sconosciuto (ammessi: ${PROVIDERS.join(', ')})`);
    process.exit(1);
  }
  const ip = getImagePath();
  const size = argv['size'] || process.env.WALLPAPER_SIZE || OPTIONS.size || '3840x2400';
  const targetFolderRaw = argv['path'] ||  process.env.WALLPAPER_PATH || OPTIONS.path || '%USERPROFILE%/Pictures';
  const targetFolder = replaceEnv(targetFolderRaw);

  let img;
  try {
    img = await RESOLVERS[provider](ip, size);
  } catch (err) {
    console.error(`[${provider}] ${err.message}`);
    process.exit(1);
  }
  if (img.info) console.log(`[${provider}] ${img.info}`);

  const targetPath = resolve(targetFolder, img.name);
  if (fs.existsSync(targetPath)) {
    console.log(`image already downloaded "${targetPath}"`);
    if (cb) cb(targetPath);
  } else {
    console.log(`downloading image "${img.url}"`);
    download.image({ url: img.url, dest: targetPath })
      .then(() => cb ? cb(targetPath) : null)
      .catch((err) => console.error(err));
  }
  return targetPath;
}

const _setWallpaper = (pt, o, timeout = 0) => setTimeout(() => void setWallpaper(pt, o), timeout);

console.log(`
  _    _       _ _                             
| |  | |     | | |                            
| |  | | __ _| | |_ __   __ _ _ __   ___ _ __ 
| |/\\| |/ _\` | | | '_ \\ / _\` | '_ \\ / _ \\ '__|
\\  /\\  / (_| | | | |_) | (_| | |_) |  __/ |   
 \\/  \\/ \\__,_|_|_| .__/ \\__,_| .__/ \\___|_|   
                 | |         | |              
                 |_|         |_|              
 v.${packageJson.version} by Leo`);

const printHelp = () => {
  console.log(`
USAGE
  wp [--provider=<provider>] [--date=<value>] [--path=<folder>] [--size=<WxH>] [--screen=<screen>] [--scale=<scale>] [--reset]

OPTIONS
  --date, -d    immagine alla data (default: today); il valore nudo equivale: "wp -2", "wp yesterday"
                  today | yesterday
                  yyyymmdd            data specifica
                  n (|n| < 1000)      decremento in giorni dalla data odierna
  --provider,-p sorgente: azure | bing | spotlight (default: ${OPTIONS.provider || 'azure'})
                  azure       mirror bingwallpaperimages.azureedge.net (per data)
                  bing        Bing ufficiale, ultimi 8 giorni, ritaglio a --size
                  spotlight   Windows Spotlight, immagine corrente 3840x2160 (ignora --date e --size)
  --mkt         mercato/lingua per bing e spotlight (default: ${OPTIONS.mkt || 'it-IT'})
  --path        cartella di salvataggio (default: ${OPTIONS.path || '%USERPROFILE%/Pictures'})
  --size        dimensioni immagine (default: ${OPTIONS.size || '3840x2400'})
  --screen      schermo: all | main (default: ${OPTIONS.screen || 'all'})
  --scale       scalatura: center | tile | stretch | fit | fill | span (default: ${OPTIONS.scale || 'span'})
  --reset, -r   forza il refresh dello sfondo (bug windows multi schermo)
  --help, -h    mostra questo aiuto

PRIORITA'
  argomento > variabile d'ambiente > settings.js > default

VARIABILI D'AMBIENTE
  WALLPAPER_PROVIDER  WALLPAPER_MKT  WALLPAPER_PATH  WALLPAPER_SIZE  WALLPAPER_SCREEN  WALLPAPER_SCALE
  es. (persistente):  setx WALLPAPER_PROVIDER bing
`);
};

const noArgs = Object.keys(argv).filter(k => !['_', '__', 'no-warnings'].includes(k)).length === 0;
if (noArgs || argv['help'] || argv['h']) {
  printHelp();
  process.exit(0);
}

// scarica l'immagine e la imposta come sfondo del desktop
downloadWallpaper(async (pt) => {
  const screen = argv['screen'] || process.env.WALLPAPER_SCREEN || OPTIONS.screen || 'all';
  const scale = argv['scale'] || process.env.WALLPAPER_SCALE || OPTIONS.scale || 'span';
  // il reset (doppio set, bug windows multi schermo) scatta se richiesto esplicitamente
  // oppure se l'immagine è diversa da quella attualmente impostata
  const current = await getWallpaper().catch(() => '');
  const changed = resolve(current || '') !== resolve(pt);
  const reset = !!argv['reset']||!!argv['r']||!!argv['date']||changed;

  console.log(`USING\n\tscreen:\t${screen}\n\tscale:\t${scale}\n\timage:\t${pt}\n\treset:\t${reset}`);

  if (reset) {
    const scale_pre = (scale === 'fit') ? 'stretch' : 'fit';
    setWallpaper(pt, { screen, scale: scale_pre }).then(() => _setWallpaper(pt, {screen, scale}, 250));
  } else {
    _setWallpaper(pt, {screen, scale});
  }
});