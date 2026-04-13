import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import SocialShareButtons from "@/components/SocialShareButtons";
import CommentsSection from "@/components/CommentsSection";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("posts")
      .select("*, categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl font-bold">Article Not Found</h1>
          <p className="mt-2 text-muted-foreground">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const postUrl = typeof window !== "undefined" ? window.location.href : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: "GCR" },
    image: post.cover_image,
  };

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || ""}
        ogImage={post.cover_image || undefined}
        ogType="article"
        jsonLd={jsonLd}
      />
      <Header />
      <article className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
          </Link>

          {post.categories && (
            <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-primary">
              {post.categories.name}
            </span>
          )}

          <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.created_at), "MMMM d, yyyy")}
            </span>
            {post.reading_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} min read
              </span>
            )}
            <span>By GCR</span>
          </div>

          <div className="mt-4">
            <SocialShareButtons url={postUrl} title={post.title} />
          </div>

          {post.cover_image && (
            <div className="mt-8 overflow-hidden rounded-xl">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <div className="prose-blog mt-8" dangerouslySetInnerHTML={{ __html: post.content || "" }} />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <SocialShareButtons url={postUrl} title={post.title} />
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <CommentsSection postId={post.id} />
          </div>

          <div className="mt-12">
            <NewsletterForm />
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
