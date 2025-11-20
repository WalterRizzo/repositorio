import { SignJWT } from 'jose'

async function gen() {
  const secret = 'your-super-secret-jwt-key-change-this-in-production'
  const payload = { id: 'mramirez', email: 'ceci-ramirez@hotmail.com', name: 'Maria Cecilia Ramirez', role: 'supervisor' }
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret))
  console.log(token)
}

gen().catch(e => { console.error(e); process.exit(1) })
