import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PromptChainStepsPage() {
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

    const { data: steps, error } = await supabase
        .from("prompt_chain_steps")
        .select(`
id,
    step_order,
    prompt_text,
    prompt_chain_id,
    prompt_chains (
        name
    )
        `)
        .order("prompt_chain_id", { ascending: true })
        .order("step_order", { ascending: true });

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
                <p>Error loading prompt chain steps: {error.message}</p>
            </main>
        );
    }

    const groupedSteps = (steps || []).reduce(
        (
            groups: Record<
                string,
                {
                    chainName: string;
                    steps: any[];
                }
            >,
            step: any
        ) => {
            const chainName = Array.isArray(step.prompt_chains)
                ? step.prompt_chains[0]?.name || "Prompt Chain"
                : step.prompt_chains?.name || "Prompt Chain";

            const key = String(step.prompt_chain_id);

            if (!groups[key]) {
                groups[key] = {
                    chainName,
                    steps: [],
                };
            }

            groups[key].steps.push(step);

            return groups;
        },
        {}
    );

    const groups = Object.values(groupedSteps);

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
                            Prompt Chain Steps
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
                    </nav>
                </header>

                <section>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "34px",
                            gap: "20px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontSize: "30px",
                                    marginBottom: "8px",
                                }}
                            >
                                Workflow Steps
                            </h2>

                            <p
                                style={{
                                    color: "#a3a3a3",
                                    margin: 0,
                                }}
                            >
                                Review the individual steps that make up each AI
                                prompt chain.
                            </p>
                        </div>

                        <p
                            style={{
                                color: "#bdbdbd",
                            }}
                        >
                            {steps?.length ?? 0} total steps
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gap: "34px",
                        }}
                    >
                        {groups.map((group) => (
                            <section
                                key={group.chainName}
                                style={{
                                    display: "grid",
                                    gap: "14px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "20px",
                                        padding: "18px 20px",
                                        borderRadius: "16px",
                                        background:
                                            "rgba(167, 139, 250, 0.08)",
                                        border:
                                            "1px solid rgba(167, 139, 250, 0.22)",
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#c4b5fd",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            PROMPT CHAIN
                                        </p>

                                        <h3
                                            style={{
                                                margin: "6px 0 0",
                                                fontSize: "23px",
                                                fontWeight: 500,
                                                color: "#ffffff",
                                            }}
                                        >
                                            {group.chainName}
                                        </h3>
                                    </div>

                                    <span
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "999px",
                                            background:
                                                "rgba(167, 139, 250, 0.12)",
                                            border:
                                                "1px solid rgba(167, 139, 250, 0.28)",
                                            color: "#c4b5fd",
                                            fontSize: "13px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {group.steps.length} steps
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gap: "14px",
                                    }}
                                >
                                    {group.steps.map((step: any) => (
                                        <div
                                            key={step.id}
                                            style={{
                                                border: "1px solid #2f2f2f",
                                                borderRadius: "18px",
                                                background: "#0a0a0a",
                                                padding: "22px 24px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    gap: "20px",
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
                                                        STEP {step.step_order}
                                                    </p>

                                                    <p
                                                        style={{
                                                            color: "#d4d4d4",
                                                            margin: 0,
                                                            lineHeight: 1.6,
                                                            fontSize: "17px",
                                                        }}
                                                    >
                                                        {step.prompt_text}
                                                    </p>
                                                </div>

                                                <span
                                                    style={{
                                                        padding: "8px 12px",
                                                        borderRadius: "999px",
                                                        border:
                                                            "1px solid #3a3a3a",
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
                            </section>
                        ))}
                    </div>

                    {steps?.length === 0 && (
                        <p
                            style={{
                                color: "#737373",
                                marginTop: "30px",
                            }}
                        >
                            No prompt chain steps found.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}