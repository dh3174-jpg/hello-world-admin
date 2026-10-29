import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProvidersManager from "./providers-manager";

export default async function LLMProvidersPage() {
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
        redirect("/");
    }

    const { data: providers, error } = await supabase
        .from("llm_providers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    background: "#050505",
                    color: "#ffffff",
                    padding: "40px",
                }}
            >
                <p>Error loading LLM providers: {error.message}</p>
            </main>
        );
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                padding: "40px",
            }}
        >
            <div
                style={{
                    maxWidth: "1300px",
                    margin: "0 auto",
                }}
            >
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "60px",
                        gap: "20px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <p
                            style={{
                                color: "#a78bfa",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                marginBottom: "20px",
                            }}
                        >
                            HELLO WORLD ADMIN
                        </p>

                        <h1
                            style={{
                                fontSize: "48px",
                                margin: 0,
                                fontWeight: 500,
                            }}
                        >
                            LLM Providers
                        </h1>
                    </div>

                    <nav
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <a href="/" style={{ color: "#bdbdbd", textDecoration: "none" }}>
                            Dashboard
                        </a>

                        <a
                            href="/ai-generation-examples"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            AI Examples
                        </a>

                        <a
                            href="/generation-requests"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            Requests
                        </a>

                        <a
                            href="/terms"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            Terms
                        </a>
                    </nav>
                </header>

                <section>
                    <h2
                        style={{
                            fontSize: "30px",
                            marginBottom: "8px",
                        }}
                    >
                        Provider Directory
                    </h2>

                    <p
                        style={{
                            color: "#a3a3a3",
                            marginBottom: "32px",
                        }}
                    >
                        Manage AI providers available to the caption system.
                    </p>

                    <ProvidersManager initialProviders={providers || []} />
                </section>
            </div>
        </main>
    );
}