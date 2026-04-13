
-- Storage bucket for blog media
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true);

-- Storage policies
CREATE POLICY "Blog media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-media');

CREATE POLICY "Admins can upload blog media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog media"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

-- Comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are publicly readable"
ON public.post_comments FOR SELECT
USING (status = 'approved');

CREATE POLICY "Admins can view all comments"
ON public.post_comments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit a comment"
ON public.post_comments FOR INSERT
WITH CHECK (author_name IS NOT NULL AND content IS NOT NULL AND length(content) > 0);

CREATE POLICY "Admins can manage comments"
ON public.post_comments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments"
ON public.post_comments FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_post_comments_post_id ON public.post_comments (post_id);
