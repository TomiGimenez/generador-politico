"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const CONTENT_TYPES = [
  { id: "comunicado", label: "Comunicado de Prensa", icon: "📰", desc: "Comunicado oficial para medios" },
  { id: "twitter", label: "Hilo de Twitter/X", icon: "🐦", desc: "Hilo de 3-5 tweets con hashtags" },
  { id: "instagram", label: "Posteo Instagram", icon: "📸", desc: "Caption + hashtags para feed o carrusel" },
  { id: "discurso", label: "Discurso / Intervención", icon: "🎤", desc: "Para recinto, conferencia o acto" },
  { id: "newsletter", label: "Newsletter", icon: "📧", desc: "Resumen semanal para suscriptores" },
  { id: "whatsapp", label: "Mensaje WhatsApp", icon: "💬", desc: "Para difusión por grupos y listas" },
];

const TONES = [
  { id: "institucional", label: "Institucional" },
  { id: "combativo", label: "Combativo" },
  { id: "cercano", label: "Cercano / Empático" },
  { id: "tecnico", label: "Técnico" },
  { id: "emotivo", label: "Emotivo / Inspirador" },
];

const DEFAULT_PROFILE = {
  nombre: "Dip. María González",
  bloque: "Bloque Federal",
  distrito: "Córdoba",
  partido: "Partido Federal",
  temas: "Seguridad, Educación, Economía del Conocimiento",
};

const buildPrompt = (profile: any, contentType: string, tone: string, tema: string, contexto: string) => {
  const typeInstructions: any = {
    comunicado: `Generá un comunicado de prensa profesional. Estructura: Título fuerte (máx 12 palabras), bajada de 1 línea, cuerpo de 3-4 párrafos, cierre con datos de contacto del despacho. Incluí citas textuales del/la legislador/a entre comillas.`,
    twitter: `Generá un hilo de Twitter/X de 4-5 tweets. Cada tweet debe tener máximo 280 caracteres. Numeralos (1/5, 2/5, etc). El primero debe ser el más impactante. Incluí hashtags relevantes en el último tweet. Usá emojis con criterio.`,
    instagram: `Generá un caption para Instagram. Estructura: Hook de apertura (primera línea impactante), desarrollo en 3-4 párrafos cortos, call to action al final. Incluí un bloque de 15-20 hashtags relevantes separados. Sugerí qué tipo de imagen o carrusel acompañaría.`,
    discurso: `Generá un discurso de 3-4 minutos de lectura. Estructura: Apertura con saludo protocolar, introducción que capte atención, desarrollo con datos concretos y argumentos, cierre memorable con llamado a la acción. Incluí marcas de pausa [PAUSA] donde convenga.`,
    newsletter: `Generá una newsletter semanal. Estructura: Asunto del email (máx 60 caracteres), preview text, saludo personalizado, sección principal sobre el tema, 2-3 highlights breves de la semana, cierre con invitación a responder. Tono conversacional.`,
    whatsapp: `Generá un mensaje para difusión por WhatsApp. Máximo 500 caracteres. Debe ser directo, claro y compartible. Incluí 1-2 emojis. Sin links largos. Que invite a reenviar.`,
  };

  return `Eres el jefe de comunicación de ${profile.nombre}, legislador/a del ${profile.bloque}, distrito ${profile.distrito}, ${profile.partido}. Áreas de trabajo: ${profile.temas}.

TAREA: ${typeInstructions[contentType]}

TONO: ${tone}. Adaptá todo el contenido a este tono.

REGLAS GENERALES:
- Escribí en español rioplatense cuando el tono sea cercano, y en español neutro formal para lo institucional
- Nunca inventés datos, cifras o estadísticas específicas — usá marcadores como [DATO] o [CIFRA] donde haga falta verificar
- El contenido debe posicionar al legislador como protagonista y con conocimiento del tema
- Incluí referencias al distrito (${profile.distrito}) cuando sea pertinente
- Si hay oposición al tema, anticipá la posición del legislador con argumentos

TEMA/EVENTO: ${tema}

${contexto ? `CONTEXTO ADICIONAL: ${contexto}` : ""}

Respondé ÚNICAMENTE con el contenido solicitado, sin explicaciones previas ni comentarios posteriores.`;
};

