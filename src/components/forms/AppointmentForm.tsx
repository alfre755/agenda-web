"use client";

import { useCallback,useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AppButton } from "@/components/AppButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/use-backend-context";
import { useZodForm } from "@/hooks/use-zod-form";
import { formatRut } from "@/lib/utils";

const schema = z.object({
  clientRut: z
    .string()
    .min(1, "El RUT del cliente es requerido")
    .refine((rut) => {
      const formattedRut = formatRut(rut);
      return formattedRut !== null;
    }, "RUT inválido. Ingrese un RUT válido (ej: 12.345.678-9)"),
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  observation: z.string().optional(),
  status: z.enum(["in-progress", "completed", "cancelled"]),
});

type Schema = z.infer<typeof schema>;

export function AppointmentForm({
  defaultValues,
  onSubmit,
  onClientNotFound,
  onClientCreated,
  disabled,
  submitText = "Crear Cita",
}: {
  defaultValues?: Partial<Schema>;
  onSubmit?: (data: Schema) => void | Promise<void>;
  onClientNotFound?: (rut: string) => void;
  onClientCreated?: (client: any) => void;
  disabled?: boolean;
  submitText?: string;
}) {
  const backend = useBackend();
  const lastCheckedRut = useRef<string>("");
  
  // Resetear la referencia cuando el componente se monta o cuando cambian los valores por defecto
  useEffect(() => {
    lastCheckedRut.current = "";
  }, [defaultValues]);
  
  const form = useZodForm({
    schema,
    defaultValues: {
      clientRut: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      observation: "",
      status: "in-progress" as const,
      ...defaultValues,
    },
  });

  // Función para actualizar el formulario con datos del cliente
  const updateFormWithClientData = useCallback((client: any) => {
    form.setValue("clientName", client.name);
    form.setValue("clientEmail", client.email || "");
    form.setValue("clientPhone", client.phone || "");
  }, [form]);


  const checkClientDirectly = useCallback(async (rut: string) => {
    try {
      // Validación adicional: verificar que el RUT sea matemáticamente válido
      const validatedRut = formatRut(rut);
      if (!validatedRut) {
        toast.error("RUT no es matemáticamente válido");
        return;
      }

      // Hacer request directo para obtener respuesta más específica
      const response = await fetch(
        `/api/clients?rut=${encodeURIComponent(validatedRut)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success && result.exists && result.data) {
        // Cliente encontrado, llenar los campos automáticamente
        // Siempre actualizar los campos cuando se encuentra un cliente diferente
        form.setValue("clientName", result.data.name);
        form.setValue("clientEmail", result.data.email || "");
        form.setValue("clientPhone", result.data.phone || "");
        
        // Forzar la actualización del formulario
        form.trigger();

        toast.success(
          "Cliente encontrado. Formulario actualizado automáticamente."
        );
      } else if (result.success && !result.exists) {
        // Cliente no encontrado, mostrar modal para crearlo
        toast.info(
          "Cliente no encontrado. Se abrirá el formulario para crear uno nuevo."
        );
        if (onClientNotFound) {
          onClientNotFound(validatedRut);
        }
      }
    } catch (error) {
      toast.error("Error al verificar el cliente. Intente nuevamente.");
    }
  }, [form, onClientNotFound]);

  // Verificar cliente cuando el RUT esté completo y válido
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "clientRut" && value.clientRut) {
        const formattedRut = formatRut(value.clientRut);

        // Solo procesar si tenemos un RUT formateado válido (mínimo 9 caracteres para RUTs cortos)
        if (formattedRut && formattedRut.length >= 9) {
          // Verificar que el RUT sea matemáticamente válido antes de hacer la consulta
          const isValidRut = formatRut(formattedRut);
          if (isValidRut) {
            // Solo hacer la búsqueda si el RUT es diferente al último verificado
            if (formattedRut !== lastCheckedRut.current) {
              lastCheckedRut.current = formattedRut;
              checkClientDirectly(formattedRut);
            }
          } else {
            // Solo resetear si el RUT es matemáticamente inválido (no por ser null)
            if (lastCheckedRut.current !== "") {
              lastCheckedRut.current = "";
              toast.error("RUT inválido. Verifique el dígito verificador.");
            }
          }
        }
        // No resetear cuando formattedRut es null - esto es normal durante la escritura
      }
    });
    return () => subscription.unsubscribe();
  }, [form, checkClientDirectly]);

  // Escuchar cuando se crea un cliente y actualizar el formulario
  useEffect(() => {
    if (onClientCreated) {
      // Exponer la función de actualización al componente padre
      (window as any).updateFormWithClientData = updateFormWithClientData;
    }
    return () => {
      delete (window as any).updateFormWithClientData;
    };
  }, [onClientCreated, updateFormWithClientData]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit ?? (() => {}))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="clientRut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT del Cliente *</FormLabel>
              <FormControl>
                <Input
                  placeholder="12.345.678-9"
                  {...field}
                  disabled={disabled}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Formatear automáticamente mientras el usuario escribe
                    const formattedRut = formatRut(value);
                    if (formattedRut) {
                      field.onChange(formattedRut);
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Cliente *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre completo del cliente"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email del Cliente</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono del Cliente</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 234 567 8900"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales sobre la cita..."
                  className="resize-none"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AppButton
          btnType="primary"
          type="submit"
          className="w-full sm:w-auto"
          disabled={disabled}
        >
          {submitText}
        </AppButton>
      </form>
    </Form>
  );
}
