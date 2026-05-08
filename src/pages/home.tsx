import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import {
  Search, Moon, Sun, GitBranch, GitCommit, GitMerge, GitPullRequest,
  ArrowRight, Check, TerminalSquare, Github, Clock, History,
  RotateCcw, AlertTriangle, CheckCircle2, Circle, BookOpen,
  Link as LinkIcon, Zap, Shield, Globe, ChevronRight, Copy,
  Layers, Code2, ArrowUpRight, FileCode2
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, useScroll, useSpring, useInView, AnimatePresence } from "framer-motion";

/* ── DATA ─────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "hero",               title: "Overview",           group: "intro" },
  { id: "version-control",    title: "Version Control",    group: "intro" },
  { id: "what-is-git",        title: "What is Git?",       group: "intro" },
  { id: "what-is-github",     title: "What is GitHub?",    group: "intro" },
  { id: "installing",         title: "Installing Git",     group: "setup" },
  { id: "configuration",      title: "Configuration",      group: "setup" },
  { id: "core-concepts",      title: "Core Concepts",      group: "setup" },
  { id: "basic-commands",     title: "Basic Commands",     group: "commands" },
  { id: "workflow",           title: "Git Workflow",       group: "commands" },
  { id: "branching",          title: "Branching",          group: "commands" },
  { id: "working-with-github","title": "Working w/ GitHub","group": "remote" },
  { id: "undoing",            title: "Undoing Mistakes",   group: "remote" },
  { id: "reference",          title: "Command Reference",  group: "reference" },
  { id: "daily-notes",        title: "Daily Notes",        group: "reference" },
  { id: "roadmap",            title: "Roadmap",            group: "reference" },
  { id: "resources",          title: "Resources",          group: "reference" },
];

const COMMAND_REFERENCE = [
  { cmd: "git init",                    desc: "Initialize a new repository",            category: "Setup" },
  { cmd: "git clone <url>",             desc: "Clone a remote repository",              category: "Setup" },
  { cmd: "git config",                  desc: "Get and set configuration options",      category: "Setup" },
  { cmd: "git status",                  desc: "Show working tree status",               category: "Workflow" },
  { cmd: "git add <file>",              desc: "Stage a specific file",                  category: "Workflow" },
  { cmd: "git add .",                   desc: "Stage all changes",                      category: "Workflow" },
  { cmd: 'git commit -m "msg"',         desc: "Commit staged changes",                  category: "Workflow" },
  { cmd: "git commit --amend",          desc: "Edit the last commit",                   category: "Workflow" },
  { cmd: "git log",                     desc: "Full commit history",                    category: "History" },
  { cmd: "git log --oneline",           desc: "Compact commit history",                 category: "History" },
  { cmd: "git log --graph --all",       desc: "Visual branch history",                  category: "History" },
  { cmd: "git diff",                    desc: "Show unstaged changes",                  category: "History" },
  { cmd: "git diff --staged",           desc: "Show staged changes",                    category: "History" },
  { cmd: "git branch",                  desc: "List local branches",                    category: "Branching" },
  { cmd: "git branch -d <name>",        desc: "Delete a local branch",                  category: "Branching" },
  { cmd: "git switch <name>",           desc: "Switch branches",                        category: "Branching" },
  { cmd: "git switch -c <name>",        desc: "Create and switch to new branch",        category: "Branching" },
  { cmd: "git merge <branch>",          desc: "Merge branch into current",              category: "Branching" },
  { cmd: "git remote -v",               desc: "List remotes",                           category: "Remote" },
  { cmd: "git remote add origin <url>", desc: "Add a remote",                           category: "Remote" },
  { cmd: "git push -u origin main",     desc: "Push and set upstream",                  category: "Remote" },
  { cmd: "git push",                    desc: "Push commits to remote",                 category: "Remote" },
  { cmd: "git pull",                    desc: "Fetch and merge from remote",            category: "Remote" },
  { cmd: "git fetch",                   desc: "Fetch without merging",                  category: "Remote" },
  { cmd: "git restore <file>",          desc: "Discard working dir changes",            category: "Undo" },
  { cmd: "git restore --staged <file>", desc: "Unstage a file",                         category: "Undo" },
  { cmd: "git reset --soft HEAD~1",     desc: "Undo commit, keep staged",               category: "Undo" },
  { cmd: "git reset --hard HEAD~1",     desc: "Undo commit, discard changes",           category: "Undo" },
  { cmd: "git revert <hash>",           desc: "Safely undo a pushed commit",            category: "Undo" },
  { cmd: "git stash",                   desc: "Shelve current changes",                 category: "Undo" },
  { cmd: "git stash pop",               desc: "Restore stashed changes",                category: "Undo" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Setup:     "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Workflow:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  History:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Branching: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Remote:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Undo:      "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const DAILY_NOTES = [
  { day: 1, title: "Setup & First Repository", insight: "Git is local — GitHub is remote. They are separate things.", covered: ["Installed Git and verified with git --version","Configured name and email with git config","Created a new folder and ran git init","Made first file, ran git add and git commit"] },
  { day: 2, title: "The Staging Area", insight: "Staging is intentional — you choose exactly what goes into each commit.", covered: ["Understood Working Directory → Staging Area → Repository","Used git add and git commit for the first time","Pushed to GitHub with git push -u origin main","Learned to read git status output"] },
  { day: 3, title: "Branching Basics", insight: "Branches are just lightweight pointers to commits — creating one takes milliseconds.", covered: ["Created a branch with git switch -c feature/test","Made commits without affecting main","Merged branch back with git merge","Deleted branch with git branch -d"] },
  { day: 4, title: "Handling Mistakes", insight: "git revert is safe for shared branches; git reset is for local history only.", covered: ["Discarded changes with git restore","Unstaged files with git restore --staged","Fixed commit message with git commit --amend","Learned the difference between reset and revert"] },
];

const ROADMAP = [
  { stage: "Foundations",         color: "violet", completed: true,  tasks: ["Install Git","Configure identity","Understand the 3 areas","Make first commit"] },
  { stage: "Local Branching",     color: "blue",   completed: true,  tasks: ["Create branches","Switch branches","Merge branches","Read commit history"] },
  { stage: "Remote & GitHub",     color: "cyan",   completed: false, tasks: ["Connect to GitHub","Push and Pull","Clone repositories","Understand remotes"] },
  { stage: "Open Source",         color: "emerald",completed: false, tasks: ["Forking repos","Creating Pull Requests","Syncing upstream","Code review basics"] },
  { stage: "Advanced Git",        color: "amber",  completed: false, tasks: ["Resolve merge conflicts","Interactive Rebase","Git Stash","Git Hooks"] },
];

const ROADMAP_COLORS: Record<string, string> = {
  violet:  "from-violet-600 to-violet-400 shadow-violet-500/30",
  blue:    "from-blue-600 to-blue-400 shadow-blue-500/30",
  cyan:    "from-cyan-600 to-cyan-400 shadow-cyan-500/30",
  emerald: "from-emerald-600 to-emerald-400 shadow-emerald-500/30",
  amber:   "from-amber-600 to-amber-400 shadow-amber-500/30",
};

const TERMINAL_LINES = [
  { type: "prompt", text: "git init" },
  { type: "output", text: "Initialized empty Git repository in .git/" },
  { type: "prompt", text: "git add ." },
  { type: "prompt", text: 'git commit -m "Initial commit"' },
  { type: "output", text: "[main a3f8c12] Initial commit" },
  { type: "output", text: " 3 files changed, 47 insertions(+)" },
  { type: "prompt", text: "git switch -c feature/auth" },
  { type: "output", text: "Switched to a new branch 'feature/auth'" },
  { type: "prompt", text: "git push origin main" },
  { type: "output", text: "Branch 'main' set up to track 'origin/main'." },
];

/* ── HELPER COMPONENTS ────────────────────────────────────── */

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-xs font-bold tracking-widest uppercase text-primary/60">{number}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent max-w-[80px]" />
      <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground/50">{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
      {children}
    </h2>
  );
}

