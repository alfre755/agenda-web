// meta-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req) => {
  console.log("🔄 Webhook ejecutándose...");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("🌐 Method:", req.method);
  console.log("🔗 URL:", req.url);

  // Verificación inicial del webhook (GET request)
  if (req.method === "GET") {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    console.log("📥 GET Request - Mode:", mode, "Token:", token ? "presente" : "ausente", "Challenge:", challenge);

    if (mode === "subscribe" && token) {
      const cleanToken = token.trim();
      
      // Buscar organización por verify_token_meta (necesitarías agregar este campo al schema si no existe)
      const { data: org, error: orgErr } = await supabase
        .from("organization_config")
        .select("organization_id")
        .eq("verify_token_meta", cleanToken)
        .maybeSingle();

      if (orgErr || !org) {
        console.warn("❌ Verificación fallida: token no reconocido", orgErr);
        return new Response("Forbidden", {
          status: 403,
        });
      }

      console.log("✅ Webhook verificado para organizacion:", org.organization_id);
      return new Response(challenge, {
        status: 200,
      });
    }

    return new Response("Bad Request", {
      status: 400,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const body = await req.json();
    console.log("📦 Webhook body:", JSON.stringify(body, null, 2));

    console.log("🔍 ANÁLISIS DEL PAYLOAD:");
    console.log("  - object:", body.object);
    console.log("  - entry count:", body.entry?.length || 0);

    const changes = body.entry?.[0]?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;
    const statuses = value?.statuses;
    const metadata = value?.metadata;
    const phoneId = metadata?.phone_number_id;

    if (!phoneId) {
      console.log("❌ No phone_number_id en metadata");
      return new Response("Bad Request", {
        status: 400,
      });
    }

      // Obtener configuración de la organización
      const { data: org, error: orgErr } = await supabase
        .from("organization_config")
        .select("phone_number_id, wsp_token, organization_id")
        .eq("phone_number_id", phoneId)
        .maybeSingle();

    if (orgErr || !org) {
      console.error("❌ No config encontrada para phone_number_id:", phoneId, orgErr);
      return new Response("Organization not found", {
        status: 404,
      });
    }

    const PHONE_NUMBER_ID = org.phone_number_id;
    const WHATSAPP_TOKEN = org.wsp_token;
    const ORGANIZATION_ID = org.organization_id;

    // Función para normalizar teléfono
    const normalizePhone = (phone: string) => {
      let digits = phone.replace(/\D/g, "");
      if (digits.startsWith("56")) {
        return digits;
      }
      if (digits.length === 9 && digits.startsWith("9")) {
        return "56" + digits;
      }
      return phone.startsWith("56") ? phone : `56${phone.replace(/^\+?0+/, "")}`;
    };

    if (!Array.isArray(body.entry) || !body.entry.length || !body.entry[0].changes?.[0]) {
      console.log("❌ Payload inválido: falta entry o changes");
      return new Response("Bad Request", {
        status: 400,
      });
    }

    // --- 1) Si llega un mensaje del usuario (texto libre) ---
    if (messages?.length && messages[0].type === "text") {
      const m = messages[0];
      console.log("📨 Mensaje recibido tipo text:", JSON.stringify(m, null, 2));

      const userText = (m.text?.body || "").trim();
      const from = m.from;

      // Obtener nombre del usuario desde contacts
      const getUserName = () => {
        if (contacts && contacts.length > 0 && contacts[0].profile?.name) {
          return contacts[0].profile.name;
        }
        return "Usuario";
      };

      const userName = getUserName();
      console.log("👤 Nombre del usuario:", userName);

      const telefonoNorm = normalizePhone(from);

      // Buscar conversación existente
      const { data: conv, error: convErr } = await supabase
        .from("conversation")
        .select("id, status, appointment_id")
        .eq("phone_number", telefonoNorm)
        .eq("organization_id", ORGANIZATION_ID)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (convErr) {
        console.error("❌ Error buscando conversación:", convErr);
        return new Response("Error buscando conversación", {
          status: 500,
        });
      }

      // Si existe conversación y ya fue respondida
      if (conv && conv.status !== "pendiente") {
        console.log("🚫 Conversación ya respondida, solo guardar mensaje");

        await supabase.from("wsp_message").insert({
          uuid: crypto.randomUUID(),
          conversation_id: conv.id,
          wsp_message_id: m.id,
          sender: "paciente",
          content: userText,
          status: "recibido",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Marcar como leído
        await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id: m.id,
          }),
        });

        return new Response("Mensaje guardado", {
          status: 200,
        });
      }

      // Si existe conversación pendiente, guardar mensaje y responder
      if (conv && conv.status === "pendiente") {
        console.log("💬 Conversación pendiente encontrada, guardando mensaje y respondiendo");

        // Guardar mensaje del paciente
        await supabase.from("wsp_message").insert({
          uuid: crypto.randomUUID(),
          conversation_id: conv.id,
          wsp_message_id: m.id,
          sender: "paciente",
          content: userText,
          status: "recibido",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Responder automáticamente
        const respuesta = {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: "Hola, por favor utiliza los botones del mensaje anterior para confirmar o cancelar tu cita. Si necesitas ayuda adicional, contáctanos directamente. 📱",
          },
        };

        const replyRes = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(respuesta),
        });

        if (replyRes.ok) {
          const { messages } = await replyRes.json();
          await supabase.from("wsp_message").insert({
            uuid: crypto.randomUUID(),
            conversation_id: conv.id,
            wsp_message_id: messages?.[0]?.id ?? null,
            sender: "system",
            content: respuesta.text.body,
            status: "enviado_automatico",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Marcar como leído
        await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id: m.id,
          }),
        });

        return new Response("Texto procesado", {
          status: 200,
        });
      }

      // Si no existe conversación, crear nueva y enviar template de reabrir
      if (!conv) {
        console.log("🆕 No existe conversación, creando nueva");

        // Crear nueva conversación (sin appointment_id por ahora)
        const now = new Date().toISOString();
        const { data: newConv, error: newConvErr } = await supabase
          .from("conversation")
          .insert({
            uuid: crypto.randomUUID(),
            organization_id: ORGANIZATION_ID,
            phone_number: telefonoNorm,
            status: "pendiente",
            created_at: now,
            updated_at: now,
          })
          .select("id")
          .single();

        if (newConvErr || !newConv) {
          console.error("❌ Error creando conversación:", newConvErr);
          return new Response("Error creando conversación", {
            status: 500,
          });
        }

        // Enviar template de reabrir conversación
        const templatePayload = {
          messaging_product: "whatsapp",
          to: from,
          type: "template",
          template: {
            name: "reabrir_conversacion",
            language: {
              code: "es",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: PHONE_NUMBER_ID, // o el número de contacto configurado
                  },
                ],
              },
            ],
          },
        };

        const templateRes = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templatePayload),
        });

        if (templateRes.ok) {
          const { messages } = await templateRes.json();
          
          // Guardar mensaje de plantilla
          await supabase.from("wsp_message").insert({
            uuid: crypto.randomUUID(),
            conversation_id: newConv.id,
            wsp_message_id: messages?.[0]?.id ?? null,
            sender: "system",
            content: "Hemos recibido tu mensaje correctamente. En breve, uno de nuestros colaboradores te responderá.",
            status: "enviado",
            created_at: now,
            updated_at: now,
          });

          // Guardar mensaje del paciente
          await supabase.from("wsp_message").insert({
            uuid: crypto.randomUUID(),
            conversation_id: newConv.id,
            wsp_message_id: m.id,
            sender: "paciente",
            content: userText,
            status: "recibido",
            created_at: now,
            updated_at: now,
          });
        }

        return new Response("Nueva conversación creada", {
          status: 200,
        });
      }

      return new Response("OK", {
        status: 200,
      });
    }

    // --- 2) Si llega un quick-reply (botón) ---
    if (messages?.length && messages[0].type === "button") {
      const m = messages[0];
      console.log("🔘 Botón recibido:", JSON.stringify(m, null, 2));

      const [action, rawPk] = (m.button?.payload || "").split(":");
      const pk = parseInt(rawPk, 10);
      const estado = action === "CONFIRM" ? "confirmada" : action === "CANCEL" ? "cancelada" : null;

      if (!estado || isNaN(pk)) {
        return new Response("No action", {
          status: 200,
        });
      }

      const from = m.from;
      const telefonoNorm = normalizePhone(from);

      // Buscar conversación
      const { data: conv, error: convErr } = await supabase
        .from("conversation")
        .select("id, status, appointment_id")
        .eq("phone_number", telefonoNorm)
        .eq("organization_id", ORGANIZATION_ID)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (convErr) {
        console.error("❌ Error buscando conversación:", convErr);
        return new Response("Error buscando conversación", {
          status: 500,
        });
      }

      if (!conv) {
        return new Response("No conversation", {
          status: 200,
        });
      }

      // Si ya fue respondida
      if (conv.status !== "pendiente") {
        console.log("🚫 Conversación ya respondida");

        const warnRes = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
              body: "🚫 Ya has realizado una acción previamente. Si necesitas modificar algo, por favor contáctanos directamente.",
            },
          }),
        });

        return new Response("Botón duplicado ignorado", {
          status: 200,
        });
      }

      // Actualizar appointment si existe
      if (conv.appointment_id) {
        const newStatus = estado === "confirmada" ? "scheduled" : "cancelled";
        const { error: appointmentUpdateErr } = await supabase
          .from("appointment")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conv.appointment_id);

        if (appointmentUpdateErr) {
          console.error(`❌ Error actualizando appointment ${conv.appointment_id}:`, appointmentUpdateErr);
        } else {
          console.log(`✅ Appointment ${conv.appointment_id} actualizado a ${newStatus}`);
        }
      }

      // Actualizar conversación
      await supabase
        .from("conversation")
        .update({
          status: estado,
        })
        .eq("id", conv.id);

      // Guardar mensaje del botón
      await supabase.from("wsp_message").insert({
        uuid: crypto.randomUUID(),
        conversation_id: conv.id,
        wsp_message_id: m.id,
        sender: "paciente",
        content: m.button?.text || action,
        status: "recibido",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Responder confirmación
      const responseText =
        estado === "confirmada"
          ? "✅ Tu cita ha sido confirmada con éxito. Te esperamos en la fecha y hora acordada."
          : "❌ Tu cita ha sido cancelada con éxito. Si necesitas reprogramar, contáctanos directamente.";

      const replyRes = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: responseText,
          },
        }),
      });

      if (replyRes.ok) {
        const { messages } = await replyRes.json();
        await supabase.from("wsp_message").insert({
          uuid: crypto.randomUUID(),
          conversation_id: conv.id,
          wsp_message_id: messages?.[0]?.id ?? null,
          sender: "system",
          content: responseText,
          status: "enviado_automatico",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Marcar como leído
      await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: m.id,
        }),
      });

      return new Response("Botón procesado", {
        status: 200,
      });
    }

    // --- 3) Procesar statuses (entregado, leído, fallido) ---
    if (statuses?.length) {
      for (const status of statuses) {
        if (status.status === "failed" && status.errors?.length) {
          for (const error of status.errors) {
            console.log(`[WHATSAPP ERROR] Número: ${status.recipient_id}`);
            console.log(`  Código: ${error.code}`);
            console.log(`  Título: ${error.title}`);
            console.log(`  Mensaje: ${error.message}`);

            // Buscar conversación asociada
            const telefonoNorm = normalizePhone(status.recipient_id);
            const { data: conv } = await supabase
              .from("conversation")
              .select("id")
              .eq("phone_number", telefonoNorm)
              .eq("organization_id", ORGANIZATION_ID)
              .order("created_at", {
                ascending: false,
              })
              .limit(1)
              .maybeSingle();

            if (conv) {
              await supabase.from("wsp_message").insert({
                conversation_id: conv.id,
                wsp_message_id: status.id,
                sender: "system",
                content: error.message || "Error desconocido",
                status: "recibido", // o un status específico para errores
              });
            }
          }
        } else {
          console.log(`ℹ️ Status update para número ${status.recipient_id}: ${status.status}`);
        }
      }

      return new Response("Status update processed", {
        status: 200,
      });
    }

    return new Response("OK", {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
});

