/*
 * Arkive Landing Page — "Infrastructure Blueprint" Design
 * Deep charcoal + electric teal. Dot-grid backgrounds. Terminal aesthetics.
 * Target: Professional homelab operators, Unraid power users.
 *
 * Improvements v2:
 * - Docker install code block with copy button
 * - Comparison table vs alternatives
 * - Animated terminal with typing effect
 * - Mobile hamburger nav
 * - Smooth FAQ height animation
 * - Pricing CTA links
 * - "Built with" logos (Unraid, Docker, restic)
 * - Scroll-to-top button
 */

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield, Database, Cloud, Terminal, Eye,
  Bell, FileText, Lock, HardDrive, ArrowRight,
  Check, ChevronDown, Github, ExternalLink, Box,
  RefreshCw, Download, Copy, CheckCheck, ArrowUp,
  Menu, X, Minus
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Image URLs ───
const HERO_DASHBOARD = "https://private-us-east-1.manuscdn.com/sessionFile/AnnPw5f4uLuF3iZ7xctTbU/sandbox/smRht2MLvGibD8yVsBewoR-img-1_1772067878000_na1fn_YXJraXZlLWhlcm8tZGFzaGJvYXJk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQW5uUHc1ZjR1THVGM2laN3hjdFRiVS9zYW5kYm94L3NtUmh0Mk1MdkdpYkQ4eVZzQmV3b1ItaW1nLTFfMTc3MjA2Nzg3ODAwMF9uYTFmbl9ZWEpyYVhabExXaGxjbTh0WkdGemFHSnZZWEprLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=GG8str2hAjGKcbrzyWWw-~Mr-~pLsO9j5dYC8YHppDeqYM-AWG3zKIxzIIOXC7LdePF-UAGeVloFHSXkP3q9MEozmR9SevIcpPIKkJedDShBkt48~kFIqYMTNpT761N1IbPClhc47Zp2Vxe7Cd7zhzXEX86I74ug7hvWKW5Ge8nvIR4C1i8dpRFPan2CHEieTGiAzSR6S8O7sECjBv~Q2hMKl0yBHsvuqoeD8pNcDTFYaHvS7yIiUFl5OqsCKhF9RbrFzgICVdJsLGoQx8OhxpT0UMh3rjvhGHZPe~5VjjbVue-eN6pA1Uwr8ynigSlUKC9tYc~oxpO6HSXD5NTdOQ__";

const ARCHITECTURE = "https://private-us-east-1.manuscdn.com/sessionFile/AnnPw5f4uLuF3iZ7xctTbU/sandbox/smRht2MLvGibD8yVsBewoR-img-2_1772067889000_na1fn_YXJraXZlLWFyY2hpdGVjdHVyZQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQW5uUHc1ZjR1THVGM2laN3hjdFRiVS9zYW5kYm94L3NtUmh0Mk1MdkdpYkQ4eVZzQmV3b1ItaW1nLTJfMTc3MjA2Nzg4OTAwMF9uYTFmbl9ZWEpyYVhabExXRnlZMmhwZEdWamRIVnlaUS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LpK4GxY2GE-magj5FU2xYncXzXtqVD9GPt7ShAlHnGCCemfSPv6g13zu1BGqRAFgpikqt-IssU97H6trPe18XYZy1MY7R3J4mfvV6I5jFhgOVGUK90UaMNh8sYFGzzauQ6Q1lVaknKjrTL4F9YTgeUc069wdt5xnwYVrpwRH8qjaKX316Uo6Gq3FqjXlikI9bFQ6TKWIihdYDM2OZkaBaZN2FrJhVo99tZB43BLJYZqtnyRowpwvJhf9xI0vcYNo2uJFF4LRbMvDJ0zqYJQjaH-F0~RFzWp~pqrirJV0QPLZYr8asJktC8GcXXHomZ~bjokSAZPVco6LqT7ZaTmV1g__";