function ContentCard({ content, type }: { content: string, type: string }) {
  const [copied, setCopied] = useState(false);
  const typeInfo = CONTENT_TYPES.find((t) => t.id === type);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.7)",
        border: "1px solid rgba(203,166,82,0.15)",
        borderRadius: "14px",
        overflow: "hidden",
        animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          background: "rgba(203,166,82,0.06)",
          borderBottom: "1px solid rgba(203,166,82,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>{typeInfo?.icon}</span>
          <span style={{ color: "#CBA652", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Outfit', sans-serif" }}>
            {typeInfo?.label}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: copied ? "rgba(74,222,128,0.15)" : "rgba(203,166,82,0.1)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(203,166,82,0.25)"}`,
            color: copied ? "#4ADE80" : "#CBA652",
            fontSize: "12px",
            padding: "6px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      {/* Content */}
      <div
        style={{
          padding: "20px",
          color: "#CBD5E1",
          fontSize: "14px",
          lineHeight: 1.8,
          fontFamily: "'Literata', Georgia, serif",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default function ContentGenerator() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [tone, setTone] = useState("institucional");
  const [tema, setTema] = useState("");
  const [contexto, setContexto] = useState("");
  const [results, setResults] = useState<{type: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const resultsRef = useRef<HTMLDivElement>(null);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!tema.trim() || selectedTypes.length === 0) return;
    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: selectedTypes.length, label: "" });

    const newResults = [];

    for (let i = 0; i < selectedTypes.length; i++) {
      const type = selectedTypes[i];
      const typeInfo = CONTENT_TYPES.find((t) => t.id === type);
      setProgress({ current: i + 1, total: selectedTypes.length, label: typeInfo?.label || "" });

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: buildPrompt(profile, type, tone, tema, contexto),
          }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        newResults.push({ type, content: data.text });
        setResults([...newResults]);
      } catch (err: any) {
        newResults.push({ type, content: `Error al generar: ${err.message}` });
        setResults([...newResults]);
      }
    }

    try {
      // Guardado en Supabase al terminar de generar todo localmente
      await supabase.from("historial_contenidos").insert({
        tema,
        contexto,
        tono: tone,
        resultados: newResults
      });
    } catch (e) {
      console.error("No se pudo guardar en Supabase", e);
    }

    setLoading(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg, #0B1120 0%, #101827 40%, #0E1525 100%)",
        fontFamily: "'Outfit', sans-serif",
        color: "#E2E8F0",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Literata:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Ambient */}
      <div style={{ position: "fixed", top: "-300px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(203,166,82,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "36px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(203,166,82,0.08)", border: "1px solid rgba(203,166,82,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "18px", fontSize: "11px", color: "#CBA652", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600 }}>
            ⚡ MVP — Generador de Contenido Político
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, margin: "0 0 10px 0", background: "linear-gradient(135deg, #FFFFFF 0%, #CBA652 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
            Contenido listo para publicar
          </h1>
          <p style={{ color: "#64748B", fontSize: "15px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6, fontWeight: 400 }}>
            Ingresá un tema o evento y generá comunicados, posteos, discursos y más en segundos.
          </p>
        </div>

        {/* Profile toggle */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)", color: "#94A3B8", fontSize: "12px", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
          >
            {showProfile ? "▾ Ocultar perfil" : "▸ Configurar perfil del legislador/a"}
          </button>
          {showProfile && (
            <div style={{ marginTop: "12px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(203,166,82,0.12)", borderRadius: "12px", padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", animation: "slideUp 0.3s ease" }}>
              <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
              {(
                [
                  { key: "nombre", label: "Nombre" },
                  { key: "bloque", label: "Bloque" },
                  { key: "distrito", label: "Distrito" },
                  { key: "partido", label: "Partido" },
                  { key: "temas", label: "Temas de trabajo" },
                ] as const
              ).map((f) => (
                <div key={f.key} style={f.key === "temas" ? { gridColumn: "span 2" } : {}}>
                  <label style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{f.label}</label>
                  <input
                    value={(profile as any)[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    style={{ width: "100%", marginTop: "4px", padding: "8px 12px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "8px", color: "#E2E8F0", fontSize: "13px", fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main form */}
        <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(203,166,82,0.12)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          {/* Tema */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
              Tema o evento *
            </label>
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej: Aprobación del proyecto de Economía del Conocimiento en comisión"
              style={{ width: "100%", padding: "12px 16px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "10px", color: "#E2E8F0", fontSize: "15px", fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(203,166,82,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(100,116,139,0.15)"}
            />
          </div>

          {/* Contexto */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
              Contexto adicional (opcional)
            </label>
            <textarea
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Datos relevantes, posición del bloque, antecedentes, cifras a incluir..."
              rows={3}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "10px", color: "#E2E8F0", fontSize: "14px", fontFamily: "'Outfit', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
            />
          </div>

          {/* Content types */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "10px" }}>
              Tipo de contenido * (elegí uno o varios)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {CONTENT_TYPES.map((ct) => {
                const selected = selectedTypes.includes(ct.id);
                return (
                  <button
                    key={ct.id}
                    onClick={() => toggleType(ct.id)}
                    style={{
                      background: selected ? "rgba(203,166,82,0.12)" : "rgba(30,41,59,0.4)",
                      border: `1px solid ${selected ? "rgba(203,166,82,0.4)" : "rgba(100,116,139,0.12)"}`,
                      borderRadius: "10px",
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "16px" }}>{ct.icon}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: selected ? "#CBA652" : "#CBD5E1", fontFamily: "'Outfit', sans-serif" }}>{ct.label}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "'Outfit', sans-serif" }}>{ct.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "10px" }}>
              Tono
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    background: tone === t.id ? "rgba(203,166,82,0.15)" : "rgba(30,41,59,0.3)",
                    border: `1px solid ${tone === t.id ? "rgba(203,166,82,0.4)" : "rgba(100,116,139,0.12)"}`,
                    color: tone === t.id ? "#CBA652" : "#94A3B8",
                    fontSize: "12px",
                    padding: "7px 16px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generate}
            disabled={loading || !tema.trim() || selectedTypes.length === 0}
            style={{
              width: "100%",
              padding: "16px",
              background: loading || !tema.trim() || selectedTypes.length === 0
                ? "rgba(100,116,139,0.15)"
                : "linear-gradient(135deg, #CBA652 0%, #A88B3A 100%)",
              color: loading || !tema.trim() || selectedTypes.length === 0 ? "#475569" : "#0B1120",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading || !tema.trim() || selectedTypes.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "0.5px",
              transition: "all 0.3s",
              boxShadow: loading || !tema.trim() || selectedTypes.length === 0 ? "none" : "0 4px 24px rgba(203,166,82,0.25)",
            }}
          >
            {loading
              ? `⏳ Generando ${progress.current}/${progress.total}: ${progress.label}...`
              : `Generar ${selectedTypes.length} ${selectedTypes.length === 1 ? "pieza" : "piezas"} de contenido →`}
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ background: "rgba(30,41,59,0.5)", borderRadius: "8px", height: "6px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #CBA652, #E8D48B)",
                  borderRadius: "8px",
                  width: `${(progress.current / progress.total) * 100}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: "8px", fontSize: "12px", color: "#64748B" }}>
              Generando {progress.label}...
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div ref={resultsRef}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "14px", color: "#CBA652", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700 }}>
                Contenido generado
              </h2>
              <button
                onClick={() => {
                  const all = results.map((r) => {
                    const typeInfo = CONTENT_TYPES.find((t) => t.id === r.type);
                    return `═══ ${typeInfo?.label?.toUpperCase()} ═══\n\n${r.content}`;
                  }).join("\n\n\n");
                  navigator.clipboard.writeText(all);
                }}
                style={{ background: "rgba(203,166,82,0.1)", border: "1px solid rgba(203,166,82,0.25)", color: "#CBA652", fontSize: "12px", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
              >
                Copiar todo
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {results.map((r, i) => (
                <ContentCard key={i} type={r.type} content={r.content} />
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", marginTop: "32px", padding: "20px", borderTop: "1px solid rgba(100,116,139,0.1)", color: "#475569", fontSize: "11px" }}>
              <p style={{ margin: 0 }}>Contenido generado por IA — Huella Propia · Generador de Contenido Político</p>
              <p style={{ margin: "4px 0 0 0" }}>Revisar antes de publicar. Verificar datos marcados con [DATO] o [CIFRA].</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
