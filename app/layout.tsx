import type { Metadata } from "next";
import "@/app/assets/globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Generator faktur",
  description: "Generator faktur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <Toaster />
        <SidebarProvider>
          <VisuallyHidden.Root>
            <div id="sidebar-title">Menu nawigacyjne</div>
          </VisuallyHidden.Root>

          <AppSidebar />
          <SidebarTrigger className="m-4 lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SidebarTrigger>
          <main className="p-4 lg:p-10 w-full">{children}</main>
        </SidebarProvider>
      </body>
    </html>
  );
}