const SERVER_ROOM = "https://private-us-east-1.manuscdn.com/sessionFile/AnnPw5f4uLuF3iZ7xctTbU/sandbox/smRht2MLvGibD8yVsBewoR-img-4_1772067888000_na1fn_YXJraXZlLXNlcnZlci1yb29t.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQW5uUHc1ZjR1THVGM2laN3hjdFRiVS9zYW5kYm94L3NtUmh0Mk1MdkdpYkQ4eVZzQmV3b1ItaW1nLTRfMTc3MjA2Nzg4ODAwMF9uYTFmbl9ZWEpyYVhabExYTmxjblpsY2kxeWIyOXQucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=uIbFUOUnSKWbIqVFgqH57g3ztFcbVXqVUHCvLbz0AXFdH7TTpSWsMT0QQXhnjYOcGoM3jKxiSQP7uVFGEhQIk76UyXzIictT9TRWYuBE2y5vLYa5kjPk7asECb87ikhMFhixlBXcovRCX9fVMmVEi1eWiveD5AeAzij4QhL0rs8VIBSL8nR0fMrbrGKcZ7-KgdjNfIPdqYabOCfsOEJW4UqBYfSzhMEVqOxKBOb4haxQZVUdnIqEIL9Zk3d~~cR7Zq~aHSy1Fss5dPSvPAuifmA4zsgrhThvfe77ytlujTW9-93xuZAOFLXFIlNWdujgdqAXOOWKJtlNid8I696Ntg__";

// ─── Animation variants ───
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

// ─── Data ───
const features = [
  { icon: Eye, title: "Zero-Config Discovery", desc: "Automatically detects running containers and their databases via Docker socket inspection. No manual configuration needed." },
  { icon: Database, title: "Application-Aware Dumps", desc: "Hot-consistent database dumps for PostgreSQL, MariaDB, MongoDB, SQLite, Redis, and InfluxDB with integrity verification." },
  { icon: Lock, title: "AES-256 Encryption", desc: "All backup data encrypted at rest using restic's built-in AES-256-CTR + Poly1305-AES. Your data stays yours." },
  { icon: Cloud, title: "Multi-Cloud Sync", desc: "Push encrypted backups to Backblaze B2, Amazon S3, SFTP, local paths, or SMB shares. Multiple targets simultaneously." },
  { icon: HardDrive, title: "Flash Config Backup", desc: "Unraid-specific /boot flash drive backup captures your entire server configuration for bare-metal recovery." },
  { icon: FileText, title: "Restore Plan PDF", desc: "Generate a comprehensive disaster recovery runbook with step-by-step restore instructions, on demand." },
  { icon: Bell, title: "Smart Notifications", desc: "Discord, Slack, ntfy, Gotify, Pushover, email — get notified on backup success, failure, or system warnings." },
  { icon: Terminal, title: "Full CLI Access", desc: "Complete command-line interface for scripting, automation, and headless operation alongside the web dashboard." },
  { icon: RefreshCw, title: "Self-Healing", desc: "Stale lock detection, interrupted run recovery, WAL checkpointing. Arkive recovers gracefully from failures." },
];

const databases = [
  { name: "PostgreSQL", color: "#336791" },
  { name: "MariaDB", color: "#C0765A" },
  { name: "MongoDB", color: "#47A248" },
  { name: "SQLite", color: "#003B57" },
  { name: "Redis", color: "#DC382D" },
  { name: "InfluxDB", color: "#9B59B6" },
];

const pricingTiers = [
  {
    name: "Self-Hosted",
    price: "Free",
    period: "forever",
    desc: "All features, no limits. Bring your own storage.",
    features: [
      "Unlimited containers & databases",
      "All 6 database engines",
      "Container auto-discovery",
      "Flash config backup",
      "AES-256 encrypted restic repos",
      "Web dashboard + full CLI",
      "Unlimited cloud targets",
      "All notification channels",
      "Advanced retention policies",
      "Restore plan PDF export",
      "Backup verification checks",
    ],
    cta: "Install Now",
    ctaLink: "#install",
    highlight: true,
  },
  {
    name: "Arkive Cloud",
    price: "Usage-based",
    period: "",
    desc: "Don't want to manage storage? We handle it for you.",
    features: [
      "Everything in Self-Hosted",
      "Managed cloud storage",
      "No credentials to configure",
      "Just enter your email",
      "Pay only for storage used",
      "Automatic provisioning",
      "Monitoring & health checks",
      "Priority support",
    ],
    cta: "Get Started",
    ctaLink: "#install",
    highlight: false,
  },
];

