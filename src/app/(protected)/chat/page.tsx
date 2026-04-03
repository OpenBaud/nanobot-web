"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/lib/LanguageContext";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "NANOBOT AGENT INITIALIZED.\n\nAwaiting input sequence...",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newUserMsg.content })
      });
      
      const data = await res.json();
      
      const newAgentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.response || `ERROR: ${data.error}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, newAgentMsg]);
    } catch (e: any) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `CONNECTION_FAILURE: ${e.message}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background font-mono min-h-0 relative">
      {/* Header */}
      <div className="shrink-0 px-4 md:px-6 py-4 border-b border-border flex items-center justify-between uppercase tracking-widest text-[10px] md:text-xs font-bold text-muted-foreground bg-background z-10 sticky top-0">
        <span>{t("chat.title")}</span>
        <span className="text-[9px] md:text-[10px]">{t("chat.session")}</span>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 md:space-y-8 scroll-smooth pb-32">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col w-full max-w-4xl ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
          >
            <div className="flex items-center gap-3 mb-2 text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{msg.role === "user" ? t("chat.user") : t("chat.agent")}</span>
              <span className="opacity-50">{msg.timestamp}</span>
            </div>
            <div 
              className={`p-3 md:p-4 text-[13px] md:text-sm leading-relaxed w-full sm:w-auto sm:max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-foreground text-background" 
                  : "bg-transparent border-l-2 border-border text-foreground pl-4"
              }`}
            >
              {msg.role === "agent" ? (
                <div className="prose prose-invert prose-p:my-2 prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-none max-w-none prose-sm md:prose-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col max-w-4xl mr-auto items-start">
             <div className="flex items-center gap-3 mb-2 text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{t("chat.agent")}</span>
            </div>
            <div className="py-4 pl-4 border-l-2 border-primary text-foreground text-sm flex items-center gap-3">
              <span className="w-1.5 h-4 bg-primary animate-pulse"></span>
              <span className="uppercase tracking-widest text-[10px] md:text-xs">{t("chat.processing")}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border bg-background p-4 md:p-6 z-10 sticky bottom-0">
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 border border-border bg-card focus-within:border-foreground transition-colors">
            <span className="text-foreground font-bold">{">"}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] md:text-sm placeholder:text-muted-foreground/30 text-foreground"
              disabled={isLoading}
              autoFocus
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="shrink-0 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-background bg-foreground px-3 md:px-4 py-1.5 hover:bg-muted-foreground transition-colors disabled:opacity-0"
            >
              {t("chat.execute")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
