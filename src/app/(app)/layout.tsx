import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/sidebar/MobileSidebar";

export default function AppPlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-56px)] grid grid-cols-1 sm:grid-cols-[auto_1fr]">
      <div className="border-b sm:hidden px-4 py-2 flex items-center gap-2">
        <MobileSidebar />
        <span className="font-semibold text-sm">Agenda Centralizada</span>
      </div>
      <div className="hidden sm:block"><Sidebar /></div>
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
