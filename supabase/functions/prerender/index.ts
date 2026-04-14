import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://contentcatalysthub.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: post } = await supabase
      .from("posts")
      .select("*, categories(name)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!post) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || "";
    const image = post.cover_image || "";
    const canonical = `${SITE_URL}/blog/${post.slug}`;
    const plainContent = (post.content || "").replace(/<[^>]*>/g, "").substring(0, 500);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Content Catalyst</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ""}
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: "GCR" },
    image: image || undefined,
    url: canonical,
  })}</script>
</head>
<body>
  <article>
    <h1>${escapeHtml(post.title)}</h1>
    ${post.categories ? `<p>Category: ${escapeHtml(post.categories.name)}</p>` : ""}
    <p>${escapeHtml(description)}</p>
    <div>${plainContent}...</div>
    <p><a href="${canonical}">Read full article</a></p>
  </article>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Prerender error:", err);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
