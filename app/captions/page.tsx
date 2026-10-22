import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CaptionsManager from "./captions-manager";
import AdminNav from "@/app/components/admin-nav";

export default async function CaptionsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) {
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
                    style={{
                        width: "100%",
                        maxWidth: "520px",
                        border: "1px solid #2f2f2f",
                        borderRadius: "24px",
                        background: "#0a0a0a",
                        padding: "36px",
                    }}
                >
                    <p style={{ color: "#a78bfa", fontWeight: 600 }}>
                        ACCESS DENIED
                    </p>

                    <h1>You&apos;re not an admin.</h1>

                    <p style={{ color: "#a3a3a3" }}>
                        This area is restricted to approved superadmins.
                    </p>
                </div>
            </main>
        );
    }

    const { data: captions, error } = await supabase
        .from("generations")
        .select(
            "id, user_id, prompt, generated_text, vibe, favorite, created_at"
        )
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    background: "#050505",
                    color: "#f5f5f5",
                    padding: "40px",
                }}
            >
                <h1>Could not load captions</h1>
                <p>{error.message}</p>
            </main>
        );
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                padding: "32px",
            }}
        >
            <div
                style={{
                    maxWidth: "1180px",
                    margin: "0 auto",
                }}
            >
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "24px",
                        flexWrap: "wrap",
                        marginBottom: "54px",
                    }}
                >
                    <div>
                        <p
                            style={{
                                color: "#a78bfa",
                                fontWeight: 600,
                                marginBottom: "8px",
                            }}
                        >
                            HELLO WORLD ADMIN
                        </p>

                        <h1
                            style={{
                                fontSize: "46px",
                                margin: 0,
                            }}
                        >
                            Captions
                        </h1>
                    </div>

                    <AdminNav />
                </header>

                <section style={{ marginBottom: "32px" }}>
                    <p
                        style={{
                            color: "#a3a3a3",
                            fontSize: "18px",
                            margin: 0,
                        }}
                    >
                        Create, review, edit, and delete AI-generated captions.
                    </p>
                </section>

                <CaptionsManager
                    captions={captions || []}
                    adminUserId={user.id}
                />
            </div>
        </main>
    );
}