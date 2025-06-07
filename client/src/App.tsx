import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import SQLSnippetManager from "./pages/sql-snippet-manager";
import AuthCallback from "./pages/auth/callback";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Switch>
            <Route path="/" component={SQLSnippetManager} />
            <Route path="/auth/callback" component={AuthCallback} />
          </Switch>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
