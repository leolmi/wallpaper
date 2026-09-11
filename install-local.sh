#!/bin/sh
# Simula "npm install -g" copiando il pacchetto nel prefix globale della versione
# node attiva (nvm) e ricreando gli shim wp / wp.cmd / wp.ps1.
# Uso: sh ./install-local.sh  (Git Bash / MSYS / Linux / macOS), oppure npm run install:local
set -e

for tool in node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "errore : '$tool' non trovato nel PATH. Installa Node.js (https://nodejs.org) o attiva una versione con nvm." >&2
    exit 1
  fi
done

src=$(cd "$(dirname "$0")" && pwd)
# node su Windows non risolve i path MSYS (/d/...): leggo package.json dalla cwd
pkg() { (cd "$src" && node -p "const p=require('./package.json'); $1"); }
name=$(pkg "p.name")
version=$(pkg "p.version")
files=$(pkg "[...p.files, 'package.json', 'README.md'].join(' ')")
bins=$(pkg "Object.entries(p.bin).map(([k,v])=>k+'='+v.replace(/^\.\//,'')).join(' ')")

prefix_win=$(npm prefix -g)
case $(uname) in
  *CYGWIN*|*MINGW*|*MSYS*) prefix=$(cygpath -u "$prefix_win") ;;
  *) prefix=$prefix_win ;;
esac
root="$prefix/node_modules/$name"

echo "prefix : $prefix"
echo "target : $root"

rm -rf "$root"
mkdir -p "$root"

for f in $files; do
  if [ -e "$src/$f" ]; then
    cp -R "$src/$f" "$root/"
    echo "copied : $f"
  fi
done

# dipendenze: se node_modules manca o è incompleta, npm install nel progetto
missing=$(pkg "Object.keys(p.dependencies||{}).filter(d=>!require('fs').existsSync('node_modules/'+d+'/package.json')).join(' ')")
if [ -n "$missing" ]; then
  echo "deps   : mancanti ($missing), eseguo npm install"
  (cd "$src" && npm install --omit=dev)
fi
cp -R "$src/node_modules" "$root/"
echo "copied : node_modules"

for b in $bins; do
  cmd=${b%%=*}
  main="node_modules/$name/${b#*=}"
  winmain=$(printf '%s' "$main" | sed 's,/,\\,g')

  cat > "$prefix/$cmd" <<'EOF_SH'
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

case `uname` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=`cygpath -w "$basedir"`;;
esac

EOF_SH
  cat >> "$prefix/$cmd" <<EOF_SH
if [ -x "\$basedir/node" ]; then
  "\$basedir/node"  "\$basedir/$main" "\$@"
  ret=\$?
else
  node  "\$basedir/$main" "\$@"
  ret=\$?
fi
exit \$ret
EOF_SH
  chmod +x "$prefix/$cmd"

  printf '%s\r\n' \
    '@ECHO off' \
    'SETLOCAL' \
    'CALL :find_dp0' \
    '' \
    'IF EXIST "%dp0%\node.exe" (' \
    '  SET "_prog=%dp0%\node.exe"' \
    ') ELSE (' \
    '  SET "_prog=node"' \
    '  SET PATHEXT=%PATHEXT:;.JS;=;%' \
    ')' \
    '' \
    "\"%_prog%\"  \"%dp0%\\$winmain\" %*" \
    'ENDLOCAL' \
    'EXIT /b %errorlevel%' \
    ':find_dp0' \
    'SET dp0=%~dp0' \
    'EXIT /b' > "$prefix/$cmd.cmd"

  printf '%s\r\n' \
    '#!/usr/bin/env pwsh' \
    '$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' \
    '' \
    '$exe=""' \
    'if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' \
    '  $exe=".exe"' \
    '}' \
    '$ret=0' \
    'if (Test-Path "$basedir/node$exe") {' \
    "  & \"\$basedir/node\$exe\"  \"\$basedir/$main\" \$args" \
    '  $ret=$LASTEXITCODE' \
    '} else {' \
    "  & \"node\$exe\"  \"\$basedir/$main\" \$args" \
    '  $ret=$LASTEXITCODE' \
    '}' \
    'exit $ret' > "$prefix/$cmd.ps1"

  echo "shim   : $cmd, $cmd.cmd, $cmd.ps1"
done

echo "done   : $name v$version installato in $prefix"
