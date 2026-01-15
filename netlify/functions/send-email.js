const { Resend } = require("resend");

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  // Habilitar CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Manejar preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Parsear los datos del formulario
    const data = JSON.parse(event.body);
    const { name, email, phone, message } = data;

    // Validación básica
    if (!name || !email || !phone || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Todos los campos son obligatorios",
        }),
      };
    }

    // Inicializar Resend con la API key desde variables de entorno
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Enviar el email
    const emailData = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "tu@gmail.com",
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .field {
              margin-bottom: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-left: 4px solid #22d3ee;
              border-radius: 4px;
            }
            .label {
              font-weight: bold;
              color: #a855f7;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              word-wrap: break-word;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 Nuevo mensaje de contacto</h1>
            </div>
            
            <div class="field">
              <div class="label">👤 Nombre:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value"><a href="mailto:${email}" style="color: #22d3ee;">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">📱 Teléfono:</div>
              <div class="value"><a href="tel:${phone}" style="color: #22d3ee;">${phone}</a></div>
            </div>
            
            <div class="field">
              <div class="label">💬 Mensaje:</div>
              <div class="value">${message.replace(/\n/g, "<br>")}</div>
            </div>
            
            <div class="footer">
              <p>Este mensaje fue enviado desde tu portafolio web</p>
              <p>Fecha: ${new Date().toLocaleString("es-ES")}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Email enviado correctamente",
        id: emailData.id,
      }),
    };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al enviar el email",
        details: error.message,
      }),
    };
  }
};
