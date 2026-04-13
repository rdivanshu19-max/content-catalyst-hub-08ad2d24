import { Twitter, Linkedin, Facebook, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

export default function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { icon: Twitter, label: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { icon: Facebook, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="flex items-center gap-2">
      <Share2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Share:</span>
      {links.map(({ icon: Icon, label, href }) => (
        <Button key={label} variant="outline" size="icon" className="h-8 w-8" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" title={`Share on ${label}`}>
            <Icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  );
}
