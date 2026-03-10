#!/usr/bin/env node
/**
 * tools/publicar-version.cjs
 * Script de publicación para Verificador Electoral CNE.
 *
 * Uso:
 *   npm run release             → bump patch (1.0.52 → 1.0.53)
 *   npm run release -- --minor  → bump minor
 *   npm run release -- --major  → bump major
 */

'use strict';

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const REPO = 'auth-co/VerificadorElectoralCNE';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function capture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function step(n, title) {
  console.log(`\n[${n}] ${title}`);
  console.log('─'.repeat(50));
}

function ok(msg)   { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function fail(msg) {
  console.error(`\n  ✗ ERROR: ${msg}\n`);
  process.exit(1);
}

function sha512b64(filePath) {
  return crypto.createHash('sha512').update(fs.readFileSync(filePath)).digest('base64');
}

function bumpVersion(v, tipo) {
  const [maj, min, pat] = v.split('.').map(Number);
  if (tipo === 'major') return `${maj + 1}.0.0`;
  if (tipo === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  PUBLICAR VERSIÓN — Verificador Electoral CNE ║');
console.log('╚══════════════════════════════════════════════╝');

const tipoArg = (process.argv[2] || '--patch').replace('--', '');
if (!['patch', 'minor', 'major'].includes(tipoArg)) {
  fail(`Argumento inválido: "${tipoArg}". Usa --patch, --minor o --major.`);
}

// ─── PASO 1: Prerequisitos ───────────────────────────────────────────────────
step(1, 'Verificando prerequisitos');

try { capture('gh auth token'); ok('gh CLI autenticado'); }
catch { fail('gh CLI no está autenticado. Ejecuta: gh auth login'); }

const gitDirty = capture('git status --porcelain');
if (gitDirty) {
  warn('Hay cambios sin commitear. Se incluirán en el commit de release.');
  console.log(gitDirty.split('\n').map(l => `    ${l}`).join('\n'));
}

const branch = capture('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') fail(`Estás en la rama "${branch}". Cambia a main antes de publicar.`);
ok(`Rama: ${branch}`);

// ─── PASO 2: Bump de versión ─────────────────────────────────────────────────
step(2, `Actualizando versión (${tipoArg})`);

const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const vOld = pkg.version;
const vNew = bumpVersion(vOld, tipoArg);
const tag  = `v${vNew}`;

// Verificar que la release no existe ya en GitHub CNE
try {
  capture(`gh api repos/${REPO}/releases/tags/${tag} --jq '.tag_name'`);
  fail(`La release ${tag} ya existe en ${REPO}. Elige una versión diferente.`);
} catch (e) {
  if (e.message.includes('ya existe')) throw e;
  // 404 = no existe → OK
}

pkg.version = vNew;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
ok(`Versión: ${vOld} → ${vNew}`);

// ─── PASO 3: Encriptar scripts R (opcional) ───────────────────────────────────
step(3, 'Encriptando scripts R (si hay fuentes disponibles)');

const rScriptsDir = path.join(ROOT, 'r-scripts');
const rFiles = fs.existsSync(rScriptsDir)
  ? fs.readdirSync(rScriptsDir, { withFileTypes: true })
      .filter(e => e.isFile() && (e.name.endsWith('.R') || e.name.endsWith('.r') || e.name.endsWith('.csv')))
  : [];

if (rFiles.length > 0) {
  run('npm run security:encrypt');
  ok(`${rFiles.length} scripts encriptados`);
} else {
  warn('No hay scripts .R fuente — se usarán los .enc existentes.');
}

// ─── PASO 4: Build CNE ────────────────────────────────────────────────────────
step(4, 'Construyendo instalador Windows CNE');

run([
  'npx vite build --mode cne &&',
  'npx electron-builder --win',
  `--config.nsis.artifactName="Verificador-CNE-Setup-${vNew}.exe"`,
  '--config.productName="Verificador Electoral CNE"',
  '--config.appId="com.verificador.electoral.cne"',
  '--config.nsis.shortcutName="Verificador Electoral CNE"',
  `--config.extraResources=[{"from":"r-portable","to":"r-portable","filter":["**/*"]},{"from":"r-scripts","to":"r-scripts","filter":["**/*.enc"]},{"from":"drive-config.json","to":"drive-config.json"}]`,
  '--config.nsis.include="build/installer-cne.nsh"',
  `--config.publish.repo="VerificadorElectoralCNE"`,
].join(' '));

// ─── PASO 5: Verificar artefactos ────────────────────────────────────────────
step(5, 'Verificando artefactos generados');

const distDir  = path.join(ROOT, 'dist-electron');
const exeName  = `Verificador-CNE-Setup-${vNew}.exe`;
const exePath  = path.join(distDir, exeName);
const bmapPath = exePath + '.blockmap';

if (!fs.existsSync(exePath))  fail(`No se encontró el .exe: ${exePath}`);
if (!fs.existsSync(bmapPath)) fail(`No se encontró el .blockmap: ${bmapPath}`);

const exeSizeMB = (fs.statSync(exePath).size / 1024 / 1024).toFixed(1);
ok(`${exeName} (${exeSizeMB} MB)`);
ok(`${exeName}.blockmap`);

// Verificar app-update.yml apunta al repo correcto
const appUpdatePath = path.join(distDir, 'win-unpacked', 'resources', 'app-update.yml');
if (fs.existsSync(appUpdatePath)) {
  const appUpdate = fs.readFileSync(appUpdatePath, 'utf8');
  if (!appUpdate.includes('VerificadorElectoralCNE')) {
    fail('app-update.yml no apunta a VerificadorElectoralCNE');
  }
  ok('app-update.yml → VerificadorElectoralCNE ✓');
}

// ─── PASO 6: Generar latest.yml ──────────────────────────────────────────────
step(6, 'Generando latest.yml con SHA512 correcto');

const sha512    = sha512b64(exePath);
const exeSize   = fs.statSync(exePath).size;
const releaseTs = new Date().toISOString();

const latestYml = [
  `version: ${vNew}`,
  `files:`,
  `  - url: ${exeName}`,
  `    sha512: ${sha512}`,
  `    size: ${exeSize}`,
  `path: ${exeName}`,
  `sha512: ${sha512}`,
  `releaseDate: '${releaseTs}'`,
  ''
].join('\n');

const latestYmlPath = path.join(distDir, 'latest.yml');
fs.writeFileSync(latestYmlPath, latestYml);
ok(`SHA512: ${sha512.substring(0, 28)}...`);
ok(`Tamaño: ${exeSize} bytes`);
ok(`Fecha:  ${releaseTs}`);

const sha512Check = sha512b64(exePath);
if (sha512Check !== sha512) fail('SHA512 inconsistente — no se puede publicar con datos incorrectos.');
ok('SHA512 verificado (doble cálculo consistente)');

// ─── PASO 7: Git commit + push ────────────────────────────────────────────────
step(7, 'Commiteando y haciendo push a GitHub');

run('git add -u');
run('git add package.json');
run(`git commit -m "v${vNew}: Release"`);
run('git push origin main');
ok(`Commit v${vNew} pusheado a origin/main`);

// ─── PASO 8: Crear release en GitHub CNE ─────────────────────────────────────
step(8, `Creando release ${tag} en ${REPO}`);

const releaseNotes = `## Verificador Electoral CNE ${tag}\n\nRelease ${new Date().toLocaleDateString('es-CO')}.\n`;

run([
  `gh release create ${tag}`,
  `"${exePath}"`,
  `"${bmapPath}"`,
  `"${latestYmlPath}"`,
  `--repo ${REPO}`,
  `--title "${tag}"`,
  `--notes "${releaseNotes.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
].join(' '));

ok(`Release ${tag} creada en ${REPO}`);

// ─── PASO 9: Verificar assets en GitHub ──────────────────────────────────────
step(9, 'Verificando assets publicados en GitHub');

execSync('sleep 5');

const ghToken   = capture('gh auth token');
const releaseInfo = capture(
  `curl -sf -H "Authorization: token ${ghToken}" "https://api.github.com/repos/${REPO}/releases/tags/${tag}"`
);
const releaseJson = JSON.parse(releaseInfo);
const assets      = releaseJson.assets || [];
const assetMap    = Object.fromEntries(assets.map(a => [a.name, a.size]));

if (!assetMap[exeName]) fail(`Asset no encontrado en GitHub: ${exeName}`);
if (assetMap[exeName] !== exeSize) fail(`Tamaño incorrecto para ${exeName}: GitHub=${assetMap[exeName]} vs local=${exeSize}`);
ok(`${exeName} (${assetMap[exeName]} bytes) ✓`);

if (!assetMap[exeName + '.blockmap']) fail(`Asset no encontrado: ${exeName}.blockmap`);
ok(`${exeName}.blockmap ✓`);

if (!assetMap['latest.yml']) fail('latest.yml no encontrado en la release');
ok(`latest.yml (${assetMap['latest.yml']} bytes) ✓`);

// ─── PASO 10: Verificar latest.yml descargable ───────────────────────────────
step(10, 'Verificando latest.yml descargable desde GitHub');

try {
  const latestUrl = `https://github.com/${REPO}/releases/download/${tag}/latest.yml`;
  const contenido = capture(`curl -fsSL "${latestUrl}"`);
  if (!contenido.includes(`version: ${vNew}`)) fail(`latest.yml en GitHub NO contiene "version: ${vNew}"`);
  if (!contenido.includes(sha512.substring(0, 20))) fail('latest.yml en GitHub tiene SHA512 diferente al calculado');
  ok(`latest.yml accesible y contiene versión ${vNew} correcta`);
} catch (e) {
  if (e.message.includes('NO contiene') || e.message.includes('SHA512')) throw e;
  warn('No se pudo verificar latest.yml (puede tardar unos segundos en estar disponible)');
}

// ─── FIN ─────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════╗');
console.log(`║  ✅ CNE v${vNew} publicada correctamente      `);
console.log('╚══════════════════════════════════════════════╝');
console.log(`
  Release:  https://github.com/${REPO}/releases/tag/${tag}
  .exe:     ${exeName} (${exeSizeMB} MB)
  SHA512:   ${sha512.substring(0, 44)}...

  Las apps en v${vOld} recibirán la notificación en ~3 segundos al abrir.
`);