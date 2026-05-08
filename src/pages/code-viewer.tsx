import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  Files, Search, GitBranch, Puzzle, Settings,
  ChevronRight, ChevronDown, X, ArrowLeft, AlertCircle,
} from "lucide-react";

/* ── RAW FILE IMPORTS (Vite ?raw) ─────────────────────────── */
// @ts-ignore
import homeTsxRaw      from "./home.tsx?raw";
// @ts-ignore
import codeBlockRaw    from "../components/CodeBlock.tsx?raw";
// @ts-ignore
import appTsxRaw       from "../App.tsx?raw";
// @ts-ignore
import indexCssRaw     from "../index.css?raw";
// @ts-ignore
import mainTsxRaw      from "../main.tsx?raw";

/* ── TYPES ────────────────────────────────────────────────── */
interface FileNode {
  name: string;
  type: "file" | "folder";
  language?: string;
  raw?: string;
  children?: FileNode[];
}

interface OpenTab {
  path: string;
  name: string;
  raw: string;
  language: string;
}

/* ── FILE TREE DATA ───────────────────────────────────────── */
const FILE_TREE: FileNode[] = [
  {
    name: "src", type: "folder",
    children: [
      {
        name: "pages", type: "folder",
        children: [
          { name: "home.tsx",        type: "file", language: "tsx", raw: homeTsxRaw },
          { name: "code-viewer.tsx", type: "file", language: "tsx", raw: "(You are viewing the source of this very page!)\n\n// See the full source on disk at src/pages/code-viewer.tsx" },
        ],
      },
      {
        name: "components", type: "folder",
        children: [
          { name: "CodeBlock.tsx", type: "file", language: "tsx", raw: codeBlockRaw },
        ],
      },
      { name: "App.tsx",   type: "file", language: "tsx", raw: appTsxRaw },
      { name: "index.css", type: "file", language: "css", raw: indexCssRaw },
      { name: "main.tsx",  type: "file", language: "tsx", raw: mainTsxRaw },
    ],
  },
];

/* ── SYNTAX TOKENIZER ─────────────────────────────────────── */
interface Token { type: string; text: string }

const TSX_KEYWORDS = new Set([
  "import","export","default","const","let","var","function","return","from",
  "type","interface","if","else","for","while","class","extends","implements",
  "new","this","async","await","typeof","keyof","void","as","in","of",
  "readonly","public","private","protected","static","throw","try","catch",
  "finally","switch","case","break","continue","delete","do","instanceof",
  "super","enum","declare","abstract","namespace","module",
]);
const TSX_LITERALS = new Set(["null","undefined","true","false"]);
const HTML_TAGS = new Set([
  "div","span","p","h1","h2","h3","h4","h5","h6","a","button","input","form",
  "section","article","header","footer","nav","main","aside","ul","li","ol",
  "table","thead","tbody","tr","td","th","pre","code","svg","path","circle",
  "line","text","g","rect","polyline","defs","img","br","hr","label","select",
]);

const TOKEN_COLORS: Record<string, string> = {
  keyword:      "#569cd6",
  literal:      "#569cd6",
  string:       "#ce9178",
  comment:      "#6a9955",
  component:    "#4ec9b0",
  "jsx-tag":    "#4ec9b0",
  "jsx-bracket":"#808080",
  fn:           "#dcdcaa",
  variable:     "#9cdcfe",
  number:       "#b5cea8",
  punct:        "#d4d4d4",
};

function tokenizeTsxLine(line: string, inBC: boolean): [Token[], boolean] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  // Continue block comment from previous line
  if (inBC) {
    const end = line.indexOf("*/");
    if (end === -1) { tokens.push({ type: "comment", text: line }); return [tokens, true]; }
    tokens.push({ type: "comment", text: line.slice(0, end + 2) });
    i = end + 2;
    inBC = false;
  }

  while (i < len) {
    const ch = line[i];

    // Block comment
    if (ch === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      if (end === -1) { tokens.push({ type: "comment", text: line.slice(i) }); return [tokens, true]; }
      tokens.push({ type: "comment", text: line.slice(i, end + 2) }); i = end + 2; continue;
    }
    // Line comment
    if (ch === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", text: line.slice(i) }); break;
    }
    // String / template literal
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch; let j = i + 1;
      while (j < len) {
        if (line[j] === "\\" && q !== "`") { j += 2; continue; }
        if (line[j] === q) { j++; break; }
        j++;
      }
      tokens.push({ type: "string", text: line.slice(i, j) }); i = j; continue;
    }
    // JSX opening angle bracket
    if (ch === "<" && /[a-zA-Z/]/.test(line[i + 1] ?? "")) {
      tokens.push({ type: "jsx-bracket", text: "<" }); i++;
      if (line[i] === "/") { tokens.push({ type: "jsx-bracket", text: "/" }); i++; }
      if (/[a-zA-Z_$]/.test(line[i] ?? "")) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_$.]/.test(line[j])) j++;
        const tag = line.slice(i, j);
        tokens.push({ type: /^[A-Z]/.test(tag) ? "component" : "jsx-tag", text: tag }); i = j;
      }
      continue;
    }
    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let type: string;
      if      (TSX_KEYWORDS.has(word)) type = "keyword";
      else if (TSX_LITERALS.has(word)) type = "literal";
      else if (HTML_TAGS.has(word))    type = "jsx-tag";
      else if (/^[A-Z]/.test(word))   type = "component";
      else if (j < len && line[j] === "(") type = "fn";
      else                             type = "variable";
      tokens.push({ type, text: word }); i = j; continue;
    }
    // Number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < len && /[0-9.xXa-fA-F_]/.test(line[j])) j++;
      tokens.push({ type: "number", text: line.slice(i, j) }); i = j; continue;
    }
    // Everything else
    tokens.push({ type: "punct", text: ch }); i++;
  }
  return [tokens, false];
}

