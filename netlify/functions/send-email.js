const { Resend } = require("resend");

exports.handler = async (event, context) => {
  // Configurar headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Manejar preflight (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    let data;

    // Detectar el tipo de contenido
    const contentType = event.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      // Si es JSON, parsear normalmente
      data = JSON.parse(event.body);
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // Si es formulario HTML tradicional, convertir a objeto
      const params = new URLSearchParams(event.body);
      data = {
        name: params.get("name"),
        email: params.get("email"),
        phone: params.get("phone"),
        message: params.get("message"),
      };
    } else {
      // Intentar parsear como JSON si no se especifica
      try {
        data = JSON.parse(event.body);
      } catch {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Formato de datos no soportado" }),
        };
      }
    }

    // Validación
    if (!data.name || !data.email || !data.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Faltan campos requeridos: nombre, email o mensaje",
        }),
      };
    }

    // SIMULACIÓN PARA PRUEBAS (comenta esto cuando tengas API key)
    console.log("📧 Datos recibidos:", data);

    // Responder con éxito SIMULADO
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Mensaje recibido correctamente (modo prueba)",
        debug: data,
      }),
    };

    /* 
    // CÓDIGO REAL CON RESEND (descomenta cuando tengas API key)
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailData = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "rolandochoqueparco099@gmail.com",
      subject: `Nuevo mensaje de ${data.name}`,
      html: `
        <h2>Nuevo contacto desde portafolio</h2>
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone || 'No proporcionado'}</p>
        <p><strong>Mensaje:</strong> ${data.message}</p>
      `,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Email enviado correctamente",
      }),
    };
    */
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
      }),
    };
  }
};
