// Script para generar hash de contraseñas
// Uso: node generate-password-hash.js "miNuevaPassword"

import bcrypt from 'bcryptjs';

if (process.argv.length < 3) {
    console.log('❌ Uso: node generate-password-hash.js "contraseña"');
    console.log('📝 Ejemplo: node generate-password-hash.js "admin123"');
    process.exit(1);
}

const password = process.argv[2];
const saltRounds = 12;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('🔐 Generador de Hash de Contraseñas');
console.log('==================================');
console.log(`🔑 Hash bcrypt: ${hash}`);
console.log('');
console.log('💡 Para actualizar en la base de datos, usa:');
console.log(`npx wrangler d1 execute expense-app-db --remote --command="UPDATE users SET password_hash = '${hash}' WHERE email = 'usuario@email.com';"`);