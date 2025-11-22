"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { ClientForm } from "@/components/forms/ClientForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBackend } from "@/hooks/use-backend-context";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: any) => void;
  initialRut?: string;
}

export function ClientModal({
  isOpen,
  onClose,
  onClientCreated,
  initialRut = "",
}: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const backend = useBackend();

  const handleSubmit = async (data: {
    rut: string;
    name: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);

      const response = await backend.clients.crear(data);

      if (!response.success) {
        throw new Error(response.message || "Error al crear el cliente");
      }

      toast.success("Cliente creado exitosamente");
      onClientCreated(response.data);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Crear un nuevo cliente para continuar con el agendamiento
          </DialogDescription>
        </DialogHeader>

        <ClientForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          disabled={loading}
          submitText={loading ? "Creando..." : "Crear Cliente"}
          defaultValues={{ rut: initialRut }}
        />
      </DialogContent>
    </Dialog>
  );
}
