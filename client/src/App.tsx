import { ThemeProvider } from "next-themes";
import SQLSnippetManager from "./pages/sql-snippet-manager";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <SQLSnippetManager />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