function tokenizeCSSLine(line: string): Token[] {
  if (/^\s*(\/\*|\*)/.test(line)) return [{ type: "comment", text: line }];
  const atMatch = line.match(/^(\s*)(@[\w-]+)(.*)/);
  if (atMatch) return [
    { type: "punct", text: atMatch[1] },
    { type: "keyword", text: atMatch[2] },
    { type: "punct", text: atMatch[3] },
  ];
  const propMatch = line.match(/^(\s*)(--?[\w-]+|[\w-]+)(\s*:\s*)(.*)/);
  if (propMatch) return [
    { type: "punct",    text: propMatch[1] },
    { type: "variable", text: propMatch[2] },
    { type: "punct",    text: propMatch[3] },
    { type: "string",   text: propMatch[4] },
  ];
  return [{ type: "punct", text: line }];
}

/* ── FILE ICON ────────────────────────────────────────────── */
function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <span className="text-[10px] font-black shrink-0 w-4 text-center" style={{ color: "#3b8eea" }}>T</span>;
  if (name.endsWith(".css"))
    return <span className="text-[10px] font-black shrink-0 w-4 text-center" style={{ color: "#cc99cd" }}>C</span>;
  return <span className="text-[10px] shrink-0 w-4 text-center" style={{ color: "#d4d4d4" }}>f</span>;
}

