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

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("DB error:", error.message);
    }

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
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    // Return a minimal valid sitemap even on error
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(fallback, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        ...corsHeaders,
      },
    });
  }
});
