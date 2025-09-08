"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Renderer = (value: any, key: string, all: Record<string, any>) => React.ReactNode;

export function EntityViewDialog({
  open,
  title = "Detalle",
  onOpenChange,
  data,
  hiddenKeys = ["password", "confirmPassword"],
  renderers,
}: {
  open: boolean;
  title?: string;
  onOpenChange: (open: boolean) => void;
  data: Record<string, any> | null;
  hiddenKeys?: string[];
  renderers?: Record<string, Renderer>;
}) {
  const name = (data?.name as string) || "";
  const email = (data?.email as string) || "";
  const image = (data?.image as string) || "";
  const role = (data?.role as string) || "";

  function getInitials(input: string) {
    if (!input) return "?";
    const parts = input.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function formatValue(key: string, value: any): React.ReactNode {
    if (renderers && renderers[key]) return renderers[key](value, key, data || {});

    if (value == null) return "—";
    if (value instanceof Date) return value.toLocaleString();
    // try date string
    if (typeof value === "string" && /\d{4}-\d{2}-\d{2}T/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    if (typeof value === "boolean") {
      return (
        <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs", value ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{
          value ? "Sí" : "No"
        }</span>
      );
    }
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    if (typeof value === "object") return <code className="text-xs break-words">{JSON.stringify(value)}</code>;
    if (typeof value === "string" && (key.toLowerCase().includes("id") || key === "token")) {
      return <code className="text-xs break-words">{value}</code>;
    }
    return String(value);
  }

  const entries = data
    ? Object.entries(data).filter(([k]) => !hiddenKeys.includes(k))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {(name || email || image || role) && (
          <div className="flex items-center gap-3 rounded-md border p-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={image} alt={name || email} />
              <AvatarFallback>{getInitials(name || email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {name ? <div className="font-medium truncate">{name}</div> : null}
              {email ? (
                <div className="text-xs text-muted-foreground truncate">{email}</div>
              ) : null}
            </div>
            {role ? <Badge className="ml-auto" variant="secondary">{role}</Badge> : null}
          </div>
        )}

        <div className="max-h-[70vh] overflow-auto rounded-md border p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entries.map(([key, value]) => (
              <div key={key} className="rounded-md border p-3 bg-background">
                <div className="break-words leading-relaxed text-sm font-medium mb-1">
                  {formatValue(key, value)}
                </div>
                <div className="text-xs text-muted-foreground">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
