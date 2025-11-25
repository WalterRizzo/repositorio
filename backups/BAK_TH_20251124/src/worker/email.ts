// 📧 Módulo Email - Resend API (GRATIS hasta 3000 emails/mes)
// ¡NO MODIFICA NADA DEL CÓDIGO EXISTENTE!

interface EmailNotification {
  amount: number;
  category: string;
  description: string;
  date: string;
  userName: string;
  userEmail: string;
}

interface Env {
  EMAIL_ENABLED?: string;
  EMAIL_TEST_ADDRESS?: string;
  EMAIL_PROD_ADDRESS?: string;
  RESEND_API_KEY?: string;
}

export const sendEmailNotification = async (
  notification: EmailNotification, 
  env: Env
): Promise<void> => {
  // 🛡️ Verificación de seguridad - si está deshabilitado, no hace nada
  if (env.EMAIL_ENABLED !== 'true') {
    console.log('Email notifications disabled');
    return;
  }

  // 🧪 Usar email de prueba o producción
  const toEmail = env.EMAIL_TEST_ADDRESS || env.EMAIL_PROD_ADDRESS;
  const apiKey = env.RESEND_API_KEY;

  if (!toEmail || !apiKey) {
    console.log('Email: Missing address or API key');
    return;
  }

  // 📧 Email HTML personalizado
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .expense-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .amount { font-size: 2em; font-weight: bold; color: #2d3748; margin: 10px 0; }
        .detail { margin: 8px 0; }
        .label { font-weight: bold; color: #4a5568; }
        .value { color: #2d3748; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧾 Nuevo Gasto Registrado</h1>
          <p>Sistema Tharsis Gastos</p>
        </div>
        
        <div class="content">
          <div class="expense-card">
            <div class="amount">$${notification.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
            
            <div class="detail">
              <span class="label">👤 Usuario:</span> 
              <span class="value">${notification.userName}</span>
            </div>
            
            <div class="detail">
              <span class="label">📧 Email:</span> 
              <span class="value">${notification.userEmail}</span>
            </div>
            
            <div class="detail">
              <span class="label">🏷️ Categoría:</span> 
              <span class="value">${notification.category}</span>
            </div>
            
            <div class="detail">
              <span class="label">📅 Fecha:</span> 
              <span class="value">${notification.date}</span>
            </div>
            
            <div class="detail">
              <span class="label">📝 Descripción:</span> 
              <span class="value">${notification.description}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://expense-tharsis-app.tharsis-gastos-app.workers.dev" class="button">
              📊 Ver Panel de Control
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>📧 Notificación automática de Tharsis Gastos</p>
          <p>Fecha de envío: ${new Date().toLocaleString('es-AR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 📧 Texto plano como fallback
  const textContent = `
🧾 NUEVO GASTO REGISTRADO

👤 Usuario: ${notification.userName}
📧 Email: ${notification.userEmail}
💰 Monto: $${notification.amount}
🏷️ Categoría: ${notification.category}
📅 Fecha: ${notification.date}
📝 Descripción: ${notification.description}

🔗 Ver detalles: https://expense-tharsis-app.tharsis-gastos-app.workers.dev

📊 Sistema Tharsis Gastos
Enviado: ${new Date().toLocaleString('es-AR')}
  `;

  try {
    // 🚀 Resend API (3000 emails gratis/mes)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tharsis Gastos <noreply@tharsis.com>',
        to: [toEmail],
        subject: `💰 Nuevo Gasto: $${notification.amount} - ${notification.category}`,
        html: htmlContent,
        text: textContent
      })
    });

    if (response.ok) {
      const result = await response.json() as { id?: string };
      console.log(`✅ Email sent to ${toEmail}: $${notification.amount} (ID: ${result.id || 'unknown'})`);
    } else {
      const error = await response.text();
      console.log(`❌ Email failed: ${response.status} - ${error}`);
    }

  } catch (error) {
    // 🛡️ NUNCA rompe el flujo principal
    console.error('Email notification error (non-critical):', error);
  }
};

// 🔧 Función helper para testing
export const testEmailConnection = async (env: Env): Promise<boolean> => {
  try {
    await sendEmailNotification({
      amount: 999.99,
      category: 'TEST',
      description: 'Email de prueba - Sistema Tharsis funcionando correctamente',
      date: new Date().toLocaleDateString('es-AR'),
      userName: 'Sistema Test',
      userEmail: 'test@tharsis.com'
    }, env);
    return true;
  } catch (error) {
    console.error('Email test failed:', error);
    return false;
  }
};