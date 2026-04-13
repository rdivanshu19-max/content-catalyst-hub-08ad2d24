import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "@/components/BlogCard";
import type { Tables } from "@/integrations/supabase/types";

type PostWithCategory = Tables<"posts"> & { categories?: Tables<"categories"> | null };

interface RelatedPostsProps {
  currentPostId: string;
  categoryId: string | null;
  tags: string[] | null;
}

export default function RelatedPosts({ currentPostId, categoryId, tags }: RelatedPostsProps) {
  const [posts, setPosts] = useState<PostWithCategory[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      // Try same category first
      let query = supabase
        .from("posts")
        .select("*, categories(*)")
        .eq("status", "published")
        .neq("id", currentPostId)
        .limit(3)
        .order("created_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data } = await query;

      if (data && data.length >= 3) {
        setPosts(data);
        return;
      }

      // Fallback: get latest posts if not enough from same category
      if (!data || data.length < 3) {
        const { data: fallback } = await supabase
          .from("posts")
          .select("*, categories(*)")
          .eq("status", "published")
          .neq("id", currentPostId)
          .limit(3)
          .order("created_at", { ascending: false });

        setPosts(fallback || []);
      }
    };

    fetchRelated();
  }, [currentPostId, categoryId, tags]);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-heading text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
