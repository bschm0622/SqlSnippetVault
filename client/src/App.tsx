import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import SQLSnippetManager from "./pages/sql-snippet-manager";
import AuthCallback from "./pages/auth/callback";
import PaymentSuccess from "./pages/payment/success";
import PaymentCancel from "./pages/payment/cancel";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProStatusProvider } from "@/contexts/ProStatusContext";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ProStatusProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Switch>
              <Route path="/" component={SQLSnippetManager} />
              <Route path="/auth/callback" component={AuthCallback} />
              <Route path="/payment/success" component={PaymentSuccess} />
              <Route path="/payment/cancel" component={PaymentCancel} />
            </Switch>
            <Toaster />
          </div>
        </ProStatusProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
