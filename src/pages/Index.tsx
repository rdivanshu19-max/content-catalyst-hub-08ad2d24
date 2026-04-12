import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*, categories(*)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(7)
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  const featured = posts[0];
  const recent = posts.slice(1, 7);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Content Catalyst",
    description: "Thoughtful articles by GCR — exploring ideas, sharing insights, and sparking conversations.",
    url: window.location.origin,
    author: { "@type": "Person", name: "GCR" },
  };

  return (
    <>
      <SEOHead
        title="Content Catalyst — Blog by GCR"
        description="Thoughtful articles by GCR — exploring ideas, sharing insights, and sparking conversations."
        jsonLd={jsonLd}
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="mx-auto max-w-2xl text-center animate-fade-in">
              <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl">
                <span className="text-gradient">Ideas</span> that ignite.
                <br />
                <span className="text-foreground">Words that resonate.</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Welcome to Content Catalyst — where GCR shares insights, stories, and deep dives on topics that matter.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <NewsletterForm variant="hero" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured + Recent */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold">Latest Articles</h2>
            <Link to="/blog">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-lg">No articles yet. Stay tuned!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured && <BlogCard post={featured} featured />}
              {recent.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="container mx-auto px-4 py-16">
          <NewsletterForm />
        </section>
      </main>

      <Footer />
    </>
  );
}
