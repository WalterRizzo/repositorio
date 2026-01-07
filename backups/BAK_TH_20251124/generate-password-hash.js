// Script para generar hash de contraseñas
// Uso: node generate-password-hash.js "miNuevaPassword"

import crypto from 'crypto';

if (process.argv.length < 3) {
    console.log('❌ Uso: node generate-password-hash.js "contraseña"');
    console.log('📝 Ejemplo: node generate-password-hash.js "admin123"');
    process.exit(1);
}

const password = process.argv[2];
const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('🔐 Generador de Hash de Contraseñas');
console.log('==================================');
console.log(`📝 Contraseña: ${password}`);
console.log(`🔑 Hash SHA256: ${hash}`);
console.log('');
console.log('💡 Para actualizar en la base de datos, usa:');
console.log(`npx wrangler d1 execute expense-app-db --remote --command="UPDATE users SET password_hash = '${hash}' WHERE email = 'usuario@email.com';"`);