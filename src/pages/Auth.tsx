import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (tab === "forgot") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
        setTab("signin");
      }
      return;
    }

    if (tab === "signup") {
      const { error } = await signUp(email, password, name);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome! 🎉", description: "Account created successfully." });
        navigate("/");
      }
      return;
    }

    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <SEOHead title={tab === "signin" ? "Sign In" : tab === "signup" ? "Sign Up" : "Reset Password"} />
      <Header />
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <h1 className="font-heading text-2xl font-bold text-center">
              {tab === "signin" ? "Welcome Back" : tab === "signup" ? "Create Account" : "Reset Password"}
            </h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {tab === "signin"
                ? "Sign in to your account"
                : tab === "signup"
                ? "Join the Content Catalyst community"
                : "We'll send you a reset link"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {tab === "signup" && (
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              {tab !== "forgot" && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : tab === "signin"
                  ? "Sign In"
                  : tab === "signup"
                  ? "Sign Up"
                  : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center text-sm">
              {tab === "signin" && (
                <>
                  <button onClick={() => setTab("forgot")} className="text-primary hover:underline">
                    Forgot password?
                  </button>
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <button onClick={() => setTab("signup")} className="text-primary hover:underline">
                      Sign Up
                    </button>
                  </p>
                </>
              )}
              {tab === "signup" && (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setTab("signin")} className="text-primary hover:underline">
                    Sign In
                  </button>
                </p>
              )}
              {tab === "forgot" && (
                <button onClick={() => setTab("signin")} className="text-primary hover:underline">
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
