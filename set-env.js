const fs = require('fs');
const path = require('path');

// Directorio donde se guardarán los archivos
const envDir = path.join(__dirname, 'src/environments');

// Si no existe la carpeta, la creamos
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// El contenido del archivo que usará Vercel
// Vercel buscará estas variables en sus "Environment Variables"
const envConfigFile = `
export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}'
  }
};
`;

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envConfigFile);
fs.writeFileSync(path.join(envDir, 'environment.ts'), envConfigFile);

console.log('✅ Archivos de entorno generados correctamente.');