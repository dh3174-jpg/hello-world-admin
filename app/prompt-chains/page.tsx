import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PromptChainsPage() {
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

    const { data: promptChains, error } = await supabase
        .from("prompt_chains")
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
                <p>Error loading prompt chains: {error.message}</p>
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
                        flexWrap: "wrap",
                        gap: "20px",
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
                            Prompt Chains
                        </h1>
                    </div>

                    <nav
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <a
                            href="/"
                            style={{
                                color: "#f5f5f5",
                                textDecoration: "none",
                            }}
                        >
                            Dashboard
                        </a>

                        <a
                            href="/users"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Users
                        </a>

                        <a
                            href="/captions"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Captions
                        </a>

                        <a
                            href="/votes"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Votes
                        </a>
                    </nav>
                </header>

                <section>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "28px",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontSize: "30px",
                                    marginBottom: "8px",
                                }}
                            >
                                Prompt Chain Library
                            </h2>

                            <p
                                style={{
                                    color: "#a3a3a3",
                                    margin: 0,
                                }}
                            >
                                Review the prompt chains available to the AI system.
                            </p>
                        </div>

                        <p
                            style={{
                                color: "#bdbdbd",
                            }}
                        >
                            {promptChains?.length ?? 0} total
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gap: "18px",
                        }}
                    >
                        {promptChains?.map((chain) => (
                            <div
                                key={chain.id}
                                style={{
                                    border: "1px solid #2f2f2f",
                                    borderRadius: "18px",
                                    background: "#0a0a0a",
                                    padding: "24px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "20px",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                color: "#a78bfa",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                margin: "0 0 8px",
                                            }}
                                        >
                                            PROMPT CHAIN
                                        </p>

                                        <h3
                                            style={{
                                                fontSize: "22px",
                                                margin: "0 0 10px",
                                            }}
                                        >
                                            {chain.name}
                                        </h3>

                                        <p
                                            style={{
                                                color: "#bdbdbd",
                                                margin: 0,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {chain.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    <span
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "999px",
                                            border: "1px solid #3a3a3a",
                                            color: "#c4b5fd",
                                            fontSize: "13px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Read only
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {promptChains?.length === 0 && (
                        <p
                            style={{
                                color: "#737373",
                                marginTop: "30px",
                            }}
                        >
                            No prompt chains found.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}