import React from 'react';

import { Toaster } from "@/components/ui/sonner";

export const dynamic = 'force-dynamic';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
