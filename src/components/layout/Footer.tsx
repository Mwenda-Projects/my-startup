import { Link } from "react-router-dom";
import { Briefcase, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";
const Footer = () => {
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="HustleSphere" className="h-12 w-auto" />
            </Link>
            <p className="text-background/60 max-w-md mb-4">
              The campus marketplace where students connect, trade, and grow. Offer your skills, sell your stuff, and find opportunities.
            </p>
            <p className="text-background/60 mb-6">
              <span className="text-background/80">Support:</span>{" "}
              <a href="mailto:mwenda.hq@gmail.com" className="hover:text-primary transition-colors">
                mwenda.hq@gmail.com
              </a>
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/mwendahub/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-pink-500 bg-[#0f0f0f]">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://x.com/MwendaHub" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="X (Twitter)">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-black bg-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@mwendahub" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="TikTok">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#1e0606] bg-slate-50">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/mwendahub" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="LinkedIn">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#3d78b3] bg-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@MwendaHub" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="YouTube">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-red-600">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/MwendaHub" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-background/10 hover:bg-background/20 transition-colors" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-sky-400 bg-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="flex items-center gap-2 text-background/60 hover:text-primary transition-colors">
                  <Briefcase className="w-4 h-4" />
                  Services
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="flex items-center gap-2 text-background/60 hover:text-primary transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-background/60 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-background/60 hover:text-primary transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-background/60 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-background/60 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-background/40 text-sm px-0">
          © {new Date().getFullYear()} HustleSphere. Made with love for students.
        </div>
      </div>
    </footer>;
};
export default Footer;