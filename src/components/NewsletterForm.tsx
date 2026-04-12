import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function NewsletterForm({ variant = "default" }: { variant?: "default" | "hero" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email.length < 6 || !email.includes("@")) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed!", description: "This email is already on our list." });
      } else {
        toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
      }
    } else {
      toast({ title: "Welcome aboard! 🎉", description: "You've been subscribed to our newsletter." });
      setEmail("");
    }
  };

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-heading text-xl font-bold">Stay Updated</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get the latest articles delivered straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}
