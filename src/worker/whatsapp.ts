// 🔔 Módulo WhatsApp - CallMeBot API (GRATIS)
// ¡NO MODIFICA NADA DEL CÓDIGO EXISTENTE!

interface WhatsAppNotification {
  amount: number;
  category: string;
  description: string;
  date: string;
  userName: string;
  userEmail: string;
}

interface Env {
  WHATSAPP_ENABLED?: string;
  WHATSAPP_TEST_PHONE?: string;
  WHATSAPP_PROD_PHONE?: string;
  WHATSAPP_API_KEY?: string;
}

export const sendWhatsAppNotification = async (
  notification: WhatsAppNotification, 
  env: Env
): Promise<void> => {
  // 🛡️ Verificación de seguridad - si está deshabilitado, no hace nada
  if (env.WHATSAPP_ENABLED !== 'true') {
    console.log('WhatsApp notifications disabled');
    return;
  }

  // 🧪 Usar número de prueba o producción
  const phone = env.WHATSAPP_TEST_PHONE || env.WHATSAPP_PROD_PHONE;
  const apiKey = env.WHATSAPP_API_KEY;

  if (!phone || !apiKey) {
    console.log('WhatsApp: Missing phone or API key');
    return;
  }

  // 💬 Mensaje personalizado
  const message = `
🧾 *NUEVO GASTO REGISTRADO*

👤 Usuario: ${notification.userName}
📧 Email: ${notification.userEmail}
💰 Monto: $${notification.amount}
🏷️ Categoría: ${notification.category}
📅 Fecha: ${notification.date}
📝 Descripción: ${notification.description}

🔗 Ver detalles:
https://expense-tharsis-app.tharsis-gastos-app.workers.dev

📊 Panel Tharsis Gastos
  `;

  try {
    // 🚀 CallMeBot API (100% GRATIS)
    const cleanPhone = phone.replace(/[^\d]/g, ''); // Solo números
    const encodedMessage = encodeURIComponent(message.trim());
    
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TharsisBotExpenses/1.0'
      }
    });

    if (response.ok) {
      console.log(`✅ WhatsApp sent to ${phone}: $${notification.amount}`);
    } else {
      console.log(`❌ WhatsApp failed: ${response.status}`);
    }

  } catch (error) {
    // 🛡️ NUNCA rompe el flujo principal
    console.error('WhatsApp notification error (non-critical):', error);
  }
};

// 🔧 Función helper para testing
export const testWhatsAppConnection = async (env: Env): Promise<boolean> => {
  try {
    await sendWhatsAppNotification({
      amount: 999.99,
      category: 'TEST',
      description: 'Mensaje de prueba - Sistema Tharsis',
      date: new Date().toLocaleDateString('es-AR'),
      userName: 'Sistema Test',
      userEmail: 'test@tharsis.com'
    }, env);
    return true;
  } catch (error) {
    console.error('WhatsApp test failed:', error);
    return false;
  }
};