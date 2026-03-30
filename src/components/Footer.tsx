import Link from "next/link";
import { Film, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[oklch(0.07_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <Film className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-lg gold-text">CineConnect</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s leading platform connecting talent, crew, and
              production houses.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Discover Talent", href: "/discover" },
                { label: "Post a Project", href: "/post-project" },
                { label: "Browse Projects", href: "/projects" },
                { label: "Auditions", href: "/auditions" },
                { label: "Messaging", href: "/messages" },
              ],
            },
            {
              title: "Roles",
              links: [
                { label: "Actors & Talent", href: "/discover?role=actor" },
                { label: "Crew & Technicians", href: "/discover?role=crew" },
                {
                  label: "Production Houses",
                  href: "/discover?role=production",
                },
                { label: "Agencies", href: "/discover?role=agency" },
                { label: "Brands", href: "/discover?role=brand" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 CineConnect. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with love for Indian cinema
          </p>
        </div>
      </div>
    </footer>
  );
}
