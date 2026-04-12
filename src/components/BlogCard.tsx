import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

interface BlogCardProps {
  post: Tables<"posts"> & { categories?: Tables<"categories"> | null };
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-elevated ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-0" : ""
      }`}
    >
      {post.cover_image && (
        <div className={`overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        {post.categories && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {post.categories.name}
          </span>
        )}
        <h3 className={`mt-1 font-heading font-bold leading-tight group-hover:text-primary transition-colors ${
          featured ? "text-2xl" : "text-lg"
        }`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
          {post.reading_time && <span>· {post.reading_time} min read</span>}
        </div>
      </div>
    </Link>
  );
}
