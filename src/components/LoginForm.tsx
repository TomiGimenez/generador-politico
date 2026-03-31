"use client";

import { useState } from "react";

export default function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            onLogin(data.user);
        } else {
            setError(data.error || "Error al iniciar sesión");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #0B1120 0%, #101827 40%, #0E1525 100%)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(203,166,82,0.2)", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px", textAlign: "center" }}>
                <h2 style={{ color: "#E2E8F0", marginBottom: "20px", fontSize: "24px" }}>Iniciar Sesión</h2>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: "12px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.3)", borderRadius: "8px", color: "white", outline: "none" }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: "12px", background: "rgba(2,6,23,0.5)", border: "1px solid rgba(100,116,139,0.3)", borderRadius: "8px", color: "white", outline: "none" }}
                    />
                    {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>{error}</p>}
                    <button
                        type="submit"
                        style={{ background: "#CBA652", color: "#0B1120", padding: "12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "8px" }}
                    >
                        Ingresar a Huella Propia
                    </button>
                </form>
            </div>
        </div>
    );
}
