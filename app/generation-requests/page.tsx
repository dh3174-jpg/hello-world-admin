import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function GenerationRequestsPage() {
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

    const { data: requests, error } = await supabase
        .from("generation_requests")
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
                <p>Error loading generation requests: {error.message}</p>
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
                            Generation Requests
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
                            href="/captions"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            Captions
                        </a>

                        <a
                            href="/users"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            Users
                        </a>

                        <a
                            href="/prompt-chains"
                            style={{ color: "#bdbdbd", textDecoration: "none" }}
                        >
                            Prompt Chains
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
                                Request Log
                            </h2>

                            <p
                                style={{
                                    color: "#a3a3a3",
                                    margin: 0,
                                }}
                            >
                                Review caption-generation requests submitted to the system.
                            </p>
                        </div>

                        <p style={{ color: "#bdbdbd" }}>
                            {requests?.length ?? 0} total
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gap: "18px",
                        }}
                    >
                        {requests?.map((request) => (
                            <div
                                key={request.id}
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
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p
                                            style={{
                                                color: "#a78bfa",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                margin: "0 0 8px",
                                            }}
                                        >
                                            GENERATION REQUEST
                                        </p>

                                        <h3
                                            style={{
                                                fontSize: "21px",
                                                margin: "0 0 12px",
                                            }}
                                        >
                                            {request.prompt || "No prompt provided"}
                                        </h3>

                                        <p
                                            style={{
                                                color: "#737373",
                                                margin: 0,
                                                fontSize: "14px",
                                            }}
                                        >
                                            {request.created_at
                                                ? new Date(
                                                    request.created_at
                                                ).toLocaleString()
                                                : "No date"}
                                        </p>
                                    </div>

                                    <span
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "999px",
                                            border:
                                                request.status === "completed"
                                                    ? "1px solid rgba(167, 139, 250, 0.45)"
                                                    : "1px solid #4a4a4a",
                                            background:
                                                request.status === "completed"
                                                    ? "rgba(167, 139, 250, 0.10)"
                                                    : "#111111",
                                            color:
                                                request.status === "completed"
                                                    ? "#c4b5fd"
                                                    : "#d4d4d4",
                                            fontSize: "13px",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {request.status || "unknown"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {requests?.length === 0 && (
                        <p
                            style={{
                                color: "#737373",
                                marginTop: "30px",
                            }}
                        >
                            No generation requests found.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}