// meta-notifier/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
Deno.serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  try {
    // 1) Lee configuración de todas las organizaciones activas
    const { data: organizaciones, error: organizacionesErr } = await supabase
      .from("organization_config")
      .select("organization_id, active, phone_number_id, wsp_token, api_url_list, api_key_agenda")
      .eq("active", true)
      .not("phone_number_id", "is", null)
      .not("wsp_token", "is", null);
    if (organizacionesErr) {
      console.error("❌ Error en la consulta a 'organization_config':", organizacionesErr.message || organizacionesErr);
      return new Response(JSON.stringify({
        error: "Error al consultar configuración de las organizaciones"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (!organizaciones || organizaciones.length === 0) {
      console.log("ℹ️ No se encontraron organizaciones activas con configuración de WhatsApp");
      return new Response(JSON.stringify({
        message: "No hay organizaciones activas"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const resultadosTotales = [];
    for (const orgConfig of organizaciones){
      const organization_id = orgConfig.organization_id;
      const PHONE_NUMBER_ID = orgConfig.phone_number_id;
      const WHATSAPP_TOKEN = orgConfig.wsp_token;
      const logOrg = {
        organizacion: organization_id,
        fechaHoy: new Date().toISOString().slice(0, 10),
        appointments_consultadas: 0,
        appointments_omitidas_estado: [],
        appointments_omitidas_sin_telefono: [],
        appointments_recordatorios_enviados: [],
        appointments_conversaciones_creadas: [],
        appointments_enviadas: [],
        appointments_con_error_envio: []
      };
      // Calcular fechas: hoy y mañana
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatDate = (date)=>{
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const startDate = formatDate(today);
      const endDate = formatDate(tomorrow);
      console.log(`📅 Procesando org ${organization_id} - Rango: ${startDate} → ${endDate}`);
      
      // 2) Consultar appointments directamente desde la BD
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointment")
        .select(`
          id,
          client_id,
          start_hour,
          end_hour,
          status,
          observation,
          organization_id,
          created_by_id,
          created_at,
          updated_at,
          client:client_id (
            rut,
            name,
            email,
            phone
          ),
          organization:organization_id (
            name
          ),
          created_by:created_by_id (
            name,
            email
          )
        `)
        .eq("organization_id", organization_id)
        .gte("start_hour", startDateTime.toISOString())
        .lte("end_hour", endDateTime.toISOString())
        .order("start_hour", { ascending: true });
      
      if (appointmentsError) {
        console.error(`❌ Error consultando appointments para org ${organization_id}:`, appointmentsError);
        resultadosTotales.push({
          organizacion: organization_id,
          error: appointmentsError.message,
          log: logOrg
        });
        continue;
      }
      
      if (!appointments || appointments.length === 0) {
        console.log(`ℹ️ No se encontraron appointments para org ${organization_id} en el rango ${startDate} - ${endDate}`);
        resultadosTotales.push({
          organizacion: organization_id,
          resultados: [],
          log: logOrg
        });
        continue;
      }
      
      logOrg.appointments_consultadas = appointments.length;
      console.log(`📋 Encontradas ${appointments.length} appointments para org ${organization_id}`);
      // Función para normalizar número de teléfono (formato chileno)
      const normalizePhone = (rawTel)=>{
        if (!rawTel) return null;
        let digits = rawTel.trim().replace(/\D/g, ""); // solo números
        if (!digits) return null;
        // Elimina ceros iniciales
        digits = digits.replace(/^0+/, "");
        // Si ya empieza con 569 y tiene 11 dígitos → está OK
        if (digits.length === 11 && digits.startsWith("569")) {
          return digits;
        }
        // Si tiene 9 dígitos y empieza con 9 → agregar 56
        if (digits.length === 9 && digits.startsWith("9")) {
          return "56" + digits;
        }
        // Si empieza con 56 y tiene más de 11 → truncar
        if (digits.startsWith("56") && digits.length > 11) {
          return digits.slice(0, 11);
        }
        // Si empieza con 56 pero tiene menos de 11 → inválido
        if (digits.startsWith("56") && digits.length < 11) {
          return null;
        }
        // Si tiene más de 9 dígitos, tomar últimos 9 y agregar 56
        if (digits.length > 9) {
          return "56" + digits.slice(-9);
        }
        return null;
      };
      // Función para formatear fecha de appointment
      const formatAppointmentDate = (dateStr)=>{
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      // Función para formatear hora
      const formatAppointmentTime = (dateStr)=>{
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };
      // Procesar cada appointment
      const resultados = await Promise.all(appointments.map(async (appointment: any)=>{
        try {
          // Omitir appointments cancelados o completados (según schema: cancelled, completed)
          if (appointment.status === "cancelled" || appointment.status === "completed") {
            logOrg.appointments_omitidas_estado.push(appointment.id);
            return {
              appointmentId: appointment.id,
              status: "omitido_estado"
            };
          }
          // Normalizar teléfono
          const clientPhone = appointment.client?.phone || null;
          const normalizedPhone = normalizePhone(clientPhone);
          if (!normalizedPhone) {
            logOrg.appointments_omitidas_sin_telefono.push(appointment.id);
            return {
              appointmentId: appointment.id,
              status: "omitido_sin_telefono"
            };
          }
          // No existe conversación, crear nueva y enviar mensaje inicial
          const fechaAppointment = formatAppointmentDate(appointment.start_hour);
          const horaAppointment = formatAppointmentTime(appointment.start_hour);
          const clientName = appointment.client?.name || "Cliente";
          // Construir mensaje (por ahora texto simple, luego se puede usar template)
          const messageText = `Hola ${clientName}, tienes una cita agendada para el ${fechaAppointment} a las ${horaAppointment}. Por favor confirma tu asistencia.`;
          // Preparar payload para WhatsApp template con botones
          const payload = {
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "template",
            template: {
              name: "confirmar_citas_prod",
              language: {
                code: "es"
              },
              components: [
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: clientName
                    },
                    {
                      type: "text",
                      text: fechaAppointment
                    },
                    {
                      type: "text",
                      text: horaAppointment
                    }
                  ]
                },
                {
                  type: "button",
                  sub_type: "quick_reply",
                  index: "0",
                  parameters: [
                    {
                      type: "payload",
                      payload: `CONFIRM:${appointment.id}`
                    }
                  ]
                },
                {
                  type: "button",
                  sub_type: "quick_reply",
                  index: "1",
                  parameters: [
                    {
                      type: "payload",
                      payload: `CANCEL:${appointment.id}`
                    }
                  ]
                }
              ]
            }
          };
          console.log(`📤 Enviando mensaje a ${normalizedPhone} para appointment ${appointment.id}`);
          const resp = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          if (!resp.ok) {
            const errTxt = await resp.text();
            console.error(`❌ Error enviando mensaje para appointment ${appointment.id}:`, errTxt);
            logOrg.appointments_con_error_envio.push({
              appointmentId: appointment.id,
              error: errTxt
            });
            return {
              appointmentId: appointment.id,
              status: "error_envio",
              error: errTxt
            };
          }
          const { messages } = await resp.json();
          const sentMsgId = messages?.[0]?.id ?? null;
          console.log(`✅ Mensaje enviado - Message ID: ${sentMsgId}`);
          // Crear conversación
          const { data: conv, error: convErr } = await supabase.from("conversation").insert([
            {
              organization_id: organization_id,
              appointment_id: appointment.id,
              phone_number: normalizedPhone,
              status: "pendiente"
            }
          ]).select("id").maybeSingle();
          if (convErr || !conv) {
            console.error(`❌ Error creando conversación para appointment ${appointment.id}:`, convErr);
            return {
              appointmentId: appointment.id,
              status: "error_guardar_conv"
            };
          }
          logOrg.appointments_conversaciones_creadas.push(appointment.id);
          logOrg.appointments_enviadas.push({
            appointmentId: appointment.id,
            messageId: sentMsgId
          });
          // Guardar mensaje
          const { error: msgErr } = await supabase.from("wsp_message").insert([
            {
              conversation_id: conv.id,
              wsp_message_id: sentMsgId,
              sender: "system",
              content: messageText,
              status: "enviado"
            }
          ]);
          if (msgErr) {
            console.error(`❌ Error guardando mensaje:`, msgErr);
          }
          return {
            appointmentId: appointment.id,
            status: "enviado",
            messageId: sentMsgId
          };
        } catch (err) {
          console.error(`❌ Error procesando appointment ${appointment.id}:`, err);
          logOrg.appointments_con_error_envio.push({
            appointmentId: appointment.id,
            error: err instanceof Error ? err.message : "Unknown error"
          });
          return {
            appointmentId: appointment.id,
            status: "error",
            error: err instanceof Error ? err.message : "Unknown error"
          };
        }
      }));
      console.log(`✅ Resultados para org ${organization_id}:`, JSON.stringify(resultados, null, 2));
      console.log(`📘 Log organización:`, JSON.stringify(logOrg, null, 2));
      resultadosTotales.push({
        organizacion: organization_id,
        resultados,
        log: logOrg
      });
    }
    // Respuesta final
    console.log("📊 Resultados totales por organización:", JSON.stringify(resultadosTotales, null, 2));
    return new Response(JSON.stringify({
      resultadosTotales
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("❌ Handler error:", err);
    return new Response(JSON.stringify({
      error: "Internal error",
      message: err instanceof Error ? err.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
