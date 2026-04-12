
-- Drop the overly permissive policy
DROP POLICY "Anyone can subscribe" ON public.newsletter_subscribers;

-- Create a more restrictive policy that still allows public inserts but validates
CREATE POLICY "Anyone can subscribe with valid email" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (email IS NOT NULL AND length(email) > 5 AND email LIKE '%@%.%');
