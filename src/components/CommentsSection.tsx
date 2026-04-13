import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data || []));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      author_name: name.trim(),
      author_email: email.trim() || null,
      content: content.trim(),
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit comment.", variant: "destructive" });
    } else {
      toast({ title: "Comment submitted!", description: "It will appear once approved." });
      setName("");
      setEmail("");
      setContent("");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 font-heading text-xl font-bold">
        <MessageSquare className="h-5 w-5" /> Comments ({comments.length})
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(c.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h4 className="font-medium">Leave a Comment</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" required />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          required
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Comment"}
        </Button>
      </form>
    </div>
  );
}
