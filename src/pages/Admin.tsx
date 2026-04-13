import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import {
  FileText, PlusCircle, Users, BarChart3, Settings,
  LogOut, Home, Trash2, Edit, Eye, Archive, Sun, Moon,
  Mail, Tag, ChevronRight, MessageSquare, Upload, Check, X,
} from "lucide-react";

type AdminTab = "dashboard" | "posts" | "new-post" | "edit-post" | "categories" | "subscribers" | "comments" | "settings";

export default function Admin() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, published: 0, subscribers: 0, views: 0 });
  const [editPostId, setEditPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const [postsRes, catsRes, subsRes] = await Promise.all([
      supabase.from("posts").select("*, categories(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
    ]);
    const p = postsRes.data || [];
    setPosts(p);
    setCategories(catsRes.data || []);
    setSubscribers(subsRes.data || []);
    setStats({
      posts: p.length,
      published: p.filter((x: any) => x.status === "published").length,
      subscribers: (subsRes.data || []).filter((s: any) => s.status === "active").length,
      views: p.reduce((sum: number, x: any) => sum + (x.views || 0), 0),
    });
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  const sidebarItems = [
    { id: "dashboard" as AdminTab, icon: BarChart3, label: "Dashboard" },
    { id: "posts" as AdminTab, icon: FileText, label: "Posts" },
    { id: "new-post" as AdminTab, icon: PlusCircle, label: "New Post" },
    { id: "categories" as AdminTab, icon: Tag, label: "Categories" },
    { id: "subscribers" as AdminTab, icon: Mail, label: "Subscribers" },
    { id: "comments" as AdminTab, icon: MessageSquare, label: "Comments" },
    { id: "settings" as AdminTab, icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <SEOHead title="Admin Panel" />
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-border bg-card">
          <div className="flex h-16 items-center border-b border-border px-4">
            <span className="font-heading text-lg font-bold">
              <span className="text-gradient">CC</span> Admin
            </span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {sidebarItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setEditPostId(null); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="border-t border-border p-3 space-y-1">
            <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              <Home className="h-4 w-4" /> View Site
            </button>
            <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6">
          {tab === "dashboard" && <DashboardView stats={stats} />}
          {tab === "posts" && <PostsListView posts={posts} onEdit={(id) => { setEditPostId(id); setTab("edit-post"); }} onRefresh={loadData} />}
          {tab === "new-post" && <PostEditorView categories={categories} onSaved={() => { loadData(); setTab("posts"); }} />}
          {tab === "edit-post" && editPostId && <PostEditorView postId={editPostId} categories={categories} onSaved={() => { loadData(); setTab("posts"); }} />}
          {tab === "categories" && <CategoriesView categories={categories} onRefresh={loadData} />}
          {tab === "subscribers" && <SubscribersView subscribers={subscribers} onRefresh={loadData} />}
          {tab === "comments" && <CommentsManageView />}
          {tab === "settings" && <SettingsView />}
        </main>
      </div>
    </>
  );
}

function DashboardView({ stats }: { stats: { posts: number; published: number; subscribers: number; views: number } }) {
  const statCards = [
    { label: "Total Posts", value: stats.posts, icon: FileText },
    { label: "Published", value: stats.published, icon: Eye },
    { label: "Subscribers", value: stats.subscribers, icon: Users },
    { label: "Total Views", value: stats.views, icon: BarChart3 },
  ];
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, GCR!</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsListView({ posts, onEdit, onRefresh }: { posts: any[]; onEdit: (id: string) => void; onRefresh: () => void }) {
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    onRefresh();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">All Posts</h1>
      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Create your first one!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    post.status === "published" ? "bg-green-500/10 text-green-600" :
                    post.status === "draft" ? "bg-yellow-500/10 text-yellow-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{post.categories?.name || "Uncategorized"} · {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                {post.status === "published" && (
                  <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(post.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PostEditorView({ postId, categories, onSaved }: { postId?: string; categories: any[]; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [RichTextEditor, setEditor] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    import("@/components/RichTextEditor").then((mod) => setEditor(() => mod.default));
  }, []);

  useEffect(() => {
    if (postId) {
      supabase.from("posts").select("*").eq("id", postId).single().then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setExcerpt(data.excerpt || "");
          setContent(data.content || "");
          setCoverImage(data.cover_image || "");
          setCategoryId(data.category_id || "");
          setTags(data.tags?.join(", ") || "");
          setStatus(data.status);
          setMetaTitle(data.meta_title || "");
          setMetaDesc(data.meta_description || "");
        }
      });
    }
  }, [postId]);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!postId) setSlug(generateSlug(v));
  };

  const calcReadTime = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "");
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  };

  const handleSave = async (saveStatus?: string) => {
    if (!title || !slug) {
      toast({ title: "Error", description: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const finalStatus = saveStatus || status;
    const postData = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image: coverImage || null,
      category_id: categoryId || null,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: finalStatus,
      meta_title: metaTitle || null,
      meta_description: metaDesc || null,
      reading_time: calcReadTime(content),
      author_id: user?.id,
    };

    let error;
    if (postId) {
      ({ error } = await supabase.from("posts").update(postData).eq("id", postId));
    } else {
      ({ error } = await supabase.from("posts").insert(postData));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: postId ? "Post updated!" : "Post created!" });
      onSaved();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{postId ? "Edit Post" : "New Post"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>Save Draft</Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>Publish</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            {RichTextEditor ? (
              <RichTextEditor content={content} onChange={setContent} />
            ) : (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" />
          </div>
          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Short description..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cover Image URL</label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tech, tutorial, ..." />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <hr className="border-border" />
          <div>
            <label className="text-sm font-medium">SEO — Meta Title</label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Custom SEO title" />
          </div>
          <div>
            <label className="text-sm font-medium">SEO — Meta Description</label>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              placeholder="SEO description (max 160 chars)"
              maxLength={160}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesView({ categories, onRefresh }: { categories: any[]; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const addCategory = async () => {
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("categories").insert({ name, slug, description: description || null });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category added!" });
      setName("");
      setDescription("");
      onRefresh();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Category deleted" });
    onRefresh();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Categories</h1>
      <div className="mt-6 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="max-w-xs" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="max-w-xs" />
        <Button onClick={addCategory}>Add</Button>
      </div>
      <div className="mt-4 space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <span className="font-medium">{cat.name}</span>
              {cat.description && <span className="ml-2 text-sm text-muted-foreground">— {cat.description}</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscribersView({ subscribers, onRefresh }: { subscribers: any[]; onRefresh: () => void }) {
  const active = subscribers.filter((s) => s.status === "active");
  const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed");

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    toast({ title: "Subscriber removed" });
    onRefresh();
  };

  const exportCSV = () => {
    const csv = "Email,Status,Subscribed At\n" + active.map((s) => `${s.email},${s.status},${s.subscribed_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Newsletter Subscribers</h1>
        <Button variant="outline" onClick={exportCSV} size="sm">Export CSV</Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{active.length} active · {unsubscribed.length} unsubscribed</p>
      <div className="mt-6 space-y-2">
        {subscribers.length === 0 ? (
          <p className="text-muted-foreground">No subscribers yet.</p>
        ) : (
          subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <span className="font-medium">{s.email}</span>
                <span className={`ml-2 text-xs ${s.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString()}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteSubscriber(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading font-bold">Blog Information</h3>
          <p className="text-sm text-muted-foreground">Blog: Content Catalyst</p>
          <p className="text-sm text-muted-foreground">Author: GCR</p>
          <p className="text-sm text-muted-foreground">Admin: gcr.author@gmail.com</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading font-bold">How to Use the Admin Panel</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>Dashboard:</strong> View quick stats about your blog — total posts, published count, subscribers, and views.</li>
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>Posts:</strong> Manage all your articles. Edit, delete, or change status. Click "New Post" to create one.</li>
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>New Post:</strong> Write articles using the rich text editor. Add title, excerpt, cover image, category, tags, and SEO fields. Save as draft or publish directly.</li>
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>Categories:</strong> Create and manage blog categories to organize your content.</li>
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>Subscribers:</strong> View and manage newsletter subscribers. Export emails as CSV for email campaigns.</li>
            <li className="flex gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> <strong>SEO:</strong> Each post has meta title & description fields. Fill them for better Google ranking.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
