"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const signInWithGoogle = async () => {
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div
                className="admin-card"
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    border: "1px solid #2f2f2f",
                    borderRadius: "24px",
                    background: "#0a0a0a",
                    padding: "36px",
                }}
            >
                <p
                    style={{
                        margin: "0 0 32px",
                        fontSize: "22px",
                        fontWeight: 600,
                    }}
                >
                    ✧ hello world admin
                </p>

                <h1
                    style={{
                        margin: "0 0 14px",
                        fontSize: "38px",
                    }}
                >
                    Admin access
                </h1>

                <p
                    style={{
                        color: "#a3a3a3",
                        lineHeight: "1.6",
                        marginBottom: "30px",
                    }}
                >
                    Sign in with Google to access the admin dashboard.
                    Only approved superadmins are allowed.
                </p>

                <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="admin-button"
                    style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1px solid #ffffff",
                        background: "#ffffff",
                        color: "#050505",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Continue with Google
                </button>
            </div>
        </main>
    );
}