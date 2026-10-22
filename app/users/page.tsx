
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/app/components/admin-nav";

type SearchParams = {
    q?: string | string[];
};

export default async function UsersPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<SearchParams>;
}) {
    const supabase = await createClient();

    // Require Google authentication.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Only approved superadmins can view users.
    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (!currentProfile?.is_superadmin) {
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

    // Read profiles after confirming admin access.
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select(
            "id, first_name, last_name, avatar_url, created_at, is_superadmin"
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
                <h1>Could not load users</h1>
                <p>{error.message}</p>
            </main>
        );
    }

    // Read the search term from the URL.
    const params = await searchParams;

    const searchTerm = (
        Array.isArray(params.q) ? params.q[0] : params.q ?? ""
    ).trim().slice(0, 100);

    const normalizedSearch = searchTerm.toLowerCase();

    // Match first name, last name, full name, or user ID.
    const filteredProfiles = (profiles ?? []).filter((profile) => {
        const firstName = (profile.first_name ?? "").toLowerCase();
        const lastName = (profile.last_name ?? "").toLowerCase();

        const fullName = [
            profile.first_name,
            profile.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return (
            firstName.includes(normalizedSearch) ||
            lastName.includes(normalizedSearch) ||
            fullName.includes(normalizedSearch) ||
            profile.id.toLowerCase().includes(normalizedSearch)
        );
    });

    const totalUsers = profiles?.length ?? 0;

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
                {/* Navigation */}
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
                                margin: 0,
                                fontSize: "46px",
                            }}
                        >
                            Users
                        </h1>
                    </div>

                    <AdminNav />
                </header>

                {/* User profiles heading */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        flexWrap: "wrap",
                        marginBottom: "22px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: "0 0 6px",
                                fontSize: "28px",
                            }}
                        >
                            User Profiles
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#e5e5e5",
                            }}
                        >
                            Review registered hello world users.
                        </p>
                    </div>

                    <p
                        style={{
                            color: "#e5e5e5",
                            margin: 0,
                        }}
                    >
                        {totalUsers} total
                    </p>
                </div>

                {/* New search bar */}
                <form
                    action="/users"
                    method="get"
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                    }}
                >
                    <input
                        type="search"
                        name="q"
                        aria-label="Search users"
                        placeholder="Search by name or user ID..."
                        defaultValue={searchTerm}
                        maxLength={100}
                        style={{
                            flex: "1 1 260px",
                            minWidth: 0,
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid #444044",
                            background: "#141117",
                            color: "#ffffff",
                            fontSize: "15px",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            padding: "14px 24px",
                            borderRadius: "12px",
                            border: "1px solid #a78bfa",
                            background: "#a78bfa",
                            color: "#101010",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Search
                    </button>

                    {searchTerm && (
                        <a
                            href="/users"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "14px 18px",
                                borderRadius: "12px",
                                border: "1px solid #444044",
                                color: "#ffffff",
                                textDecoration: "none",
                            }}
                        >
                            Clear
                        </a>
                    )}
                </form>

                {/* Search results count */}
                {searchTerm && (
                    <p
                        style={{
                            color: "#e5e5e5",
                            margin: "0 0 20px",
                            fontSize: "14px",
                        }}
                    >
                        Showing {filteredProfiles.length} of {totalUsers}{" "}
                        {totalUsers === 1 ? "user" : "users"} for{" "}
                        <span style={{ color: "#c4b5fd" }}>
                            &ldquo;{searchTerm}&rdquo;
                        </span>
                    </p>
                )}

                {/* Profiles */}
                <div
                    style={{
                        display: "grid",
                        gap: "16px",
                    }}
                >
                    {filteredProfiles.map((profile) => {
                        const name =
                            [profile.first_name, profile.last_name]
                                .filter(Boolean)
                                .join(" ") || "Unnamed user";

                        return (
                            <article
                                key={profile.id}
                                className="admin-card"
                                style={{
                                    border: "1px solid #2f2f2f",
                                    borderRadius: "18px",
                                    background: "#0a0a0a",
                                    padding: "22px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "18px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        minWidth: 0,
                                    }}
                                >
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={name}
                                            width={48}
                                            height={48}
                                            style={{
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                flexShrink: 0,
                                                borderRadius: "50%",
                                                background: "#171717",
                                                border: "1px solid #333333",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {name.charAt(0)}
                                        </div>
                                    )}

                                    <div style={{ minWidth: 0 }}>
                                        <h3
                                            style={{
                                                margin: "0 0 5px",
                                            }}
                                        >
                                            {name}
                                        </h3>

                                        <p
                                            style={{
                                                margin: "0 0 4px",
                                                color: "#d4d4d4",
                                                fontSize: "12px",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {profile.id.slice(0, 12)}...
                                        </p>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#d4d4d4",
                                                fontSize: "12px",
                                            }}
                                        >
                                            Joined{" "}
                                            {profile.created_at
                                                ? new Date(
                                                    profile.created_at
                                                ).toLocaleDateString()
                                                : "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                {profile.is_superadmin && (
                                    <span
                                        style={{
                                            padding: "7px 11px",
                                            borderRadius: "999px",
                                            background:
                                                "rgba(167, 139, 250, 0.15)",
                                            border:
                                                "1px solid rgba(167, 139, 250, 0.55)",
                                            color: "#c4b5fd",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        SUPERADMIN
                                    </span>
                                )}
                            </article>
                        );
                    })}

                    {/* No matching profiles */}
                    {filteredProfiles.length === 0 && (
                        <div
                            style={{
                                border: "1px solid #2f2f2f",
                                borderRadius: "18px",
                                background: "#0a0a0a",
                                padding: "30px",
                                color: "#e5e5e5",
                            }}
                        >
                            {searchTerm
                                ? "No users match your search. Try another name or user ID."
                                : "No registered users found."}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
