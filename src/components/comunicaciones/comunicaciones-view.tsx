"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, FolderOpen, Inbox, Info, SendHorizonal, Sparkles, UserRound } from "lucide-react";
import {
  CHANNELS,
  CHANNEL_ORDER,
  QUICK_REPLIES,
  aiSuggestion,
  type Channel,
  type Conversation,
} from "@/lib/comunicaciones/demo";
import { initials } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Bandeja unificada de mensajería (DEMOSTRACIÓN). Tres zonas: resumen por
 * canal (arriba), lista de conversaciones (izquierda) y chat abierto (derecha).
 * Todo el contenido es pre-poblado; "enviar" es local (no sale de verdad).
 *
 * El módulo llena el alto disponible: la lista y el chat tienen su propio
 * scroll interno y la barra de escribir queda anclada al fondo del panel.
 */
export function ComunicacionesView({ conversations: initial }: { conversations: Conversation[] }) {
  const reduced = useReducedMotion();
  const [convs, setConvs] = useState<Conversation[]>(initial);
  const [activeId, setActiveId] = useState<string>(initial[0]?.id ?? "");
  const [mobileChat, setMobileChat] = useState(false);
  const [draft, setDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const active = convs.find((c) => c.id === activeId) ?? convs[0];

  // Conteo "sin leer" por canal para las tarjetas de resumen.
  const unreadByChannel = useMemo(() => {
    const acc: Record<Channel, number> = { whatsapp: 0, instagram: 0, facebook: 0 };
    for (const c of convs) acc[c.channel] += c.unread;
    return acc;
  }, [convs]);

  // Mantener el hilo pegado al fondo (al abrir y al enviar).
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [activeId, active?.messages.length, reduced]);

  function openConversation(id: string) {
    setActiveId(id);
    setMobileChat(true);
    setDraft("");
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function send(text: string) {
    const body = text.trim();
    if (!body || !active) return;
    setConvs((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, time: "ahora", messages: [...c.messages, { from: "out", text: body, time: "ahora" }] }
          : c,
      ),
    );
    setDraft("");
  }

  function redactarConIA() {
    if (!active || aiLoading) return;
    setAiLoading(true);
    setTimeout(() => {
      setDraft(aiSuggestion(active));
      setAiLoading(false);
      inputRef.current?.focus();
    }, 850);
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4 lg:h-[calc(100dvh-8rem)]">
      {/* Encabezado + indicador de canales activos */}
      <div className={cn("flex shrink-0 flex-wrap items-end justify-between gap-3", mobileChat && "hidden lg:flex")}>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Comunicaciones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Todos tus clientes, en un solo lugar.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          3 canales activos
        </div>
      </div>

      {/* Banner de demostración — sutil y elegante */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-2.5 rounded-xl border border-[var(--gold)]/25 bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] px-3.5 py-2.5 text-xs text-foreground/80 sm:text-sm",
          mobileChat && "hidden lg:flex",
        )}
      >
        <Info className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
        <span>
          <span className="font-medium text-foreground">Vista previa</span> — integración de mensajería (demostración).
        </span>
      </div>

      {/* Zona 1: tarjetas-resumen por canal */}
      <div className={cn("grid shrink-0 grid-cols-3 gap-3 sm:gap-4", mobileChat && "hidden lg:grid")}>
        {CHANNEL_ORDER.map((ch) => {
          const meta = CHANNELS[ch];
          const unread = unreadByChannel[ch];
          const Icon = meta.Icon;
          return (
            <div key={ch} className="rounded-2xl glass shadow-layered p-3 sm:p-4">
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10"
                  style={{
                    background: `color-mix(in srgb, ${meta.accent} 15%, transparent)`,
                    color: meta.accent,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${meta.accent} 32%, transparent)`,
                  }}
                >
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-sm">{meta.label}</p>
                  {unread > 0 ? (
                    <p className="text-sm font-semibold tabular text-foreground sm:text-lg">
                      {unread} <span className="text-[11px] font-normal text-muted-foreground sm:text-xs">sin leer</span>
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">Al día</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zonas 2 y 3 — llenan el alto restante */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[330px_1fr]">
        {/* Lista de conversaciones */}
        <div className={cn("min-h-0 lg:block", mobileChat && "hidden")}>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl glass shadow-layered">
            {convs.length === 0 ? (
              <div className="grid flex-1 place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
                    <Inbox className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <p className="mt-3 font-display text-base font-semibold text-foreground">Sin conversaciones</p>
                  <p className="mt-1 text-sm text-muted-foreground">Aquí aparecerán los mensajes de tus clientes.</p>
                </div>
              </div>
            ) : (
            <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
              {convs.map((c) => {
                const isActive = c.id === active?.id;
                const last = c.messages[c.messages.length - 1];
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => openConversation(c.id)}
                      className={cn(
                        "relative flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors",
                        isActive ? "bg-[color-mix(in_srgb,var(--navy)_12%,transparent)]" : "hover:bg-muted/50",
                      )}
                    >
                      {isActive && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-gold" />}
                      <ChannelAvatar nombre={c.contact} channel={c.channel} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn("truncate text-sm text-foreground", c.unread > 0 ? "font-semibold" : "font-medium")}>
                            {c.contact}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={cn("truncate text-xs", c.unread > 0 ? "text-foreground/80" : "text-muted-foreground")}>
                            {last?.from === "out" && <span className="text-muted-foreground">Tú: </span>}
                            {last?.text}
                          </span>
                          {c.unread > 0 && (
                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-[var(--gold-foreground)]">
                              {c.unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        </div>

        {/* Chat abierto */}
        <div className={cn("min-h-0 lg:block", !mobileChat && "hidden")}>
          {active ? (
            <div className="flex h-full flex-col overflow-hidden rounded-2xl glass shadow-layered">
              <ChatHeader conv={active} onBack={() => setMobileChat(false)} />

              {/* Hilo: scroll propio, mensajes anclados al fondo */}
              <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                <div className="flex min-h-full flex-col justify-end gap-2.5">
                  <AnimatePresence initial={false}>
                    {active.messages.map((m, i) => (
                      <motion.div
                        key={`${active.id}-${i}`}
                        initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={cn("flex", m.from === "out" ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[82%] px-4 py-2.5 text-sm sm:max-w-[68%]",
                            m.from === "out"
                              ? "rounded-2xl rounded-br-md bg-navy text-navy-foreground shadow-[0_4px_14px_rgba(15,23,42,0.18)]"
                              : "rounded-2xl rounded-bl-md bg-surface text-foreground ring-1 ring-border shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          <p className={cn("mt-1 text-[10px]", m.from === "out" ? "text-navy-foreground/60" : "text-muted-foreground")}>
                            {m.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Compositor anclado al fondo */}
              <Composer
                key={active.id}
                conv={active}
                draft={draft}
                setDraft={setDraft}
                onSend={() => send(draft)}
                onQuick={(text) => {
                  setDraft(text);
                  inputRef.current?.focus();
                }}
                onAI={redactarConIA}
                aiLoading={aiLoading}
                inputRef={inputRef}
              />
            </div>
          ) : (
            <div className="grid h-full place-items-center rounded-2xl glass shadow-layered text-sm text-muted-foreground">
              Selecciona una conversación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Avatar con badge de canal refinado ─────────────────────────────────── */
function ChannelAvatar({ nombre, channel }: { nombre: string; channel: Channel }) {
  const meta = CHANNELS[channel];
  const Icon = meta.Icon;
  return (
    <span className="relative shrink-0">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy font-display text-sm font-semibold text-gold-on-navy ring-1 ring-[var(--gold-on-navy)]/25">
        {initials(nombre)}
      </span>
      <span
        className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-[var(--surface)]"
        style={{ background: meta.accent }}
      >
        <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.75} />
      </span>
    </span>
  );
}

/* ── Cabecera del chat con vínculo a cliente/caso real ───────────────────── */
function ChatHeader({ conv, onBack }: { conv: Conversation; onBack: () => void }) {
  const meta = CHANNELS[conv.channel];
  const Icon = meta.Icon;
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background/30 px-3.5 py-3 sm:px-5">
      <button
        onClick={onBack}
        aria-label="Volver a la lista"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <ChannelAvatar nombre={conv.contact} channel={conv.channel} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{conv.contact}</p>
        <p className="flex items-center gap-1.5 text-[11px]" style={{ color: meta.accent }}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span className="font-medium">{meta.label}</span>
        </p>
      </div>

      {/* Detalle monster: vínculo a la ficha real del cliente / caso */}
      {conv.clienteId && (
        <div className="hidden flex-wrap items-center justify-end gap-1.5 sm:flex">
          <Link
            href={`/clientes/${conv.clienteId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--navy)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-[var(--gold)]/25 transition-colors hover:ring-[var(--gold)]/50"
          >
            <UserRound className="h-3.5 w-3.5 text-gold" />
            <span className="max-w-[10rem] truncate">{conv.clienteNombre}</span>
          </Link>
          {conv.casoId && (
            <Link
              href={`/casos/${conv.casoId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--navy)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-[var(--gold)]/25 transition-colors hover:ring-[var(--gold)]/50"
            >
              <FolderOpen className="h-3.5 w-3.5 text-gold" />
              <span className="max-w-[10rem] truncate">{conv.casoTitulo}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Compositor ──────────────────────────────────────────────────────────── */
function Composer({
  conv,
  draft,
  setDraft,
  onSend,
  onQuick,
  onAI,
  aiLoading,
  inputRef,
}: {
  conv: Conversation;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onQuick: (text: string) => void;
  onAI: () => void;
  aiLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  // Autoexpandible: la caja crece con el contenido hasta un máximo (~5 líneas)
  // y luego hace scroll interno, para no empujar el chat sin control.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft, inputRef]);

  return (
    <div className="shrink-0 border-t border-border bg-background/40 px-3 py-3 sm:px-4">
      {/* Mobile: vínculo a cliente cuando la cabecera lo oculta */}
      {conv.clienteId && (
        <div className="mb-2 flex items-center gap-1.5 sm:hidden">
          <Link
            href={`/clientes/${conv.clienteId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--navy)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-[var(--gold)]/25"
          >
            <UserRound className="h-3.5 w-3.5 text-gold" />
            <span className="max-w-[8rem] truncate">{conv.clienteNombre}</span>
          </Link>
          {conv.casoId && (
            <Link
              href={`/casos/${conv.casoId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--navy)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-[var(--gold)]/25"
            >
              <FolderOpen className="h-3.5 w-3.5 text-gold" />
              <span className="max-w-[7rem] truncate">{conv.casoTitulo}</span>
            </Link>
          )}
        </div>
      )}

      {/* Respuestas rápidas (chips) */}
      <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={onAI}
          disabled={aiLoading}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-bright)] text-[var(--gold-foreground)] glow-gold",
            aiLoading && "opacity-70",
          )}
        >
          <Sparkles className={cn("h-3.5 w-3.5", aiLoading && "animate-pulse")} />
          {aiLoading ? "Redactando…" : "Redactar con IA"}
        </button>
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.label}
            onClick={() => onQuick(q.build(conv))}
            className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-[var(--gold)]/40 hover:text-foreground"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Entrada + enviar */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Escribe un mensaje…"
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none overflow-y-auto rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          onClick={onSend}
          disabled={!draft.trim()}
          aria-label="Enviar mensaje"
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold-on-navy ring-1 ring-[var(--gold-on-navy)]/30 transition-all",
            draft.trim() ? "hover:glow-gold" : "cursor-not-allowed opacity-50",
          )}
        >
          <SendHorizonal className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
