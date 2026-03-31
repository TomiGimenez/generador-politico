import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // 1. Buscar en tu tabla de usuarios
        const { data: user, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // 2. Verificar el hash del password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // 3. Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, nombre: user.nombre },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        // 4. Guardar token en cookie httpOnly por seguridad
        const response = NextResponse.json({ success: true, user: { id: user.id, nombre: user.nombre } });
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: "/",
        });

        return response;
    } catch (err: any) {
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