const faqs = [
  { q: "Does Arkive require root access?", a: "Arkive needs read-only access to the Docker socket to discover containers. It runs as a Docker container itself and only needs read access to the directories you want to back up." },
  { q: "What storage providers are supported?", a: "Arkive supports Backblaze B2, Amazon S3, Wasabi, Dropbox, Google Drive, SFTP, and local/network paths. You can also use Arkive Cloud if you don't want to manage storage yourself. All providers are available for free — no tier gating." },
  { q: "What happens if a backup fails?", a: "Arkive has built-in self-healing. If a backup is interrupted, it detects stale locks and resumes automatically. You'll get notified via your configured channels (Discord, Slack, etc.)." },
  { q: "Can I use Arkive on non-Unraid systems?", a: "Yes. While Arkive is optimized for Unraid (flash backup, CA template), it works on any Docker-based system — Proxmox, TrueNAS, bare Ubuntu, Synology, and more." },
  { q: "How is my data encrypted?", a: "Arkive uses restic's built-in encryption: AES-256-CTR for data confidentiality and Poly1305-AES for authentication. Your encryption password never leaves your server." },
  { q: "Can I restore individual databases?", a: "Yes. Arkive dumps each database separately, so you can restore a single database without affecting others. The restore plan PDF includes exact commands for each database." },
  { q: "What's the performance impact?", a: "Minimal. Database dumps use --single-transaction where supported, so there's no locking. Restic's deduplication means only changed data is uploaded. You can schedule backups during off-peak hours." },
];

// ─── Comparison data ───
const comparisonRows = [
  { feature: "Auto container discovery", arkive: true, manual: false, duplicati: false, borg: false },
  { feature: "Application-aware DB dumps", arkive: true, manual: "partial", duplicati: false, borg: false },
  { feature: "Encrypted at rest", arkive: true, manual: false, duplicati: true, borg: true },
  { feature: "Deduplication", arkive: true, manual: false, duplicati: false, borg: true },
  { feature: "Multi-cloud sync", arkive: true, manual: false, duplicati: true, borg: "partial" },
  { feature: "Web dashboard", arkive: true, manual: false, duplicati: true, borg: false },
  { feature: "Unraid optimized", arkive: true, manual: false, duplicati: false, borg: false },
  { feature: "Flash config backup", arkive: true, manual: "partial", duplicati: false, borg: false },
  { feature: "Restore plan PDF", arkive: true, manual: false, duplicati: false, borg: false },
  { feature: "Zero config setup", arkive: true, manual: false, duplicati: false, borg: false },
];