function GlassCard({ children, className = "", glowColor = "violet" }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const glow = glowColor === "cyan" ? "hover:shadow-[0_0_40px_hsl(187_85%_50%/0.15)] hover:border-cyan-500/30"
             : glowColor === "emerald" ? "hover:shadow-[0_0_40px_hsl(142_71%_50%/0.15)] hover:border-emerald-500/30"
             : "hover:shadow-[0_0_40px_hsl(267_83%_66%/0.15)] hover:border-primary/30";
  return (
    <div className={`rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 ${glow} ${className}`}>
      {children}
    </div>
  );
}

function TerminalHero() {
  const [visibleLines, setVisibleLines] = useState<{ type: string; text: string }[]>([]);
  const [currentChar, setCurrentChar] = useState(0);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentLineIdx >= TERMINAL_LINES.length) {
      setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIdx(0);
        setCurrentChar(0);
        setIsTyping(true);
      }, 3000);
      return;
    }
    const line = TERMINAL_LINES[currentLineIdx];
    if (line.type === "output") {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        setCurrentLineIdx(i => i + 1);
        setCurrentChar(0);
      }, 120);
      return () => clearTimeout(timer);
    }
    if (currentChar < line.text.length) {
      const timer = setTimeout(() => setCurrentChar(c => c + 1), 45 + Math.random() * 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, { ...line, text: line.text }]);
        setCurrentLineIdx(i => i + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLineIdx, currentChar]);

  const currentLine = currentLineIdx < TERMINAL_LINES.length ? TERMINAL_LINES[currentLineIdx] : null;

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 bg-[#0a0a14] shadow-2xl shadow-primary/10">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111120] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-2 text-xs font-mono text-white/30 flex-1 text-center">terminal — bash</span>
      </div>
      {/* Content */}
      <div className="p-5 font-mono text-sm min-h-[260px]">
        {visibleLines.map((line, i) => (
          <div key={i} className="mb-1">
            {line.type === "prompt" ? (
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">$</span>
                <span className="text-white/90">{line.text}</span>
              </div>
            ) : (
              <div className="text-white/45 pl-4">{line.text}</div>
            )}
          </div>
        ))}
        {currentLine && currentLine.type === "prompt" && (
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 shrink-0">$</span>
            <span className="text-white/90">{currentLine.text.slice(0, currentChar)}</span>
            <span className="w-2 h-4 bg-primary/80 inline-block" style={{ animation: "blink 1s steps(1) infinite" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowStep({ step, cmd, desc, index, total }: { step: number; cmd: string; desc: string; index: number; total: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="flex gap-4 group relative"
    >
      {index < total - 1 && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />
      )}
      <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-mono font-bold text-sm text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-[0_0_20px_hsl(267_83%_66%/0.4)] transition-all duration-300 z-10">
        {step}
      </div>
      <div className="flex-1 rounded-xl border border-border bg-card/60 px-5 py-3.5 group-hover:border-primary/30 group-hover:bg-card transition-all duration-300 mb-3">
        <code className="text-sm font-mono text-primary font-semibold">{cmd}</code>
        {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
      </div>
    </motion.div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, setTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCommands = useMemo(() => {
    return COMMAND_REFERENCE.filter(c => {
      const matchesSearch = !searchQuery || c.cmd.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = !activeCategory || c.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionEls = SECTIONS.map(s => document.getElementById(s.id));
      const pos = window.scrollY + 220;
      let current = SECTIONS[0].id;
      for (const el of sectionEls) {
        if (el && el.offsetTop <= pos) current = el.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary z-50 origin-left" style={{ scaleX }} />

      <div className="flex max-w-[1680px] mx-auto">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-0 h-screen border-r border-border/50 bg-sidebar/80 backdrop-blur-xl">
          {/* Logo */}
          <div className="px-6 pt-7 pb-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-base tracking-tight leading-none">GitLearn</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider mt-0.5">COMPLETE GUIDE</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 flex items-center gap-2 group ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-[0_0_16px_hsl(267_83%_66%/0.12)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_6px_hsl(267_83%_66%/0.8)]" />
                  )}
                  {!isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/10 shrink-0 group-hover:bg-primary/30 transition-colors" />}
                  {section.title}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-4 py-4 border-t border-border/30">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">

          {/* Mobile header */}
          <div className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-sm tracking-tight">GitLearn</span>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-white/5">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* HERO SECTION                                    */}
          {/* ════════════════════════════════════════════════ */}
          <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="orb orb-violet" style={{ top: "-10%", left: "10%" }} />
              <div className="orb orb-cyan" style={{ bottom: "5%", right: "5%" }} />
              <div className="orb orb-pink" style={{ top: "40%", left: "40%" }} />
              <div className="absolute inset-0 grid-bg" />
            </div>

            <div className="relative z-10 w-full px-6 lg:px-16 xl:px-24 py-24 grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-widest uppercase mb-8">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  Complete Learning Guide
                </div>

                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                  <span className="gradient-text">Master</span>
                  <br />
                  <span className="text-foreground">Git &amp;</span>
                  <br />
                  <span className="gradient-text">GitHub.</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
                  A beautifully crafted, interactive handbook for developers learning version control from scratch.
                  Stop memorizing commands — start understanding the machine.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-10">
                  {[
                    { value: "16", label: "Sections" },
                    { value: "30+", label: "Commands" },
                    { value: "Zero", label: "to Pro" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-black gradient-text">{s.value}</div>
                      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollTo("version-control")}
                    className="px-7 py-3.5 rounded-xl font-semibold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:shadow-primary/50 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Start Learning <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollTo("reference")}
                    className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Code2 className="w-4 h-4" /> Command Reference
                  </button>
                  <Link href="/code">
                    <button className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all flex items-center gap-2 text-accent hover:shadow-lg hover:shadow-accent/10">
                      <FileCode2 className="w-4 h-4" /> View Source
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Right: Terminal */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block"
              >
                <TerminalHero />

                {/* Git graph below terminal */}
                <div className="mt-4 rounded-2xl border border-border/40 bg-[#0a0a14] p-5 font-mono text-xs">
                  <p className="text-white/30 mb-3 text-[10px] tracking-widest uppercase">git log --oneline --graph --all</p>
                  <div className="space-y-1.5">
                    {[
                      { sym: "* ", hash: "a3f8c12", branch: "(HEAD → main)", msg: "Merge feature/auth into main" },
                      { sym: "|\\", hash: "",        branch: "",              msg: "" },
                      { sym: "| * ", hash: "b2e9d45", branch: "(feature/auth)", msg: "Implement login UI" },
                      { sym: "| * ", hash: "c1d7f38", branch: "",              msg: "Add password validation" },
                      { sym: "|/",  hash: "",        branch: "",              msg: "" },
                      { sym: "* ",  hash: "d4e5a21", branch: "",              msg: "Add README and project setup" },
                    ].map((line, i) => (
                      <div key={i} className="flex items-center gap-2 leading-relaxed">
                        <span className="text-emerald-400 shrink-0 w-8">{line.sym}</span>
                        {line.hash && <span className="text-amber-400">{line.hash}</span>}
                        {line.branch && <span className="text-primary text-[10px]">{line.branch}</span>}
                        {line.msg && <span className="text-white/50">{line.msg}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════ */}
          {/* ALL SECTIONS                                    */}
          {/* ════════════════════════════════════════════════ */}
          <div className="px-6 lg:px-16 xl:px-24 pb-40 space-y-36">

            {/* VERSION CONTROL */}
            <FadeIn>
              <section id="version-control" className="scroll-mt-24">
                <SectionLabel number="01" label="Foundations" />
                <SectionTitle>What is <span className="gradient-text">Version Control?</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl leading-relaxed">
                  Before learning Git, it helps to understand the problem it solves.
                </p>

                <div className="grid lg:grid-cols-2 gap-6">
                  <GlassCard className="p-8">
                    <p className="font-semibold text-sm text-muted-foreground mb-5 uppercase tracking-wider">Without version control</p>
                    <div className="space-y-3 font-mono text-sm">
                      {["report.docx", "report_final.docx", "report_final_v2.docx", "report_ACTUAL_final.docx"].map((f, i) => (
                        <div key={f} className={`flex items-center gap-3 ${i < 3 ? "text-muted-foreground/50 line-through" : "text-rose-400 line-through"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i < 3 ? "bg-muted-foreground/30" : "bg-rose-400"}`} />
                          {f}
                        </div>
                      ))}
                      <div className="flex items-center gap-3 text-primary font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        report_submit_this_one.docx
                      </div>
                    </div>
                    <p className="mt-5 text-xs text-muted-foreground/60">Sound familiar? Every developer has done this.</p>
                  </GlassCard>

                  <GlassCard className="p-8" glowColor="cyan">
                    <p className="font-semibold text-sm text-accent mb-5 uppercase tracking-wider flex items-center gap-2">
                      <Check className="w-4 h-4" /> With version control
                    </p>
                    <div className="space-y-4">
                      {[
                        { icon: <History className="w-4 h-4 text-primary" />, text: "Track every change over time" },
                        { icon: <GitCommit className="w-4 h-4 text-cyan-400" />, text: "See who changed what and why" },
                        { icon: <RotateCcw className="w-4 h-4 text-emerald-400" />, text: "Revert to any previous state" },
                        { icon: <GitMerge className="w-4 h-4 text-amber-400" />, text: "Collaborate without conflicts" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {item.icon}
                          <span className="text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </section>
            </FadeIn>

            {/* WHAT IS GIT */}
            <FadeIn>
              <section id="what-is-git" className="scroll-mt-24">
                <SectionLabel number="02" label="Core Tool" />
                <SectionTitle>What is <span className="gradient-text">Git?</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl leading-relaxed">
                  Git is a free, open-source <strong className="text-foreground">distributed version control system</strong> created by Linus Torvalds in 2005.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  {[
                    { icon: <Zap className="w-5 h-5" />, title: "Speed", desc: "Operations happen almost instantly, even on huge projects", color: "amber" },
                    { icon: <Layers className="w-5 h-5" />, title: "Distributed", desc: "Full project history lives on your machine — works offline", color: "violet" },
                    { icon: <GitBranch className="w-5 h-5" />, title: "Branching", desc: "Create isolated workspaces without touching the main code", color: "cyan" },
                    { icon: <Shield className="w-5 h-5" />, title: "Integrity", desc: "Cryptographic hashing — history cannot be silently corrupted", color: "emerald" },
                  ].map((card) => {
                    const colorMap: Record<string, string> = {
                      amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                      cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                      emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    };
                    return (
                      <div key={card.title} className="rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(267_83%_66%/0.08)] transition-all duration-300 group">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 border ${colorMap[card.color]}`}>
                          {card.icon}
                        </div>
                        <h3 className="font-bold mb-2">{card.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <GlassCard className="p-8 border-l-4 border-l-primary" glowColor="violet">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Think of Git as a time machine for your code</h3>
                      <div className="space-y-2 text-muted-foreground text-sm">
                        <p>Every <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">commit</code> is a save point you can return to at any time.</p>
                        <p>Every <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-xs">branch</code> is a parallel timeline where you can experiment freely.</p>
                        <p><code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">merge</code> brings timelines back together into one unified history.</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </section>
            </FadeIn>

            {/* WHAT IS GITHUB */}
            <FadeIn>
              <section id="what-is-github" className="scroll-mt-24">
                <SectionLabel number="03" label="The Platform" />
                <SectionTitle>What is <span className="gradient-text">GitHub?</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
                  GitHub is a <strong className="text-foreground">cloud-based hosting platform</strong> built on top of Git — where developers store, share, and collaborate.
                </p>

                <div className="grid lg:grid-cols-2 gap-4 mb-8">
                  <GlassCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <TerminalSquare className="w-5 h-5 text-violet-400" />
                      </div>
                      <h3 className="text-2xl font-black">Git</h3>
                    </div>
                    <div className="space-y-2.5 text-sm text-muted-foreground">
                      {["A tool (software)", "Installed on your computer", "Works completely offline", "Created in 2005 by Linus Torvalds", "Free & open source forever"].map(t => (
                        <div key={t} className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-8" glowColor="cyan">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Github className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="text-2xl font-black">GitHub</h3>
                    </div>
                    <div className="space-y-2.5 text-sm text-muted-foreground">
                      {["A platform (website)", "Lives on the internet", "Requires internet connection", "Founded 2008, acquired by Microsoft 2018", "Free tier + paid plans"].map(t => (
                        <div key={t} className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Key insight:</strong> You can use Git without GitHub. GitHub cannot exist without Git.
                    Git is the engine; GitHub is the dashboard.
                  </p>
                </div>
              </section>
            </FadeIn>

            {/* INSTALLING */}
            <FadeIn>
              <section id="installing" className="scroll-mt-24">
                <SectionLabel number="04" label="Setup" />
                <SectionTitle>Installing <span className="gradient-text">Git</span></SectionTitle>

                <Tabs defaultValue="mac" className="w-full">
                  <TabsList className="flex w-fit mb-8 bg-card border border-border rounded-xl p-1 gap-1">
                    {["mac", "windows", "linux"].map(os => (
                      <TabsTrigger key={os} value={os} className="rounded-lg px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/30 transition-all capitalize">
                        {os === "mac" ? "macOS" : os.charAt(0).toUpperCase() + os.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="mac" className="space-y-4">
                    <GlassCard className="p-6">
                      <p className="text-sm font-semibold text-primary mb-3">Homebrew (recommended)</p>
                      <CodeBlock code="brew install git" />
                      <p className="text-sm text-muted-foreground mt-4">Or download directly: <a href="https://git-scm.com/download/mac" className="text-primary hover:underline" target="_blank" rel="noreferrer">git-scm.com/download/mac</a></p>
                    </GlassCard>
                  </TabsContent>

                  <TabsContent value="windows" className="space-y-4">
                    <GlassCard className="p-6">
                      <ol className="space-y-4">
                        {["Download from git-scm.com/download/win", "Run the installer — default options are fine for beginners", "Git Bash terminal will be installed alongside"].map((step, i) => (
                          <li key={i} className="flex gap-4 text-sm text-muted-foreground">
                            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                            {i === 0 ? <span>Download from <a href="https://git-scm.com/download/win" className="text-primary hover:underline" target="_blank" rel="noreferrer">git-scm.com/download/win</a></span> : <span>{step}</span>}
                          </li>
                        ))}
                      </ol>
                    </GlassCard>
                  </TabsContent>

                  <TabsContent value="linux" className="space-y-6">
                    <GlassCard className="p-6">
                      <p className="text-sm font-semibold text-primary mb-3">Ubuntu / Debian</p>
                      <CodeBlock code={`sudo apt update\nsudo apt install git -y`} />
                    </GlassCard>
                    <GlassCard className="p-6">
                      <p className="text-sm font-semibold text-primary mb-3">Fedora / RHEL</p>
                      <CodeBlock code="sudo dnf install git" />
                    </GlassCard>
                  </TabsContent>
                </Tabs>

                <div className="mt-8">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">Verify the installation</p>
                  <CodeBlock code="git --version" />
                </div>
              </section>
            </FadeIn>

            {/* CONFIGURATION */}
            <FadeIn>
              <section id="configuration" className="scroll-mt-24">
                <SectionLabel number="05" label="Setup" />
                <SectionTitle>Git <span className="gradient-text">Configuration</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl">Before your first commit, tell Git who you are. This information is embedded in every commit.</p>

                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-4">Required — do this once</p>
                    <CodeBlock code={`# Your identity
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"`} />
                  </GlassCard>

                  <GlassCard className="p-6">
                    <p className="text-xs font-mono font-bold text-accent uppercase tracking-widest mb-4">Recommended</p>
                    <CodeBlock code={`# Modern default branch name
git config --global init.defaultBranch main

# Set VS Code as editor
git config --global core.editor "code --wait"

# Enable colored output
git config --global color.ui auto`} />
                  </GlassCard>

                  <div className="overflow-hidden rounded-2xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/60">
                        <tr>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Level</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Flag</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card/40">
                        {[
                          { level: "System", flag: "--system", scope: "All users on the machine" },
                          { level: "Global", flag: "--global", scope: "Your user account (most common)" },
                          { level: "Local", flag: "--local", scope: "Current repository only" },
                        ].map(row => (
                          <tr key={row.level} className="hover:bg-primary/5 transition-colors">
                            <td className="p-4 font-medium">{row.level}</td>
                            <td className="p-4"><code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{row.flag}</code></td>
                            <td className="p-4 text-muted-foreground">{row.scope}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </FadeIn>

            {/* CORE CONCEPTS */}
            <FadeIn>
              <section id="core-concepts" className="scroll-mt-24">
                <SectionLabel number="06" label="Foundation" />
                <SectionTitle>The Three <span className="gradient-text">Areas</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-14 max-w-2xl">Understanding these three areas is the foundation of everything in Git. Every operation moves files between them.</p>

                <div className="grid lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-10">
                  {[
                    {
                      icon: <Code2 className="w-6 h-6 text-blue-400" />,
                      title: "Working Directory",
                      subtitle: "Where you edit",
                      desc: "Your actual files — what you see in your folder. This is where all editing happens.",
                      cmd: "git add",
                      dir: "→",
                      color: "blue",
                      bg: "bg-blue-500/5",
                    },
                    {
                      icon: <Layers className="w-6 h-6 text-amber-400" />,
                      title: "Staging Area",
                      subtitle: "The waiting room",
                      desc: "A preparation zone — you choose which changes to include in the next commit.",
                      cmd: "git commit",
                      dir: "→",
                      color: "amber",
                      bg: "bg-amber-500/5",
                    },
                    {
                      icon: <GitCommit className="w-6 h-6 text-primary" />,
                      title: "Repository",
                      subtitle: "Permanent history",
                      desc: "All your commits stored permanently in the hidden .git folder.",
                      cmd: "git push",
                      dir: "→",
                      color: "violet",
                      bg: "bg-violet-500/5",
                    },
                  ].map((area, i) => (
                    <div key={area.title} className={`p-8 bg-card/80 ${area.bg} hover:bg-card transition-all duration-300`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                          {area.icon}
                        </div>
                        {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground/40 hidden lg:block" />}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-1">{area.subtitle}</p>
                      <h3 className="font-black text-lg mb-3">{area.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{area.desc}</p>
                      <code className="text-xs bg-card border border-border px-2.5 py-1 rounded-lg font-mono text-primary">{area.cmd}</code>
                    </div>
                  ))}
                </div>

                <CodeBlock code={`# The three-step workflow in action:
git add README.md        # Move to Staging Area
git commit -m "Update"   # Move to Repository
git push                 # Upload to GitHub`} />
              </section>
            </FadeIn>

            {/* BASIC COMMANDS */}
            <FadeIn>
              <section id="basic-commands" className="scroll-mt-24">
                <SectionLabel number="07" label="Commands" />
                <SectionTitle>Basic <span className="gradient-text">Git Commands</span></SectionTitle>

                <Accordion type="single" collapsible defaultValue="item-1" className="space-y-3">
                  {[
                    {
                      value: "item-1", title: "Starting a Project",
                      code: `# Initialize a new repository in current folder
git init

# Clone an existing repository from the internet
git clone https://github.com/username/repo.git

# Clone into a custom folder name
git clone https://github.com/username/repo.git my-project`
                    },
                    {
                      value: "item-2", title: "Checking Status & Staging",
                      code: `# See current status of your repository
git status

# Stage a specific file
git add README.md

# Stage all changes in the current directory
git add .

# Stage changes interactively (choose what to include)
git add -p README.md`
                    },
                    {
                      value: "item-3", title: "Committing",
                      code: `# Save a snapshot with a message
git commit -m "Add introduction section to README"

# Stage all tracked files and commit in one step
git commit -am "Fix typo in config section"

# Fix the last commit message
git commit --amend -m "Corrected commit message"`
                    },
                    {
                      value: "item-4", title: "Viewing History",
                      code: `# Full detailed log
git log

# One line per commit (most useful)
git log --oneline

# Visual graph showing all branches
git log --oneline --graph --all

# Filter by author or date
git log --author="Your Name" --since="2024-01-01"

# Search commit messages
git log --grep="fix"`
                    },
                  ].map(item => (
                    <div key={item.value} className="rounded-2xl border border-border bg-card/60 overflow-hidden">
                      <AccordionItem value={item.value} className="border-none">
                        <AccordionTrigger className="px-6 py-5 hover:no-underline font-bold text-base hover:bg-primary/5 transition-colors">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <CodeBlock code={item.code} />
                        </AccordionContent>
                      </AccordionItem>
                    </div>
                  ))}
                </Accordion>
              </section>
            </FadeIn>

            {/* WORKFLOW */}
            <FadeIn>
              <section id="workflow" className="scroll-mt-24">
                <SectionLabel number="08" label="Daily Practice" />
                <SectionTitle>The Git <span className="gradient-text">Workflow</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl">The standard sequence every developer follows every single day.</p>

                <div className="relative pl-2">
                  {[
                    { cmd: "git pull", desc: "Get the latest changes from your team before starting work" },
                    { cmd: "...edit files, write code...", desc: "Do the actual work — add features, fix bugs, write content" },
                    { cmd: "git status", desc: "Check what changed — see which files were modified" },
                    { cmd: "git add .", desc: "Stage all changes and prepare them for the commit" },
                    { cmd: 'git commit -m "your message"', desc: "Save a permanent snapshot with a descriptive message" },
                    { cmd: "git push", desc: "Upload your commits to GitHub for your team to see" },
                  ].map((step, i) => (
                    <WorkflowStep key={i} step={i + 1} cmd={step.cmd} desc={step.desc} index={i} total={6} />
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* BRANCHING */}
            <FadeIn>
              <section id="branching" className="scroll-mt-24">
                <SectionLabel number="09" label="Parallel Work" />
                <SectionTitle>Branching <span className="gradient-text">&amp; Merging</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
                  Branches let you work on features in isolation — without risking the stable codebase.
                </p>

                {/* Branch Diagram */}
                <GlassCard className="p-8 mb-8">
                  <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-widest mb-6">Branch visualization</p>
                  <div className="relative h-40 w-full max-w-2xl mx-auto">
                    <svg className="absolute w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="xMidYMid meet">
                      {/* Main branch line */}
                      <line x1="40" y1="80" x2="760" y2="80" stroke="hsl(267 83% 66% / 0.3)" strokeWidth="2" />
                      {/* Feature branch arc */}
                      <path
                        d="M 240 80 C 280 80, 300 30, 340 30 L 560 30 C 600 30, 620 80, 660 80"
                        fill="none"
                        stroke="hsl(187 85% 50%)"
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        style={{ animation: "dash 3s linear infinite" }}
                      />
                      {/* Main branch commits */}
                      {[80, 240, 660, 760].map((x, i) => (
                        <circle key={i} cx={x} cy="80" r="8" fill="hsl(267 83% 66%)" stroke="hsl(240 18% 8%)" strokeWidth="3"
                          style={{ filter: "drop-shadow(0 0 8px hsl(267 83% 66% / 0.6))" }} />
                      ))}
                      {/* Feature commits */}
                      {[340, 450, 560].map((x, i) => (
                        <circle key={i} cx={x} cy="30" r="8" fill="hsl(187 85% 50%)" stroke="hsl(240 18% 8%)" strokeWidth="3"
                          style={{ filter: "drop-shadow(0 0 8px hsl(187 85% 50% / 0.6))" }} />
                      ))}
                      {/* Labels */}
                      <text x="40" y="105" fill="hsl(267 83% 66% / 0.8)" fontSize="11" fontFamily="monospace" fontWeight="bold">main</text>
                      <text x="340" y="16" fill="hsl(187 85% 50% / 0.9)" fontSize="11" fontFamily="monospace" fontWeight="bold">feature/login</text>
                      <text x="680" y="72" fill="hsl(267 83% 66% / 0.6)" fontSize="10" fontFamily="monospace">merge</text>
                    </svg>
                  </div>
                </GlassCard>

                <CodeBlock code={`# Create and switch to a new branch in one step (most common)
git switch -c feature/login

# List all branches (* marks the current one)
git branch

# Switch to an existing branch
git switch main

# Merge the feature branch back into main
git checkout main
git merge feature/login

# Delete the branch after merging
git branch -d feature/login`} />
              </section>
            </FadeIn>

            {/* WORKING WITH GITHUB */}
            <FadeIn>
              <section id="working-with-github" className="scroll-mt-24">
                <SectionLabel number="10" label="Remote" />
                <SectionTitle>Working with <span className="gradient-text">GitHub</span></SectionTitle>

                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-4">Connecting & Pushing</p>
                    <CodeBlock code={`# Add a remote repository
git remote add origin https://github.com/username/repo.git

# View your remotes
git remote -v

# First push — set the upstream branch
git push -u origin main

# All subsequent pushes
git push`} />
                  </GlassCard>

                  <GlassCard className="p-6" glowColor="cyan">
                    <div className="flex items-center gap-3 mb-6">
                      <GitPullRequest className="w-5 h-5 text-cyan-400" />
                      <p className="font-bold text-base">The Open Source Workflow</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { n: "1", title: "Fork", desc: "Create your own copy on GitHub" },
                        { n: "2", title: "Clone", desc: "Download your fork locally" },
                        { n: "3", title: "Branch", desc: "Create a feature branch" },
                        { n: "4", title: "Commit", desc: "Make and save your changes" },
                        { n: "5", title: "Push", desc: "Upload branch to your fork" },
                        { n: "6", title: "Pull Request", desc: "Request to merge into original" },
                      ].map(s => (
                        <div key={s.n} className="flex gap-3 rounded-xl border border-border bg-card/40 p-4 hover:border-cyan-500/30 transition-colors">
                          <span className="font-mono text-xs font-black text-cyan-400 mt-0.5">{s.n}.</span>
                          <div>
                            <p className="font-semibold text-sm">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </section>
            </FadeIn>

            {/* UNDOING */}
            <FadeIn>
              <section id="undoing" className="scroll-mt-24">
                <SectionLabel number="11" label="Recovery" />
                <SectionTitle>Undoing <span className="gradient-text">Mistakes</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl">Everyone makes mistakes. Git makes them recoverable. Here is exactly which command to use in each situation.</p>

                <div className="overflow-hidden rounded-2xl border border-border mb-8">
                  <table className="w-full text-sm">
                    <thead className="bg-rose-500/5 border-b border-rose-500/20">
                      <tr>
                        <th className="text-left p-4 font-semibold text-rose-400">Situation</th>
                        <th className="text-left p-4 font-semibold text-rose-400">Command</th>
                        <th className="text-left p-4 font-semibold text-rose-400 hidden sm:table-cell">Safe?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card/40">
                      {[
                        { sit: "File not staged, want to discard", cmd: "git restore <file>", safe: "⚠ Irreversible" },
                        { sit: "File staged, want to unstage", cmd: "git restore --staged <file>", safe: "Safe" },
                        { sit: "Last commit wrong message", cmd: "git commit --amend", safe: "Local only" },
                        { sit: "Undo last commit, keep files", cmd: "git reset --soft HEAD~1", safe: "Local only" },
                        { sit: "Undo a pushed commit safely", cmd: "git revert <hash>", safe: "Safe" },
                        { sit: "Temporarily shelve work", cmd: "git stash", safe: "Safe" },
                      ].map(row => (
                        <tr key={row.sit} className="hover:bg-rose-500/5 transition-colors">
                          <td className="p-4 text-muted-foreground">{row.sit}</td>
                          <td className="p-4"><code className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs font-mono">{row.cmd}</code></td>
                          <td className={`p-4 text-xs font-semibold hidden sm:table-cell ${row.safe === "Safe" ? "text-emerald-400" : row.safe === "Local only" ? "text-amber-400" : "text-rose-400"}`}>{row.safe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <CodeBlock code={`# The safest way to undo any commit (even pushed ones)
git revert abc1234 --no-edit

# Undo last commit but keep all your changes
git reset --soft HEAD~1

# Temporarily save work in progress
git stash
git stash pop   # bring it back`} />
              </section>
            </FadeIn>

            {/* COMMAND REFERENCE */}
            <FadeIn>
              <section id="reference" className="scroll-mt-24">
                <SectionLabel number="12" label="Reference" />
                <SectionTitle>Command <span className="gradient-text">Reference</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">Every essential Git command in one searchable, filterable table.</p>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search commands..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 bg-card border-border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!activeCategory ? "bg-primary text-white border-primary shadow-sm shadow-primary/30" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                    >
                      All
                    </button>
                    {Object.keys(CATEGORY_COLORS).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeCategory === cat ? "bg-primary text-white border-primary" : `${CATEGORY_COLORS[cat]} hover:opacity-80`}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Command</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Description</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card/40">
                      <AnimatePresence>
                        {filteredCommands.map(row => (
                          <motion.tr
                            key={row.cmd}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="p-4"><code className="text-primary font-mono text-xs">{row.cmd}</code></td>
                            <td className="p-4 text-muted-foreground text-xs">{row.desc}</td>
                            <td className="p-4 hidden sm:table-cell">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${CATEGORY_COLORS[row.category] || ""}`}>{row.category}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {filteredCommands.length === 0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No commands match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </FadeIn>

            {/* DAILY NOTES */}
            <FadeIn>
              <section id="daily-notes" className="scroll-mt-24">
                <SectionLabel number="13" label="Journal" />
                <SectionTitle>Daily <span className="gradient-text">Notes</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl">A running log of daily learnings — updated as the journey continues.</p>

                <div className="space-y-4">
                  {DAILY_NOTES.map((note, i) => (
                    <FadeIn key={note.day} delay={i * 0.05}>
                      <GlassCard className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-xl font-black text-primary shrink-0">
                            {note.day}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-base">Day {note.day} — {note.title}</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                              {note.covered.map(item => (
                                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                  {item}
                                </div>
                              ))}
                            </div>
                            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                              <p className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-1">Key insight</p>
                              <p className="text-sm text-muted-foreground">{note.insight}</p>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </FadeIn>
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* ROADMAP */}
            <FadeIn>
              <section id="roadmap" className="scroll-mt-24">
                <SectionLabel number="14" label="Progress" />
                <SectionTitle>Learning <span className="gradient-text">Roadmap</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl">Your path from beginner to Git expert — tracked as you go.</p>

                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border to-transparent hidden lg:block" />
                  <div className="space-y-4">
                    {ROADMAP.map((stage, i) => (
                      <FadeIn key={stage.stage} delay={i * 0.08}>
                        <div className="lg:pl-16 relative">
                          <div className={`absolute left-3 top-6 w-6 h-6 rounded-full bg-gradient-to-br ${ROADMAP_COLORS[stage.color]} hidden lg:flex items-center justify-center shadow-lg`}>
                            {stage.completed ? <Check className="w-3 h-3 text-white" /> : <Circle className="w-3 h-3 text-white/60" />}
                          </div>
                          <GlassCard className={`p-6 ${stage.completed ? `border-l-4 border-l-${stage.color}-400` : ""}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="font-black text-lg">{stage.stage}</h3>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${stage.completed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
                                    {stage.completed ? "Completed" : "Upcoming"}
                                  </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                  {stage.tasks.map(task => (
                                    <div key={task} className="flex items-center gap-2 text-sm">
                                      {stage.completed
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                      }
                                      <span className={stage.completed ? "text-muted-foreground" : "text-muted-foreground/50"}>{task}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </GlassCard>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </section>
            </FadeIn>

            {/* RESOURCES */}
            <FadeIn>
              <section id="resources" className="scroll-mt-24">
                <SectionLabel number="15" label="Further Reading" />
                <SectionTitle>Learning <span className="gradient-text">Resources</span></SectionTitle>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl">The best places to go deeper with Git and GitHub.</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Pro Git Book", desc: "The official, free, comprehensive book on Git by Scott Chacon.", url: "https://git-scm.com/book/en/v2", tag: "Free Book", color: "violet" },
                    { title: "Learn Git Branching", desc: "Interactive visual exercises for mastering Git branching concepts.", url: "https://learngitbranching.js.org", tag: "Interactive", color: "cyan" },
                    { title: "GitHub Docs", desc: "Official documentation for everything GitHub-related.", url: "https://docs.github.com", tag: "Official", color: "emerald" },
                    { title: "GitHub Skills", desc: "Project-based courses that teach Git & GitHub through real tasks.", url: "https://skills.github.com", tag: "Courses", color: "amber" },
                    { title: "Atlassian Tutorials", desc: "Beautifully explained Git tutorials from beginner to advanced.", url: "https://www.atlassian.com/git/tutorials", tag: "Tutorials", color: "blue" },
                    { title: "Oh Shit, Git!", desc: "Practical guide for fixing common Git mistakes in plain language.", url: "https://ohshitgit.com", tag: "Quick Reference", color: "rose" },
                  ].map(res => {
                    const tagColors: Record<string, string> = {
                      violet: "bg-violet-500/15 text-violet-400 border-violet-500/20",
                      cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
                      emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
                      amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
                      blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
                      rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
                    };
                    return (
                      <a key={res.title} href={res.url} target="_blank" rel="noreferrer"
                        className="group rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(267_83%_66%/0.1)] transition-all duration-300 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tagColors[res.color]}`}>{res.tag}</span>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{res.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{res.desc}</p>
                      </a>
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* Footer */}
            <div className="text-center pt-20 border-t border-border/30">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm">Built while learning Git &amp; GitHub from scratch.</p>
              <p className="gradient-text font-bold mt-2">Keep committing. Keep growing.</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
