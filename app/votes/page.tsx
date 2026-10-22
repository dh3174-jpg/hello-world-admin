
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/app/components/admin-nav";
import ContentActivity from "./content-activity";

export default async function VotesPage() {
    const supabase = await createClient();

    // Require Google authentication.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Only approved superadmins can view this page.
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_superadmin) {
        return (
            <main style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px",
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: "520px",
                    border: "1px solid #2f2f2f",
                    borderRadius: "24px",
                    background: "#0a0a0a",
                    padding: "36px",
                }}>
                    <p style={{
                        color: "#a78bfa",
                        fontWeight: 600,
                    }}>
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

    // Read voting activity from Supabase.
    const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select(`
            id,
            user_id,
            generation_id,
            vote,
            created_at,
            generations (
                generated_text,
                prompt,
                vibe
            )
        `)
        .order("created_at", { ascending: false });

    if (votesError) {
        return (
            <main style={{
                minHeight: "100vh",
                background: "#050505",
                color: "#f5f5f5",
                padding: "40px",
            }}>
                <h1>Could not load votes</h1>
                <p>{votesError.message}</p>
            </main>
        );
    }

    // Read caption creation dates for Content Activity.
    // Fetch in batches to avoid Supabase's default row limit.
    const generationDates: string[] = [];
    const pageSize = 500;
    let chartError: string | null = null;

    for (let start = 0; ; start += pageSize) {
        const { data, error } = await supabase
            .from("generations")
            .select("created_at")
            .order("created_at", { ascending: true })
            .range(start, start + pageSize - 1);

        if (error) {
            chartError = error.message;
            break;
        }

        const rows = data ?? [];

        rows.forEach((record) => {
            if (record.created_at) {
                generationDates.push(record.created_at);
            }
        });

        if (rows.length < pageSize) {
            break;
        }
    }

    const voteRecords = votes ?? [];
    const totalVotes = voteRecords.length;

    const upvotes = voteRecords.filter(
        (record) => record.vote === 1
    ).length;

    const downvotes = voteRecords.filter(
        (record) => record.vote === -1
    ).length;

    return (
        <main style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#f5f5f5",
            padding: "32px",
        }}>
            <div style={{
                maxWidth: "1180px",
                margin: "0 auto",
            }}>
                <header style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "24px",
                    flexWrap: "wrap",
                    marginBottom: "54px",
                }}>
                    <div>
                        <p style={{
                            color: "#a78bfa",
                            fontWeight: 600,
                            marginBottom: "8px",
                        }}>
                            HELLO WORLD ADMIN
                        </p>

                        <h1 style={{
                            fontSize: "46px",
                            margin: 0,
                        }}>
                            Votes
                        </h1>
                    </div>

                    <AdminNav />
                </header>

                {/* Summary statistics */}
                <section className="votes-stats-grid">
                    <StatCard
                        label="Total Votes"
                        value={totalVotes}
                    />

                    <StatCard
                        label="Upvotes"
                        value={upvotes}
                    />

                    <StatCard
                        label="Downvotes"
                        value={downvotes}
                    />
                </section>

                {/* Interactive chart */}
                {chartError ? (
                    <section className="content-activity-panel">
                        <h2>Content Activity</h2>

                        <p style={{ color: "#fca5a5" }}>
                            Could not load caption activity:{" "}
                            {chartError}
                        </p>
                    </section>
                ) : (
                    <ContentActivity dates={generationDates} />
                )}

                {/* Individual voting records */}
                <section className="votes-activity-section">
                    <div className="votes-activity-heading">
                        <div>
                            <h2>Vote Activity</h2>

                            <p>
                                Review engagement across
                                generated captions.
                            </p>
                        </div>

                        <span>{totalVotes} total</span>
                    </div>

                    {/* Working vote filters */}
                    <div className="votes-filter-area">
                        <input
                            type="radio"
                            name="vote-filter"
                            id="vote-filter-all"
                            className="votes-filter-input"
                            defaultChecked
                        />

                        <input
                            type="radio"
                            name="vote-filter"
                            id="vote-filter-up"
                            className="votes-filter-input"
                        />

                        <input
                            type="radio"
                            name="vote-filter"
                            id="vote-filter-down"
                            className="votes-filter-input"
                        />

                        <div className="votes-filter-controls">
                            <label
                                htmlFor="vote-filter-all"
                                className="votes-filter-button"
                            >
                                All Votes
                            </label>

                            <label
                                htmlFor="vote-filter-up"
                                className="votes-filter-button"
                            >
                                ↑ Upvotes
                            </label>

                            <label
                                htmlFor="vote-filter-down"
                                className="votes-filter-button"
                            >
                                ↓ Downvotes
                            </label>
                        </div>

                        <div className="votes-record-list">
                            {voteRecords.map((voteRecord) => {
                                const generation = Array.isArray(
                                    voteRecord.generations
                                )
                                    ? voteRecord.generations[0]
                                    : voteRecord.generations;

                                const isUpvote =
                                    voteRecord.vote === 1;

                                const voteType = isUpvote
                                    ? "vote-record-up"
                                    : "vote-record-down";

                                return (
                                    <article
                                        key={voteRecord.id}
                                        className={`votes-record-card ${voteType}`}
                                    >
                                        <div className="votes-record-content">
                                            <div className="votes-record-main">
                                                <p className="votes-record-eyebrow">
                                                    CAPTION
                                                </p>

                                                <h3>
                                                    {generation?.generated_text ||
                                                        "Caption unavailable"}
                                                </h3>

                                                {generation?.prompt && (
                                                    <p className="votes-record-prompt">
                                                        Prompt:{" "}
                                                        {generation.prompt}
                                                    </p>
                                                )}

                                                <div className="votes-record-meta">
                                                    <span>
                                                        Vote ID:{" "}
                                                        {voteRecord.id}
                                                    </span>

                                                    <span>
                                                        Caption ID:{" "}
                                                        {voteRecord.generation_id}
                                                    </span>

                                                    <span>
                                                        User:{" "}
                                                        {voteRecord.user_id.slice(0, 8)}
                                                        ...
                                                    </span>

                                                    <span>
                                                        {voteRecord.created_at
                                                            ? new Date(
                                                                voteRecord.created_at
                                                            ).toLocaleDateString()
                                                            : "Unknown date"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="votes-record-tags">
                                                <span
                                                    className={
                                                        isUpvote
                                                            ? "votes-upvote-badge"
                                                            : "votes-downvote-badge"
                                                    }
                                                >
                                                    {isUpvote
                                                        ? "↑ Upvote"
                                                        : "↓ Downvote"}
                                                </span>

                                                <span className="votes-vibe-badge">
                                                    {generation?.vibe || "No vibe"}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {totalVotes === 0 && (
                                <div className="votes-empty-message">
                                    No votes have been recorded yet.
                                </div>
                            )}
                        </div>

                        {upvotes === 0 && totalVotes > 0 && (
                            <p className="votes-no-upvotes">
                                No upvotes have been recorded yet.
                            </p>
                        )}

                        {downvotes === 0 && totalVotes > 0 && (
                            <p className="votes-no-downvotes">
                                No downvotes have been recorded yet.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

function StatCard({
                      label,
                      value,
                  }: {
    label: string;
    value: number;
}) {
    return (
        <div className="votes-stat-card">
            <p>{label}</p>
            <strong>{value}</strong>
        </div>
    );
}
