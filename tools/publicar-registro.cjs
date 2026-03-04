/**
 * publicar-registro.cjs - Sign and publish registry.json + key_fragment to GitHub Pages
 *
 * Usage: node tools/publicar-registro.cjs [--push]
 *
 * 1. Reads registry.json (with metadata) from electron/security/
 * 2. Reads usb_key.bin + github_key.bin → derives key via HKDF
 * 3. Signs registry with HMAC-SHA256
 * 4. Copies signed registry.json + key_fragment.bin to verificador-registro clone
 * 5. With --push: git add && git commit && git push
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { deriveKey } = require('../electron/security/encryption.cjs');

const PROJECT_ROOT = path.join(__dirname, '..');
const REGISTRY_SRC = path.join(PROJECT_ROOT, 'electron', 'security', 'registry.json');
const USB_KEY_PATH = path.join(PROJECT_ROOT, 'usb_key.bin');
const GITHUB_KEY_PATH = path.join(PROJECT_ROOT, 'github_key.bin');

// The verificador-registro repo should be cloned alongside the main project
const REGISTRO_REPO = path.join(PROJECT_ROOT, '..', 'verificador-registro');

function main() {
  console.log('=== PUBLICAR REGISTRO DE USBs ===\n');

  const doPush = process.argv.includes('--push');

  // Read key fragments
  if (!fs.existsSync(USB_KEY_PATH) || !fs.existsSync(GITHUB_KEY_PATH)) {
    console.error('No se encontraron usb_key.bin y/o github_key.bin.');
    console.error('Ejecute primero: node tools/generar-llaves.cjs');
    process.exit(1);
  }

  const usbKey = fs.readFileSync(USB_KEY_PATH);
  const githubKey = fs.readFileSync(GITHUB_KEY_PATH);

  if (usbKey.length !== 16 || githubKey.length !== 16) {
    console.error('Fragmentos de llave tienen tamano incorrecto.');
    process.exit(1);
  }

  // Derive full key
  const fullKey = Buffer.from(deriveKey(usbKey, githubKey));

  // Read registry
  if (!fs.existsSync(REGISTRY_SRC)) {
    console.error(`No se encontro registry.json en: ${REGISTRY_SRC}`);
    console.error('Ejecute primero: npm run security:register');
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_SRC, 'utf8'));

  // Remove old signature, sign fresh
  delete registry.signature;
  const payload = JSON.stringify(registry);
  const signature = crypto.createHmac('sha256', fullKey).update(payload).digest('hex');
  registry.signature = signature;

  console.log(`Registro firmado (HMAC-SHA256)`);
  console.log(`  Entradas: ${registry.autorizados ? registry.autorizados.length : 0}`);
  console.log(`  Firma: ${signature.substring(0, 16)}...`);

  // Check if verificador-registro repo exists
  if (!fs.existsSync(REGISTRO_REPO)) {
    console.error(`\nNo se encontro el repo verificador-registro en: ${REGISTRO_REPO}`);
    console.error('Clone el repo primero:');
    console.error(`  cd ${path.dirname(REGISTRO_REPO)}`);
    console.error('  git clone git@github.com:auth-co/verificador-registro.git');
    process.exit(1);
  }

  // Copy files to registro repo
  const registryDest = path.join(REGISTRO_REPO, 'registry.json');
  const keyFragmentDest = path.join(REGISTRO_REPO, 'key_fragment.bin');

  fs.writeFileSync(registryDest, JSON.stringify(registry, null, 2) + '\n');
  fs.copyFileSync(GITHUB_KEY_PATH, keyFragmentDest);

  console.log(`\nArchivos copiados a ${REGISTRO_REPO}:`);
  console.log('  registry.json (firmado)');
  console.log('  key_fragment.bin (16 bytes)');

  // Create index.html if it doesn't exist
  const indexPath = path.join(REGISTRO_REPO, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificador Electoral - Registro</title>
  <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;color:#333}h1{color:#40376d}</style>
</head>
<body>
  <h1>Verificador Electoral</h1>
  <p>Servidor de registro de llaves USB.</p>
  <p>Ultima actualizacion: <span id="ts">...</span></p>
  <script>
    fetch('registry.json').then(r=>r.json()).then(d=>{
      document.getElementById('ts').textContent=d.updated||'N/A';
    }).catch(()=>{document.getElementById('ts').textContent='Error'});
  </script>
</body>
</html>`;
    fs.writeFileSync(indexPath, indexHtml);
    console.log('  index.html (creado)');
  }

  if (doPush) {
    console.log('\nPublicando a GitHub Pages...');
    try {
      execSync('git add -A', { cwd: REGISTRO_REPO, encoding: 'utf8' });
      execSync(`git commit -m "Update registry: ${new Date().toISOString()}"`, {
        cwd: REGISTRO_REPO,
        encoding: 'utf8'
      });
      execSync('git push', { cwd: REGISTRO_REPO, encoding: 'utf8', timeout: 30000 });
      console.log('Publicado exitosamente en GitHub Pages.');
      console.log('URL: https://auth-co.github.io/verificador-registro/');
    } catch (err) {
      console.error('Error publicando:', err.message);
      console.error('Publique manualmente: cd verificador-registro && git add -A && git commit -m "update" && git push');
      process.exit(1);
    }
  } else {
    console.log('\nPara publicar en GitHub Pages:');
    console.log(`  cd ${REGISTRO_REPO}`);
    console.log('  git add -A && git commit -m "update registry" && git push');
    console.log('\nO ejecute: node tools/publicar-registro.cjs --push');
  }
}

main();
