"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Smile,
  ArrowLeft,
  CheckCircle2,
  Star,
  Loader2,
} from "lucide-react";

interface ConversationPartner {
  id: string;
  name: string;
  slug: string;
  role: string;
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  online?: boolean;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string; slug: string };
  recipient: { _id: string; name: string; slug: string };
  content: string;
  isRead: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  talent: "from-amber-500 to-orange-600",
  crew: "from-blue-500 to-indigo-600",
  producer: "from-teal-500 to-cyan-600",
  agency: "from-purple-500 to-violet-600",
  brand: "from-green-500 to-emerald-600",
};

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() || "?";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const [me, setMe] = useState<{ id: string; name: string; role: string } | null>(null);
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ConversationPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load current user
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setMe({ id: d.user._id || d.user.id, name: d.user.name, role: d.user.role });
      })
      .catch(() => {});
  }, []);

  // Build conversation list from sent+received
  const loadPartners = useCallback(async () => {
    try {
      const r = await fetch("/api/messages");
      if (!r.ok) return;
      const { sent, received } = await r.json();

      const map = new Map<string, ConversationPartner>();

      (received || []).forEach((m: Message) => {
        const s = m.sender;
        if (!s) return;
        const existing = map.get(s._id);
        if (!existing) {
          map.set(s._id, {
            id: s._id,
            name: s.name,
            slug: s.slug,
            role: "talent",
            lastMessage: m.content,
            lastTime: m.createdAt,
            unread: m.isRead ? 0 : 1,
          });
        } else {
          if (!m.isRead) existing.unread = (existing.unread || 0) + 1;
        }
      });

      (sent || []).forEach((m: Message) => {
        const r2 = m.recipient;
        if (!r2) return;
        if (!map.has(r2._id)) {
          map.set(r2._id, {
            id: r2._id,
            name: r2.name,
            slug: r2.slug,
            role: "talent",
            lastMessage: m.content,
            lastTime: m.createdAt,
            unread: 0,
          });
        }
      });

      const list = Array.from(map.values()).sort((a, b) =>
        new Date(b.lastTime || 0).getTime() - new Date(a.lastTime || 0).getTime()
      );
      setPartners(list);
    } catch {
      // silent
    } finally {
      setLoadingPartners(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (partnerId: string) => {
    setLoadingMessages(true);
    try {
      const r = await fetch(`/api/messages?with=${partnerId}`);
      if (!r.ok) return;
      const { messages: msgs } = await r.json();
      setMessages(msgs || []);
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!activePartner) return;
    loadMessages(activePartner.id);

    // Poll every 5s
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activePartner.id), 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activePartner, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !activePartner || sending) return;
    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: activePartner.id, content: text }),
      });
      if (r.ok) {
        await loadMessages(activePartner.id);
        await loadPartners();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const filteredPartners = partners.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const color = (role: string) => roleColors[role] || "from-zinc-500 to-zinc-600";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-16 overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>
        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-white/8 bg-[oklch(0.09_0_0)] shrink-0`}>
          <div className="p-4 border-b border-white/8">
            <h2 className="text-base font-bold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingPartners ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60">
                  Message someone from their profile to get started.
                </p>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => { setActivePartner(partner); setShowSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left ${activePartner?.id === partner.id ? "bg-white/5 border-r-2 border-primary" : ""}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color(partner.role)} flex items-center justify-center text-white font-bold text-sm`}>
                      {getInitial(partner.name)}
                    </div>
                    {partner.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[oklch(0.09_0_0)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-foreground truncate">{partner.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {partner.lastTime ? formatTime(partner.lastTime) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate pr-2">{partner.lastMessage || ""}</p>
                      {(partner.unread || 0) > 0 && (
                        <span className="w-5 h-5 rounded-full gold-gradient text-black text-xs font-bold flex items-center justify-center shrink-0">
                          {partner.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${!showSidebar || !activePartner ? "hidden md:flex" : "flex"} flex-1 flex-col overflow-hidden`}>
          {activePartner ? (
            <>
              {/* Chat header */}
              <div className="h-16 border-b border-white/8 bg-[oklch(0.09_0_0)] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowSidebar(true)} className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color(activePartner.role)} flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitial(activePartner.name)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{activePartner.name}</span>
                    <p className="text-xs text-muted-foreground capitalize">{activePartner.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-xs text-muted-foreground">Conversation start</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>
                    {messages.map((msg) => {
                      const isMe = me && (msg.sender._id === me.id || msg.sender._id === me.id);
                      return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-[oklch(0.15_0_0)] text-foreground border border-white/8 rounded-bl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMe && (
                                msg.isRead
                                  ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                                  : <Check className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/8 bg-[oklch(0.09_0_0)] shrink-0">
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 text-sm"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    className="w-10 h-10 flex items-center justify-center rounded-xl gold-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a conversation from the sidebar, or visit someone&apos;s profile and click &ldquo;Message&rdquo; to start a new chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
