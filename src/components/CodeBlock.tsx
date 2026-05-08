import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "bash", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden bg-[#0d1117] border border-white/10 my-6 shadow-xl", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        {language && (
          <span className="text-xs font-mono text-white/40 uppercase">{language}</span>
        )}
      </div>
      <div className="relative">
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-blue-300">
            {code.split('\n').map((line, i) => {
              if (line.startsWith('#')) {
                return <span key={i} className="text-green-500/60 block">{line}</span>;
              }
              if (line.startsWith('git ')) {
                return (
                  <span key={i} className="block">
                    <span className="text-primary font-bold">git</span>{' '}
                    <span className="text-blue-300">{line.slice(4)}</span>
                  </span>
                );
              }
              return <span key={i} className="block">{line || ' '}</span>;
            })}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
          title="Copy code"
          data-testid={`button-copy-code-${language}`}
        >
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
