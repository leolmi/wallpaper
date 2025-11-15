import download from 'image-downloader';
import { resolve } from 'node:path';
import { setWallpaper } from 'wallpaper';
import fs from 'fs';
import packageJson from './package.json' with { type: "json" };

const argv = {};
(process.argv||[]).forEach((a, i) => {
  if (i<1) {
    argv['_'] = a;
  } else if (i === 1) {
    argv['__'] = a;
  } else {
    const values = a.split('=');
    const pn = `${values[0]}`.replace(/^--/g, '');
    const pv = `${values[1]||''}`||true;
    argv[pn] = pv;
  }
});

const replaceEnv = (pt) => {
  return pt.replace(/%(.*?)%/g, (m, w) => process.env[w]||'');
}

const twoCharNum = (s) => `${s||''}`.length<2 ? `0${s||''}` : s;

const downloadWallpaper = (cb) => {
  const yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const dt_str = argv['date'] || `${yd.getFullYear()}${twoCharNum(yd.getMonth()+1)}${twoCharNum(yd.getDate())}`;
  const size = argv['size'] || process.env.WALLPAPER_SIZE || '3840x2400';
  const targetFolderRaw = argv['path'] ||  process.env.WALLPAPER_PATH || '%USERPROFILE%/Pictures';
  const targetFolder = replaceEnv(targetFolderRaw);
  const targetPath = resolve(targetFolder, `bkg-${dt_str}.jpg`);
  if (fs.existsSync(targetPath)) {
    console.log(`image already downloaded "${targetPath}"`);
    if (cb) cb(targetPath);
  } else {
    const options = {
      url: `https://bingwallpaperimages.azureedge.net/Latest/${size}/${dt_str}.jpg`,
      dest: targetPath
    };
    console.log(`downloading image "${options.url}"`);
    download.image(options)
      .then(() => cb ? cb(targetPath) : null)
      .catch((err) => console.error(err));
  }
  return targetPath;
}

const _setWallpaper = (pt, o, timeout = 0) => {
  setTimeout(() => {
    console.log(`settings wallpaper with screen=${o.screen} and scale=${o.scale}`);
    void setWallpaper(pt, o);
  }, timeout);
}

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

// scarica l'immagine e la imposta come sfondo del desktop
downloadWallpaper((pt) => {
  const screen = argv['screen'] || process.env.WALLPAPER_SCREEN || 'all';
  const scale = argv['scale'] || process.env.WALLPAPER_SCALE || 'span';
  if (argv['reset']) {
    const scale0 = (scale === 'fit') ? 'stretch' : 'fit';
    setWallpaper(pt, { screen, scale: scale0 }).then(() => _setWallpaper(pt, {screen, scale}, 250));
  } else {
    _setWallpaper(pt, {screen, scale});
  }
});
