import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import { Pen, Sparkles, Target } from "lucide-react";

export default function About() {
  return (
    <>
      <SEOHead
        title="About GCR"
        description="Learn about GCR, the writer behind Content Catalyst."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "GCR",
          url: `${window.location.origin}/about`,
          description: "Writer and creator of Content Catalyst",
        }}
      />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="animate-fade-in">
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl">
              About <span className="text-gradient">GCR</span>
            </h1>
            <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Hello! I'm <strong className="text-foreground">GCR</strong>, the creator and sole voice behind Content Catalyst.
              </p>
              <p>
                Content Catalyst was born from a simple belief: great ideas deserve great words. This blog is my playground for exploring topics that fascinate me, sharing insights I've gathered, and sparking meaningful conversations with readers like you.
              </p>
              <p>
                Whether it's technology, personal growth, creativity, or the intersection of all three — I write to make sense of the world and to help others do the same.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Pen, title: "Thoughtful Writing", desc: "Every article is crafted with care, research, and a genuine passion for the topic." },
              { icon: Sparkles, title: "Fresh Perspectives", desc: "I aim to look at familiar subjects through new lenses and offer unique takeaways." },
              { icon: Target, title: "Actionable Insights", desc: "My goal is to leave you with something you can apply, not just consume." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <NewsletterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
