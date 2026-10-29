import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MixManager from "./mix-manager";

export default async function PromptChainMixPage() {
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

    const { data: mix, error } = await supabase
        .from("prompt_chain_mix")
        .select(`
            id,
            prompt_chain_id,
            weight,
            active,
            prompt_chains (
                name
            )
        `)
        .order("prompt_chain_id", { ascending: true });

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
                <p>Error loading prompt chain mix: {error.message}</p>
            </main>
        );
    }

    const normalizedMix =
        mix?.map((item: any) => ({
            id: item.id,
            prompt_chain_id: item.prompt_chain_id,
            weight: Number(item.weight),
            active: item.active,
            chain_name: Array.isArray(item.prompt_chains)
                ? item.prompt_chains[0]?.name || "Prompt Chain"
                : item.prompt_chains?.name || "Prompt Chain",
        })) || [];

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
                            Prompt Chain Mix
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
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Dashboard
                        </a>

                        <a
                            href="/prompt-chains"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Prompt Chains
                        </a>

                        <a
                            href="/prompt-chain-steps"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Steps
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
                    </nav>
                </header>

                <section>
                    <h2
                        style={{
                            fontSize: "30px",
                            marginBottom: "8px",
                        }}
                    >
                        Workflow Mix
                    </h2>

                    <p
                        style={{
                            color: "#a3a3a3",
                            marginBottom: "32px",
                        }}
                    >
                        Adjust how strongly each prompt chain is weighted and
                        whether it is currently active.
                    </p>

                    <MixManager initialMix={normalizedMix} />
                </section>
            </div>
        </main>
    );
}