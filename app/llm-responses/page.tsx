import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LLMResponsesPage() {
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

    const { data: responses, error } = await supabase
        .from("llm_responses")
        .select(`
id,
    response_text,
    created_at,
    generation_request_id,
    llm_model_id,
    generation_requests (
        prompt,
        status
    ),
    llm_models (
        name,
        model_identifier
    )
        `)
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
                <p>Error loading LLM responses: {error.message}</p>
            </main>
        );
    }

    const normalizedResponses =
        responses?.map((response: any) => ({
            id: response.id,
            response_text: response.response_text,
            created_at: response.created_at,
            request_prompt:
                response.generation_requests?.prompt || "No request found",
            request_status:
                response.generation_requests?.status || "unknown",
            model_name:
                response.llm_models?.name || "Unknown model",
            model_identifier:
                response.llm_models?.model_identifier || "No identifier",
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
                            LLM Responses
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
                            href="/llm-models"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Models
                        </a>

                        <a
                            href="/llm-providers"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Providers
                        </a>

                        <a
                            href="/generation-requests"
                            style={{
                                color: "#bdbdbd",
                                textDecoration: "none",
                            }}
                        >
                            Requests
                        </a>
                    </nav>
                </header>

                <section>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                            flexWrap: "wrap",
                            marginBottom: "30px",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontSize: "30px",
                                    marginBottom: "8px",
                                }}
                            >
                                AI Response Log
                            </h2>

                            <p
                                style={{
                                    color: "#a3a3a3",
                                    margin: 0,
                                }}
                            >
                                Review responses returned by AI models for
                                generation requests.
                            </p>
                        </div>

                        <p
                            style={{
                                color: "#bdbdbd",
                            }}
                        >
                            {normalizedResponses.length} total
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gap: "20px",
                        }}
                    >
                        {normalizedResponses.map((response) => (
                            <div
                                key={response.id}
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
                                        alignItems: "flex-start",
                                        gap: "20px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p
                                            style={{
                                                color: "#a78bfa",
                                                fontSize: "12px",
                                                fontWeight: 700,
                                                margin: "0 0 8px",
                                            }}
                                        >
                                            ORIGINAL REQUEST
                                        </p>

                                        <p
                                            style={{
                                                fontSize: "17px",
                                                margin: "0 0 22px",
                                            }}
                                        >
                                            {response.request_prompt}
                                        </p>

                                        <p
                                            style={{
                                                color: "#a78bfa",
                                                fontSize: "12px",
                                                fontWeight: 700,
                                                margin: "0 0 8px",
                                            }}
                                        >
                                            AI RESPONSE
                                        </p>

                                        <p
                                            style={{
                                                fontSize: "21px",
                                                lineHeight: 1.5,
                                                margin: "0 0 24px",
                                            }}
                                        >
                                            {response.response_text ||
                                                "No response text"}
                                        </p>

                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        padding: "7px 11px",
                                                        borderRadius: "999px",
                                                        background:
                                                            "rgba(167, 139, 250, 0.10)",
                                                        border:
                                                            "1px solid rgba(167, 139, 250, 0.35)",
                                                        color: "#c4b5fd",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    {response.model_name}
                                                </span>

                                                <span
                                                    style={{
                                                        padding: "7px 11px",
                                                        borderRadius: "999px",
                                                        background: "#111111",
                                                        border:
                                                            "1px solid #333333",
                                                        color: "#bdbdbd",
                                                        fontSize: "13px",
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {response.request_status}
                                                </span>
                                            </div>

                                            <p
                                                style={{
                                                    color: "#737373",
                                                    fontSize: "13px",
                                                    margin: "12px 0 0",
                                                }}
                                            >
                                                Model ID:{" "}
                                                {response.model_identifier}
                                            </p>
                                        </div>

                                        <p
                                            style={{
                                                color: "#737373",
                                                margin: "18px 0 0",
                                                fontSize: "14px",
                                            }}
                                        >
                                            {response.created_at
                                                ? new Date(
                                                      response.created_at
                                                  ).toLocaleString()
                                                : "No date"}
                                        </p>
                                    </div>

                                    <span
                                        style={{
                                            color: "#737373",
                                            fontSize: "13px",
                                        }}
                                    >
                                        READ ONLY
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {normalizedResponses.length === 0 && (
                        <p
                            style={{
                                color: "#737373",
                                marginTop: "30px",
                            }}
                        >
                            No LLM responses found.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}