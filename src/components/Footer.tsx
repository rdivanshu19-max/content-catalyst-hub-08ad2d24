import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-bold">
              <span className="text-gradient">CONTENT</span> CATALYST
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thoughtful articles by GCR. Exploring ideas, sharing insights, and sparking conversations.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider">Navigation</h4>
            <nav className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider">Connect</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Have questions or feedback? Reach out at{" "}
              <a href="mailto:gcr.author@gmail.com" className="text-primary hover:underline">
                gcr.author@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Content Catalyst by GCR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
