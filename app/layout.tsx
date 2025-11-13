import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/api/query-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "StudyPad - Your AI Learning Companion",
  description: "Self-hosted AI learning platform for businesses. Upload documents, ask questions, and create study materials offline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
