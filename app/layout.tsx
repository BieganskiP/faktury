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
      <body className="antialiased ">
        <SidebarProvider className="w-full">
          <Toaster />
          <VisuallyHidden.Root>
            <div id="sidebar-title">Menu nawigacyjne</div>
          </VisuallyHidden.Root>
          <AppSidebar />

          <main className="p-4 lg:p-10 w-full relative">
            <SidebarTrigger className="absolute top-4 left-4">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SidebarTrigger>
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