/* ── TREE NODE ────────────────────────────────────────────── */
function TreeNode({ node, depth, activePath, expandedFolders, onToggle, onOpen, parentPath }: {
  node: FileNode; depth: number; activePath: string;
  expandedFolders: Set<string>;
  onToggle: (p: string) => void;
  onOpen: (node: FileNode, path: string) => void;
  parentPath: string;
}) {
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isExpanded = expandedFolders.has(path);
  const isActive   = activePath === path;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => onToggle(path)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className="flex items-center gap-1.5 w-full text-left py-0.5 pr-2 hover:bg-white/5 text-[#cccccc] transition-colors"
        >
          {isExpanded
            ? <ChevronDown  className="w-3 h-3 shrink-0 text-[#858585]" />
            : <ChevronRight className="w-3 h-3 shrink-0 text-[#858585]" />}
          <span className="text-xs truncate">{node.name}</span>
        </button>
        {isExpanded && node.children?.map(child => (
          <TreeNode key={child.name} node={child} depth={depth + 1}
            activePath={activePath} expandedFolders={expandedFolders}
            onToggle={onToggle} onOpen={onOpen} parentPath={path} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpen(node, path)}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={`flex items-center gap-2 w-full text-left py-0.5 pr-2 transition-colors ${
        isActive ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-white/5"
      }`}
    >
      <FileIcon name={node.name} />
      <span className="text-xs truncate">{node.name}</span>
    </button>
  );
}

/* ── RENDERED CODE ────────────────────────────────────────── */
function RenderedCode({ raw, language }: { raw: string; language: string }) {
  const lines = raw.split("\n");
  const elements: JSX.Element[] = [];
  let inBC = false;

  for (let i = 0; i < lines.length; i++) {
    let tokens: Token[];
    if (language === "css") {
      tokens = tokenizeCSSLine(lines[i]);
    } else {
      const [toks, nextBC] = tokenizeTsxLine(lines[i], inBC);
      tokens = toks;
      inBC = nextBC;
    }

    elements.push(
      <div key={i} className="flex group hover:bg-white/[0.025] min-w-max">
        <span className="select-none text-right pr-4 pl-4 w-14 shrink-0 text-[#858585] text-xs leading-6 font-mono group-hover:text-[#aaa]">
          {i + 1}
        </span>
        <span className="pl-4 font-mono text-xs leading-6 whitespace-pre">
          {tokens.length > 0
            ? tokens.map((tok, j) => (
                <span key={j} style={{ color: TOKEN_COLORS[tok.type] ?? "#d4d4d4" }}>{tok.text}</span>
              ))
            : " "}
        </span>
      </div>
    );
  }
  return <>{elements}</>;
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */
const DEFAULT_PATH = "src/pages/home.tsx";

export default function CodeViewer() {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    { path: DEFAULT_PATH, name: "home.tsx", raw: homeTsxRaw, language: "tsx" },
  ]);
  const [activePath, setActivePath] = useState(DEFAULT_PATH);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "src/pages", "src/components"])
  );
  const [sidebarPanel, setSidebarPanel] = useState<"explorer" | "search">("explorer");
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorLine, setCursorLine]   = useState(1);
  const codeRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find(t => t.path === activePath);

  useEffect(() => {
    codeRef.current?.scrollTo({ top: 0 });
    setCursorLine(1);
  }, [activePath]);

  function toggleFolder(path: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  function openFile(node: FileNode, treePath: string) {
    if (!node.raw) return;
    const tabPath = `src/${treePath}`;
    if (!openTabs.find(t => t.path === tabPath)) {
      setOpenTabs(prev => [...prev, { path: tabPath, name: node.name, raw: node.raw!, language: node.language! }]);
    }
    setActivePath(tabPath);
  }

  function closeTab(path: string, e: React.MouseEvent) {
    e.stopPropagation();
    const idx = openTabs.findIndex(t => t.path === path);
    const next = openTabs.filter(t => t.path !== path);
    setOpenTabs(next);
    if (activePath === path && next.length > 0) {
      setActivePath(next[Math.max(0, idx - 1)].path);
    }
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !activeTab) return [];
    const q = searchQuery.toLowerCase();
    return activeTab.raw
      .split("\n")
      .map((line, i) => ({ line, lineNum: i + 1 }))
      .filter(({ line }) => line.toLowerCase().includes(q));
  }, [searchQuery, activeTab]);

  // The tree activePath comparison uses the path WITHOUT "src/" prefix
  // because TreeNode paths are built from the FILE_TREE starting at "src"
  const treeActivePath = activePath.startsWith("src/")
    ? activePath.slice(4)   // "src/pages/home.tsx" → "pages/home.tsx"
    : activePath;

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none" style={{ background: "#1e1e1e", color: "#d4d4d4", fontFamily: "'Cascadia Code','Fira Code',Menlo,monospace" }}>

      {/* ── TITLE BAR ── */}
      <div className="h-9 flex items-center gap-3 px-4 shrink-0 border-b border-black/30" style={{ background: "#3c3c3c" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
        </div>
        <div className="flex-1 text-center text-[11px]" style={{ color: "#aaaaaa" }}>
          {activeTab?.name ?? "GitLearn"} — GitLearn — Visual Studio Code
        </div>
        <Link href="/">
          <button className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded transition-colors hover:bg-white/10" style={{ color: "#aaaaaa" }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Guide
          </button>
        </Link>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ── ACTIVITY BAR ── */}
        <div className="w-12 flex flex-col items-center pt-2 gap-1 shrink-0 border-r border-black/20" style={{ background: "#333333" }}>
          {([
            { id: "explorer", Icon: Files,  title: "Explorer" },
            { id: "search",   Icon: Search, title: "Search"   },
          ] as const).map(({ id, Icon, title }) => (
            <button
              key={id}
              title={title}
              onClick={() => setSidebarPanel(id)}
              className="w-12 h-12 flex items-center justify-center transition-colors"
              style={{
                color: sidebarPanel === id ? "#ffffff" : "#858585",
                borderLeft: sidebarPanel === id ? "2px solid #ffffff" : "2px solid transparent",
              }}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
          <div className="flex-1" />
          {([GitBranch, Puzzle, Settings] as const).map((Icon, i) => (
            <button key={i} className="w-12 h-12 flex items-center justify-center transition-colors" style={{ color: "#858585" }}>
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="w-60 flex flex-col shrink-0 border-r border-black/20 overflow-hidden" style={{ background: "#252526" }}>

          {sidebarPanel === "explorer" && (
            <>
              <div className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-b border-black/10" style={{ color: "#bbbbbb" }}>
                Explorer
              </div>
              <div className="px-3 py-1 text-[10px] tracking-wider uppercase" style={{ color: "#bbbbbb" }}>
                GIT-GITHUB-GUIDE
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {FILE_TREE.map(node => (
                  <TreeNode
                    key={node.name} node={node} depth={0}
                    activePath={treeActivePath}
                    expandedFolders={expandedFolders}
                    onToggle={toggleFolder}
                    onOpen={openFile}
                    parentPath=""
                  />
                ))}
              </div>
            </>
          )}

          {sidebarPanel === "search" && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-b border-black/10" style={{ color: "#bbbbbb" }}>
                Search in File
              </div>
              <div className="px-3 py-2">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="w-full text-xs px-2 py-1.5 rounded outline-none border"
                  style={{ background: "#3c3c3c", color: "#d4d4d4", borderColor: "#505050" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#007acc")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#505050")}
                />
              </div>
              <div className="px-4 text-[10px] pb-1" style={{ color: "#858585" }}>
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              <div className="flex-1 overflow-y-auto px-2" style={{ scrollbarWidth: "none" }}>
                {searchResults.map(({ line, lineNum }) => (
                  <button
                    key={lineNum}
                    onClick={() => {
                      const el = codeRef.current?.children[lineNum - 1] as HTMLElement | undefined;
                      el?.scrollIntoView({ block: "center" });
                      setCursorLine(lineNum);
                      setSidebarPanel("explorer");
                    }}
                    className="w-full text-left px-2 py-1 rounded text-[10px] truncate hover:bg-white/5 transition-colors font-mono"
                    style={{ color: "#cccccc" }}
                  >
                    <span className="mr-2" style={{ color: "#858585" }}>{lineNum}</span>
                    {line.trim()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── EDITOR ── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Tab bar */}
          <div className="flex overflow-x-auto shrink-0 border-b border-black/30" style={{ background: "#2d2d2d", scrollbarWidth: "none" }}>
            {openTabs.map(tab => {
              const isActive = tab.path === activePath;
              return (
                <div
                  key={tab.path}
                  onClick={() => setActivePath(tab.path)}
                  className="flex items-center gap-2 px-4 py-2 text-xs border-r border-black/20 cursor-pointer shrink-0 transition-colors"
                  style={{
                    background: isActive ? "#1e1e1e" : "#2d2d2d",
                    color: isActive ? "#ffffff" : "#969696",
                    borderTop: isActive ? "1px solid #007acc" : "1px solid transparent",
                  }}
                >
                  <FileIcon name={tab.name} />
                  <span>{tab.name}</span>
                  <button
                    onClick={e => closeTab(tab.path, e)}
                    className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                    style={{ color: "#969696" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Breadcrumb */}
          {activeTab && (
            <div className="flex items-center gap-1 px-4 py-1 text-[11px] shrink-0 border-b border-black/10" style={{ background: "#1e1e1e", color: "#858585" }}>
              {activeTab.path.split("/").map((part, i, arr) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  <span style={{ color: i === arr.length - 1 ? "#cccccc" : "#858585" }}>{part}</span>
                </span>
              ))}
            </div>
          )}

          {/* Code */}
          {activeTab ? (
            <div
              ref={codeRef}
              className="flex-1 overflow-auto pb-20"
              style={{ background: "#1e1e1e", scrollbarWidth: "thin", scrollbarColor: "#424242 #1e1e1e" }}
            >
              <RenderedCode raw={activeTab.raw} language={activeTab.language} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: "#858585" }}>
              <Files className="w-16 h-16 opacity-20" />
              <p className="text-sm">Select a file from the explorer</p>
            </div>
          )}
        </div>

        {/* ── MINIMAP ── */}
        {activeTab && (
          <div className="w-24 shrink-0 overflow-hidden hidden xl:block relative border-l border-black/10" style={{ background: "#1e1e1e" }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25" style={{ fontSize: "2px", lineHeight: "3.5px" }}>
              {activeTab.raw.split("\n").map((line, i) => (
                <div key={i} className="whitespace-pre px-1 text-[#6a9955]">{line.slice(0, 80)}</div>
              ))}
            </div>
            <div className="absolute right-0 top-0 w-2 h-10 rounded-sm opacity-40" style={{ background: "#007acc" }} />
          </div>
        )}
      </div>

      {/* ── STATUS BAR ── */}
      <div className="h-6 flex items-center px-3 gap-4 shrink-0 text-white text-[11px]" style={{ background: "#007acc" }}>
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>0 &nbsp; ⚠ 0</span>
        </div>
        <div className="flex-1" />
        <span>Ln {cursorLine}, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>{activeTab?.language?.toUpperCase() ?? "TSX"}</span>
        <span className="opacity-70">GitLearn Source</span>
      </div>
    </div>
  );
}
