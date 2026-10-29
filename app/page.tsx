import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/app/components/admin-nav";

export default async function HomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, is_superadmin")
        .eq("id", user.id)
        .single();

    if (profileError) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    background: "#050505",
                    color: "#f5f5f5",
                    padding: "40px",
                }}
            >
                <h1>Could not load profile</h1>
                <p>{profileError.message}</p>
            </main>
        );
    }

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
                    <p
                        style={{
                            color: "#a78bfa",
                            fontWeight: 600,
                        }}
                    >
                        ACCESS DENIED
                    </p>

                    <h1>You&apos;re not an admin.</h1>

                    <p style={{ color: "#e5e5e5" }}>
                        This area is restricted to approved superadmins.
                    </p>
                </div>
            </main>
        );
    }

    const [
        usersResult,
        captionsResult,
        votesResult,
        upvotesResult,
        downvotesResult,
        recentCaptionsResult,
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("generations")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("votes")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("vote", 1),

        supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("vote", -1),

        supabase
            .from("generations")
            .select("id, generated_text, vibe, created_at")
            .order("created_at", { ascending: false })
            .limit(3),
    ]);

    const fullName =
        [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ") || "Admin";

    const users = usersResult.count ?? 0;
    const captions = captionsResult.count ?? 0;
    const totalVotes = votesResult.count ?? 0;
    const upvotes = upvotesResult.count ?? 0;
    const downvotes = downvotesResult.count ?? 0;

    const ratedVotes = upvotes + downvotes;

    const upvoteRate =
        ratedVotes > 0
            ? (upvotes / ratedVotes) * 100
            : 0;

    const downvoteRate =
        ratedVotes > 0
            ? (downvotes / ratedVotes) * 100
            : 0;

    const recentCaptions = recentCaptionsResult.data ?? [];

    const statCards = [
        {
            label: "Users",
            value: users,
            icon: "users",
        },
        {
            label: "AI Captions",
            value: captions,
            icon: "sparkles",
        },
        {
            label: "Total Votes",
            value: totalVotes,
            icon: "chart",
        },
        {
            label: "Upvotes",
            value: upvotes,
            icon: "up",
        },
        {
            label: "Downvotes",
            value: downvotes,
            icon: "down",
        },
    ];

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                display: "flex",
                alignItems: "flex-start",
            }}
        >
            <AdminNav />

            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "42px 48px 70px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "1180px",
                        margin: "0 auto",
                    }}
                >
                    <header
                        style={{
                            marginBottom: "48px",
                        }}
                    >
                        <p
                            style={{
                                color: "#a78bfa",
                                fontWeight: 600,
                                margin: "0 0 8px",
                                fontSize: "13px",
                                letterSpacing: "0.05em",
                            }}
                        >
                            OVERVIEW
                        </p>

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "46px",
                            }}
                        >
                            Dashboard
                        </h1>
                    </header>

                    <section
                        style={{
                            marginBottom: "36px",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "28px",
                                marginBottom: "8px",
                            }}
                        >
                            Welcome, {fullName}
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#e5e5e5",
                                fontSize: "17px",
                            }}
                        >
                            Your community at a glance.
                        </p>
                    </section>

                    <section className="admin-stats-grid">
                        {statCards.map((card) => (
                            <StatCard
                                key={card.label}
                                label={card.label}
                                value={card.value}
                                icon={card.icon}
                            />
                        ))}
                    </section>

                    <section className="admin-dashboard-panel">
                        <div className="admin-section-heading">
                            <div>
                                <h2>Community Voting</h2>

                                <p>
                                    See how your community responds to
                                    AI-generated captions.
                                </p>
                            </div>

                            <span className="admin-section-tag">
                                {ratedVotes} ratings
                            </span>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            <VotingCircle
                                label="Upvote Rate"
                                rate={upvoteRate}
                                count={upvotes}
                                total={ratedVotes}
                                color="#a78bfa"
                            />

                            <VotingCircle
                                label="Downvote Rate"
                                rate={downvoteRate}
                                count={downvotes}
                                total={ratedVotes}
                                color="#60a5fa"
                            />
                        </div>
                    </section>

                    <section className="admin-dashboard-panel">
                        <div className="admin-section-heading">
                            <div>
                                <h2>Recent AI Captions</h2>

                                <p>
                                    The three newest captions in your
                                    community.
                                </p>
                            </div>

                            <Link
                                href="/captions"
                                className="admin-view-all"
                            >
                                View all captions →
                            </Link>
                        </div>

                        {recentCaptionsResult.error ? (
                            <p style={{ color: "#fca5a5" }}>
                                Could not load recent captions:{" "}
                                {recentCaptionsResult.error.message}
                            </p>
                        ) : recentCaptions.length === 0 ? (
                            <p style={{ color: "#e5e5e5" }}>
                                No captions have been generated yet.
                            </p>
                        ) : (
                            <div className="admin-recent-list">
                                {recentCaptions.map((caption) => (
                                    <div
                                        key={caption.id}
                                        className="admin-recent-item"
                                    >
                                        <p className="admin-recent-caption">
                                            {caption.generated_text}
                                        </p>

                                        <div className="admin-recent-meta">
                                            <span className="admin-vibe-tag">
                                                {caption.vibe || "No vibe"}
                                            </span>

                                            <span>
                                                {new Date(
                                                    caption.created_at
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        timeZone: "UTC",
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function StatCard({
                      label,
                      value,
                      icon,
                  }: {
    label: string;
    value: number;
    icon: string;
}) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-top">
                <span className="admin-stat-label">
                    {label}
                </span>

                <span className="admin-stat-icon">
                    <DashboardIcon name={icon} />
                </span>
            </div>

            <p className="admin-stat-value">
                {value.toLocaleString()}
            </p>
        </div>
    );
}

function VotingCircle({
                          label,
                          rate,
                          count,
                          total,
                          color,
                      }: {
    label: string;
    rate: number;
    count: number;
    total: number;
    color: string;
}) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const filled = (rate / 100) * circumference;

    return (
        <div
            style={{
                background: "#101010",
                border: "1px solid #303030",
                borderRadius: "16px",
                padding: "25px",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            <svg
                viewBox="0 0 140 140"
                role="img"
                aria-label={`${label}: ${Math.round(rate)} percent`}
                style={{
                    width: "100%",
                    maxWidth: "175px",
                    height: "auto",
                }}
            >
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#282828"
                    strokeWidth="13"
                />

                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${circumference}`}
                    transform="rotate(-90 70 70)"
                />

                <text
                    x="70"
                    y="76"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="29"
                    fontWeight="700"
                >
                    {Math.round(rate)}%
                </text>
            </svg>

            <h3
                style={{
                    color,
                    fontSize: "17px",
                    margin: "5px 0 0",
                }}
            >
                {label}
            </h3>

            <p
                style={{
                    color: "#e5e5e5",
                    fontSize: "14px",
                    margin: 0,
                }}
            >
                {count} of {total} votes
            </p>
        </div>
    );
}

function DashboardIcon({ name }: { name: string }) {
    const common = {
        width: 21,
        height: 21,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (name === "users") {
        return (
            <svg {...common} aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        );
    }

    if (name === "sparkles") {
        return (
            <svg {...common} aria-hidden="true">
                <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
                <path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z" />
            </svg>
        );
    }

    if (name === "chart") {
        return (
            <svg {...common} aria-hidden="true">
                <path d="M3 3v18h18" />
                <path d="M7 16v-4" />
                <path d="M12 16V7" />
                <path d="M17 16v-7" />
            </svg>
        );
    }

    if (name === "up") {
        return (
            <svg {...common} aria-hidden="true">
                <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z" />
                <path d="M7 10 12 2a3 3 0 0 1 2 3v3h4.3a2.5 2.5 0 0 1 2.5 3l-1.7 8A3 3 0 0 1 17 21H7" />
            </svg>
        );
    }

    return (
        <svg {...common} aria-hidden="true">
            <path d="M7 14V3H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3Z" />
            <path d="m7 14 5 8a3 3 0 0 0 3-3v-3h4.3a2.5 2.5 0 0 0 2.5-3l-1.7-8A3 3 0 0 0 17 3H7" />
        </svg>
    );
}