// ─── Terminal animation lines ───
const terminalLines = [
  { text: "$ docker exec arkive backup run", color: "text-foreground", delay: 0 },
  { text: "[10:00:01] Initiating backup process...", color: "text-muted-foreground", delay: 800 },
  { text: "[10:00:05] Discovering containers on Docker socket...", color: "text-muted-foreground", delay: 1400 },
  { text: "[10:00:08] Found 4 containers with databases:", color: "text-primary", delay: 2000 },
  { text: "           ├─ immich_postgres  (PostgreSQL 16)", color: "text-primary/80", delay: 2400 },
  { text: "           ├─ nextcloud_db     (MariaDB 11.2)", color: "text-primary/80", delay: 2700 },
  { text: "           ├─ vaultwarden      (SQLite)", color: "text-primary/80", delay: 3000 },
  { text: "           └─ home_assistant   (SQLite)", color: "text-primary/80", delay: 3300 },
  { text: "[10:00:10] Dumping immich_postgres... 5.2 GB", color: "text-muted-foreground", delay: 3800 },
  { text: "[10:01:45] ✓ immich_postgres dumped (integrity OK)", color: "text-green-400", delay: 4500 },
  { text: "[10:01:46] Dumping nextcloud_db... 1.8 GB", color: "text-muted-foreground", delay: 5000 },
  { text: "[10:02:30] ✓ nextcloud_db dumped (integrity OK)", color: "text-green-400", delay: 5600 },
  { text: "[10:02:31] Dumping vaultwarden... 42 MB", color: "text-muted-foreground", delay: 6000 },
  { text: "[10:02:33] ✓ vaultwarden dumped (integrity OK)", color: "text-green-400", delay: 6400 },
  { text: "[10:02:34] Dumping home_assistant... 128 MB", color: "text-muted-foreground", delay: 6700 },
  { text: "[10:02:38] ✓ home_assistant dumped (integrity OK)", color: "text-green-400", delay: 7100 },
  { text: "[10:02:40] Encrypting backup archives (AES-256)...", color: "text-muted-foreground", delay: 7500 },
  { text: "[10:03:15] ✓ Encryption complete", color: "text-green-400", delay: 8000 },
  { text: "[10:03:16] Syncing to Backblaze B2...", color: "text-muted-foreground", delay: 8400 },
  { text: "[10:05:42] ✓ Cloud sync complete (7.17 GB, deduplicated to 312 MB)", color: "text-green-400", delay: 9000 },
  { text: "[10:05:43] ✓ Backup completed successfully in 5m 42s", color: "text-primary font-semibold", delay: 9500 },
  { text: "[10:05:44] ✓ Notification sent to Discord", color: "text-green-400", delay: 10000 },
];

// ─── Docker install command ───
const dockerCommand = `docker run -d \\
  --name arkive \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v /mnt/user/appdata/arkive:/config \\
  -v /boot:/boot:ro \\
  -p 8200:8200 \\
  ghcr.io/islamdiaa/arkive:latest`;

