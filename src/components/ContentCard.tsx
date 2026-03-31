"use client";

import { useState } from "react";

export default function ContentCard({ content, type, typeInfo }: { content: string, type: string, typeInfo: any }) {
    const [copied, setCopied] = useState(false);

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
                    <span style={{ color: "#CBA652", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
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
                        fontWeight: 600,
                        transition: "all 0.2s",
                    }}
                >
                    {copied ? "✓ Copiado" : "Copiar"}
                </button>
            </div>
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
