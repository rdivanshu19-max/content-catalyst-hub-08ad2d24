import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SITE_URL = "https://contentcatalysthub.vercel.app";

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/blog", changefreq: "daily", priority: "0.9" },
    { loc: "/about", changefreq: "monthly", priority: "0.7" },
  ];

  const urls = staticPages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const postUrls = (posts || [])
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${postUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});