// ─── Components ───

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs text-yellow-400/80 font-mono">partial</span>;
}

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let lineIndex = 0;
          const showNextLine = () => {
            if (lineIndex < terminalLines.length) {
              const delay = lineIndex === 0 ? 300 : terminalLines[lineIndex].delay - terminalLines[lineIndex - 1].delay;
              setTimeout(() => {
                setVisibleLines(prev => prev + 1);
                lineIndex++;
                showNextLine();
              }, delay);
            }
          };
          showNextLine();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="rounded-lg border border-border/50 bg-[#0a0e14] overflow-hidden shadow-2xl">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/30 border-b border-border/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">arkive — backup run</span>
      </div>
      {/* Terminal content */}
      <div className="p-4 font-mono text-xs sm:text-sm leading-relaxed h-[380px] overflow-hidden">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={`${line.color} whitespace-pre`}>
            {line.text}
          </motion.div>
        ))}
        {visibleLines < terminalLines.length && visibleLines > 0 && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Compare", href: "#compare" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Arkive</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="https://github.com/islamdiaa/arkive" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            <Github className="w-5 h-5" />
          </a>
          <a href="#install">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:inline-flex">
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          </a>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden">
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">{l.label}</a>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <a href="https://github.com/islamdiaa/arkive" target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#install">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" /> Install
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 dot-grid" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              v0.1.0 — Now in Public Beta
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Disaster Recovery
              <br />
              <span className="text-primary">on Autopilot</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              Arkive discovers your Docker containers, dumps databases, encrypts everything, and syncs to your storage — Backblaze, S3, Wasabi, Dropbox, Google Drive, or SFTP. 100% free, no limits. Built for Unraid. Works everywhere.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="#install">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 w-full sm:w-auto">
                  <Download className="w-5 h-5 mr-2" />
                  Install from Community Apps
                </Button>
              </a>
              <a href="https://github.com/islamdiaa/arkive" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-base px-6 border-border/50 bg-transparent hover:bg-secondary w-full sm:w-auto">
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Bring Your Own Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>AES-256 Encrypted</span>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative">
            <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-2xl shadow-primary/5">
              <img src={HERO_DASHBOARD} alt="Arkive Dashboard" className="w-full" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-border/50 rounded-lg p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-green-500/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Last Backup</p>
                  <p className="text-sm font-semibold">12 min ago — 3 databases</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InstallSection() {
  return (
    <section id="install" className="border-y border-border/50 bg-card/50">
      <div className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Stats */}
          <div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { value: "6", label: "Database Engines" },
                { value: "50+", label: "App Profiles" },
                { value: "5", label: "Cloud Targets" },
                { value: "<5min", label: "Setup Time" },
              ].map((s, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="text-center bg-background/50 border border-border/30 rounded-lg p-4">
                  <p className="text-2xl font-extrabold text-primary font-mono">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
            {/* Built with logos */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-mono">Built with</p>
              <div className="flex items-center gap-6">
                {/* Docker */}
                <div className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.186.186 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.186.186 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.186.186 0 00-.185.185v1.887c0 .102.083.186.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.186.186 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186zm5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.186.186 0 00-.185.186v1.887c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.887c0 .102.083.185.185.185zm-2.964 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185zm-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.186v1.887c0 .102.083.185.185.185zM23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/></svg>
                  <span className="text-xs font-mono">Docker</span>
                </div>
                {/* restic */}
                <div className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-mono">restic</span>
                </div>
                {/* rclone */}
                <div className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Cloud className="w-5 h-5" />
                  <span className="text-xs font-mono">rclone</span>
                </div>
                {/* Unraid */}
                <div className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <HardDrive className="w-5 h-5" />
                  <span className="text-xs font-mono">Unraid</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Docker install code block */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Quick Start</p>
            <div className="relative rounded-lg border border-border/50 bg-[#0a0e14] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/20 border-b border-border/30">
                <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">docker run</span>
              </div>
              <pre className="p-4 text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                <code>{dockerCommand}</code>
              </pre>
              <CopyButton text={dockerCommand.replace(/\\\n/g, '')} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Or install via{" "}
              <a href="#" className="text-primary hover:underline">Unraid Community Apps</a>{" "}
              for one-click setup.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 dot-grid opacity-50" />
      <div className="container relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Everything Your Backups Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From container discovery to encrypted cloud sync, Arkive handles the entire backup pipeline so you don't have to.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="group relative bg-card border border-border/50 rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorageProvidersSection() {
  const providers = [
    { name: "Backblaze B2", desc: "S3-compatible, great value", icon: "🔵" },
    { name: "Amazon S3", desc: "AWS or any S3 endpoint", icon: "🟠" },
    { name: "Wasabi", desc: "Hot storage, no egress fees", icon: "🟢" },
    { name: "Dropbox", desc: "OAuth2 via rclone", icon: "📦" },
    { name: "Google Drive", desc: "OAuth2 via rclone", icon: "🔺" },
    { name: "SFTP", desc: "Any SSH server", icon: "🖥️" },
    { name: "Local / NFS / SMB", desc: "Network-mounted paths", icon: "📁" },
    { name: "Arkive Cloud", desc: "We handle it for you", icon: "☁️" },
  ];

  return (
    <section className="py-24 border-t border-border/50 bg-card/30">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Storage</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Your Storage. Your Choice.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bring your own storage provider or let Arkive Cloud handle it. Every provider is supported for free — no tier gating, no limits.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {providers.map((p, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className={`bg-card border rounded-lg p-4 text-center hover:border-primary/30 transition-all ${
                p.name === 'Arkive Cloud' ? 'border-primary/40 bg-primary/5' : 'border-border/50'
              }`}>
              <span className="text-2xl block mb-2">{p.icon}</span>
              <p className="text-sm font-semibold mb-1">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
          The setup wizard walks you through connecting any provider in under 2 minutes. Credentials are encrypted at rest with AES-256.
        </motion.p>
      </div>
    </section>
  );
}

function DatabasesSection() {
  return (
    <section className="py-24 border-y border-border/50 bg-card/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Database Support</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Every Database,<br />Dumped Correctly
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Arkive uses application-aware dump strategies — not filesystem snapshots. Each database engine gets its own optimized dump command with integrity verification.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {databases.map((db, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="flex items-center gap-3 bg-card border border-border/50 rounded-lg px-4 py-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: db.color }} />
                  <span className="text-sm font-medium">{db.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated terminal instead of static image */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <AnimatedTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { icon: Box, title: "Install", desc: "One-click install from Unraid Community Apps, or docker-compose up." },
    { icon: Eye, title: "Discover", desc: "Arkive scans your Docker containers and identifies databases automatically." },
    { icon: Database, title: "Dump", desc: "Application-aware dumps with integrity verification for each database." },
    { icon: Lock, title: "Encrypt", desc: "AES-256-CTR encryption via restic. Your password never leaves the server." },
    { icon: Cloud, title: "Sync", desc: "Push encrypted, deduplicated backups to B2, S3, SFTP, or local storage." },
    { icon: Bell, title: "Notify", desc: "Get notified on success, failure, or warnings via Discord, Slack, and more." },
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="container relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Pipeline</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            How Arkive Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A fully automated backup pipeline from container discovery to encrypted cloud storage.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border/50" />
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative text-center">
                <div className="relative z-10 w-14 h-14 rounded-lg bg-card border border-border/50 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-lg overflow-hidden border border-border/50 shadow-2xl shadow-primary/5">
          <img src={ARCHITECTURE} alt="Arkive architecture diagram" className="w-full" loading="lazy" />
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section id="compare" className="py-24 border-t border-border/50 bg-card/30">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Comparison</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Why Arkive?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purpose-built for Docker and homelabs. Not a general-purpose backup tool bolted onto containers.
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-primary">Arkive</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Manual Scripts</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Duplicati</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Borg</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-foreground/90">{row.feature}</td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.arkive} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.manual} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.duplicati} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.borg} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-border/50">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            100% Free. Your Storage, Your Rules.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every feature is free and unlocked. Bring your own storage — Backblaze B2, AWS S3, Wasabi, Dropbox, Google Drive, SFTP, or local. Or let us handle it with Arkive Cloud.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {pricingTiers.map((tier, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className={`relative bg-card rounded-lg border p-8 ${
                tier.highlight ? 'border-primary/50 shadow-lg shadow-primary/5' : 'border-border/50'
              }`}>
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Recommended
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.desc}</p>

              <a href={tier.ctaLink}>
                <Button className={`w-full mb-6 ${
                  tier.highlight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}>
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>

              <ul className="space-y-3">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative border-t border-border/50 bg-card/30">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="container relative z-10 max-w-3xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-3 tracking-wider uppercase">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Common Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="bg-card border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={SERVER_ROOM} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
      </div>
      <div className="container relative z-10 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Your Data Deserves Better<br />Than Manual Backups
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Install Arkive in under 5 minutes. Set it and forget it. Sleep well knowing your homelab is protected.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#install">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 w-full sm:w-auto">
                <Download className="w-5 h-5 mr-2" />
                Install Now — It's Free
              </Button>
            </a>
            <a href="https://github.com/islamdiaa/arkive" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-base px-8 border-border/50 bg-transparent hover:bg-secondary w-full sm:w-auto">
                Read the Docs
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Arkive</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated disaster recovery for Unraid servers and Docker-based homelabs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#compare" className="hover:text-foreground transition-colors">Compare</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com/islamdiaa/arkive" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Unraid Forum</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">MIT License</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Arkive. Built with care for the homelab community.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/islamdiaa/arkive" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <InstallSection />
      <FeaturesSection />
      <StorageProvidersSection />
      <DatabasesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
