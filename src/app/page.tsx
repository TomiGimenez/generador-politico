"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LoginForm from "@/components/LoginForm";
import ContentCard from "@/components/ContentCard";

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

const EMPTY_PROFILE = {
  nombre: "",
  bloque: "",
  distrito: "",
  partido: "",
  temas: "",
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
  - Nunca inventés datos, cifras o estadísticas específicas
  - El contenido debe posicionar al legislador como protagonista y con conocimiento del tema

  TEMA/EVENTO: ${tema}
  ${contexto ? `CONTEXTO ADICIONAL: ${contexto}` : ""}

  Respondé ÚNICAMENTE con el contenido solicitado.`;
};


export default function Page() {
  const [user, setUser] = useState<{ id: string, nombre: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [tone, setTone] = useState("institucional");
  const [tema, setTema] = useState("");
  const [contexto, setContexto] = useState("");
  const [results, setResults] = useState<{ type: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        setIsCheckingAuth(false);
      });
  }, []);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const generate = async () => {
    if (!tema.trim() || selectedTypes.length === 0 || !user) return;
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
      await supabase.from("historial_contenidos").insert({
        usuario_id: user.id,
        tema,
        contexto,
        tono: tone,
        resultados: newResults,
      });
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  if (isCheckingAuth) return <div style={{ minHeight: "100vh", background: "#0B1120" }} />;

  if (!user) return <LoginForm onLogin={(u) => setUser(u)} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #0B1120 0%, #101827 40%, #0E1525 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Literata:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "-300px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(203,166,82,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "36px 20px" }}>
        {/* Cabecera */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", paddingBottom: "16px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
          <div style={{ color: "#94A3B8", fontSize: "14px" }}>
            Hola, <strong style={{ color: "#E2E8F0" }}>{user.nombre}</strong>
          </div>
          <button
            onClick={() => { document.cookie = "auth_token=; Max-Age=0; path=/"; window.location.reload() }}
            style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            Cerrar Sesión
          </button>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(203,166,82,0.08)", border: "1px solid rgba(203,166,82,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "18px", fontSize: "11px", color: "#CBA652", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600 }}>
            ⚡ MVP — Generador de Contenido Político
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, margin: "0 0 10px 0", background: "linear-gradient(135deg, #FFFFFF 0%, #CBA652 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
            Contenido listo para publicar
          </h1>
        </div>

        {/* Perfil del Legislador */}
        <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(203,166,82,0.12)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, margin: "0 0 16px 0" }}>
            Perfil del Legislador/a
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {(
              [
                { key: "nombre", label: "Nombre", placeholder: "Ej: Dip. María González" },
                { key: "bloque", label: "Bloque", placeholder: "Ej: Bloque Federal" },
                { key: "distrito", label: "Distrito", placeholder: "Ej: Córdoba" },
                { key: "partido", label: "Partido", placeholder: "Ej: Partido Federal" },
                { key: "temas", label: "Temas de trabajo", placeholder: "Ej: Seguridad, Educación, Economía..." },
              ] as const
            ).map((f) => (
              <div key={f.key} style={f.key === "temas" ? { gridColumn: "span 2" } : {}}>
                <label style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{f.label}</label>
                <input
                  value={(profile as any)[f.key]}
                  onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: "100%", marginTop: "4px", padding: "8px 12px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "8px", color: "#E2E8F0", fontSize: "13px", fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Opciones Formulario */}
        <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(203,166,82,0.12)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Tema o evento *</label>
            <input value={tema} onChange={(e) => setTema(e.target.value)} style={{ width: "100%", padding: "12px 16px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "10px", color: "#E2E8F0", outline: "none" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Contexto adicional</label>
            <textarea value={contexto} onChange={(e) => setContexto(e.target.value)} rows={3} style={{ width: "100%", padding: "12px 16px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.15)", borderRadius: "10px", color: "#E2E8F0", outline: "none", resize: "vertical" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, display: "block", marginBottom: "10px" }}>Tipo de contenido *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {CONTENT_TYPES.map((ct) => {
                const selected = selectedTypes.includes(ct.id);
                return (
                  <button key={ct.id} onClick={() => toggleType(ct.id)} style={{ background: selected ? "rgba(203,166,82,0.12)" : "rgba(30,41,59,0.4)", border: `1px solid ${selected ? "rgba(203,166,82,0.4)" : "rgba(100,116,139,0.12)"}`, borderRadius: "10px", padding: "12px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "16px" }}>{ct.icon}</span> <span style={{ color: selected ? "#CBA652" : "#CBD5E1", fontSize: "13px", fontWeight: 600 }}>{ct.label}</span></div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !tema.trim() || selectedTypes.length === 0} style={{ width: "100%", padding: "16px", background: loading || !tema.trim() || selectedTypes.length === 0 ? "rgba(100,116,139,0.15)" : "#CBA652", color: loading || !tema.trim() || selectedTypes.length === 0 ? "#475569" : "#0B1120", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: loading || !tema.trim() || selectedTypes.length === 0 ? "not-allowed" : "pointer", }}>
            {loading ? `⏳ Generando ${progress.current}/${progress.total}: ${progress.label}...` : `Generar contenido`}
          </button>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div ref={resultsRef}>
            <h2 style={{ fontSize: "14px", color: "#CBA652", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700 }}>Contenido generado</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              {results.map((r, i) => (
                <ContentCard key={i} type={r.type} content={r.content} typeInfo={CONTENT_TYPES.find(t => t.id === r.type)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
