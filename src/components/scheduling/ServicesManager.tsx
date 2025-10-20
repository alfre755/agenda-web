"use client";
import { ClockIcon, DollarSignIcon,EditIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScheduling } from "@/hooks/use-scheduling";

interface ServicesManagerProps {
  organizationId: string;
}

export function ServicesManager({ organizationId }: ServicesManagerProps) {
  const { services, loadServices, saveService, loading } = useScheduling();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60, // 1 hora por defecto
    price: 0,
    color: "#3b82f6",
  });

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price || 0,
        color: service.color,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        color: "#3b82f6",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      color: "#3b82f6",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("El nombre del servicio es obligatorio");
      return;
    }

    if (formData.duration <= 0) {
      toast.error("La duración debe ser mayor a 0");
      return;
    }

    try {
      const serviceData = {
        ...formData,
        price: formData.price * 100, // Convertir a centavos
      };

      if (editingService) {
        await saveService(organizationId, { ...serviceData, id: editingService.id });
        toast.success("Servicio actualizado correctamente");
      } else {
        await saveService(organizationId, serviceData);
        toast.success("Servicio creado correctamente");
      }

      handleCloseDialog();
    } catch (error) {
      toast.error("Error al guardar el servicio");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return "Gratis";
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Servicios</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? "Modifique la información del servicio seleccionado" 
                    : "Complete la información para crear un nuevo servicio"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del servicio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Consulta médica"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del servicio"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Duración (minutos) *
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-1">
                      <DollarSignIcon className="h-4 w-4" />
                      Precio ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingService ? "Actualizar" : "Crear"} Servicio
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="p-4">Cargando servicios...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay servicios configurados</p>
            <p className="text-sm">Agrega tu primer servicio para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {formatDuration(service.duration)}
                  </Badge>
                  
                  {service.price && service.price > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSignIcon className="h-3 w-3" />
                      {formatPrice(service.price)}
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
