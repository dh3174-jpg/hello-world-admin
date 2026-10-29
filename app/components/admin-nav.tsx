"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const sections = [
    {
        title: "Overview",
        links: [
            {
                label: "Dashboard",
                href: "/",
                icon: "dashboard",
            },
        ],
    },
    {
        title: "Community",
        links: [
            {
                label: "Users",
                href: "/users",
                icon: "users",
            },
            {
                label: "Captions",
                href: "/captions",
                icon: "sparkles",
            },
            {
                label: "Votes",
                href: "/votes",
                icon: "votes",
            },
        ],
    },
    {
        title: "AI Workflows",
        links: [
            {
                label: "Prompt Chains",
                href: "/prompt-chains",
                icon: "workflow",
            },
            {
                label: "Chain Steps",
                href: "/prompt-chain-steps",
                icon: "steps",
            },
            {
                label: "Prompt Mix",
                href: "/prompt-chain-mix",
                icon: "mix",
            },
            {
                label: "Terms",
                href: "/terms",
                icon: "terms",
            },
        ],
    },
    {
        title: "AI Observability",
        links: [
            {
                label: "Generation Requests",
                href: "/generation-requests",
                icon: "requests",
            },
            {
                label: "AI Examples",
                href: "/ai-generation-examples",
                icon: "examples",
            },
            {
                label: "LLM Responses",
                href: "/llm-responses",
                icon: "responses",
            },
        ],
    },
    {
        title: "AI Configuration",
        links: [
            {
                label: "LLM Providers",
                href: "/llm-providers",
                icon: "providers",
            },
            {
                label: "LLM Models",
                href: "/llm-models",
                icon: "models",
            },
        ],
    },
    {
        title: "Access Control",
        links: [
            {
                label: "Allowed Domains",
                href: "/allowed-signup-domains",
                icon: "domains",
            },
            {
                label: "Whitelisted Emails",
                href: "/whitelisted-emails",
                icon: "emails",
            },
        ],
    },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <aside
            style={{
                width: "270px",
                minWidth: "270px",
                minHeight: "100vh",
                background: "#090909",
                borderRight: "1px solid #242424",
                padding: "28px 18px",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                height: "100vh",
                overflowY: "auto",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    padding: "0 10px 24px",
                    borderBottom: "1px solid #242424",
                    marginBottom: "26px",
                }}
            >
                <p
                    style={{
                        color: "#a78bfa",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        margin: "0 0 6px",
                    }}
                >
                    HELLO WORLD
                </p>

                <h2
                    style={{
                        margin: 0,
                        fontSize: "20px",
                        color: "#ffffff",
                        fontWeight: 600,
                    }}
                >
                    Admin Console
                </h2>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "28px",
                    flex: 1,
                }}
            >
                {sections.map((section) => (
                    <div key={section.title}>
                        <p
                            style={{
                                color: "#686868",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                margin: "0 10px 9px",
                            }}
                        >
                            {section.title}
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gap: "4px",
                            }}
                        >
                            {section.links.map((link) => {
                                const active = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="admin-sidebar-link"
                                        data-active={
                                            active ? "true" : "false"
                                        }
                                    >
                                        <span
                                            style={{
                                                color: active
                                                    ? "#a78bfa"
                                                    : "#737373",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <NavIcon name={link.icon} />
                                        </span>

                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    borderTop: "1px solid #242424",
                    paddingTop: "18px",
                    marginTop: "24px",
                }}
            >
                <button
                    type="button"
                    onClick={handleLogout}
                    className="admin-sidebar-logout"
                >
                    <span
                        style={{
                            color: "#737373",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <NavIcon name="logout" />
                    </span>

                    Log out
                </button>
            </div>
        </aside>
    );
}

function NavIcon({ name }: { name: string }) {
    const common = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (name === "dashboard") {
        return (
            <svg {...common}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
            </svg>
        );
    }

    if (name === "users") {
        return (
            <svg {...common}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
        );
    }

    if (name === "sparkles") {
        return (
            <svg {...common}>
                <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
            </svg>
        );
    }

    if (name === "votes") {
        return (
            <svg {...common}>
                <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z" />
                <path d="m7 10 5-8a3 3 0 0 1 3 3v3h4a2 2 0 0 1 2 2l-2 9a3 3 0 0 1-3 2H7" />
            </svg>
        );
    }

    if (name === "workflow") {
        return (
            <svg {...common}>
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="18" r="3" />
                <path d="M8.5 7.5 15.5 16.5" />
            </svg>
        );
    }

    if (name === "steps") {
        return (
            <svg {...common}>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
                <circle cx="7" cy="6" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="17" cy="18" r="1" />
            </svg>
        );
    }

    if (name === "mix") {
        return (
            <svg {...common}>
                <path d="M4 6h10" />
                <path d="M18 6h2" />
                <circle cx="16" cy="6" r="2" />
                <path d="M4 12h2" />
                <path d="M10 12h10" />
                <circle cx="8" cy="12" r="2" />
                <path d="M4 18h7" />
                <path d="M15 18h5" />
                <circle cx="13" cy="18" r="2" />
            </svg>
        );
    }

    if (name === "terms") {
        return (
            <svg {...common}>
                <path d="M4 5h16" />
                <path d="M4 12h12" />
                <path d="M4 19h9" />
            </svg>
        );
    }

    if (name === "requests") {
        return (
            <svg {...common}>
                <path d="M4 4h16v16H4z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </svg>
        );
    }

    if (name === "examples") {
        return (
            <svg {...common}>
                <path d="M5 4h14v16H5z" />
                <path d="M8 8h8" />
                <path d="M8 12h5" />
            </svg>
        );
    }

    if (name === "responses") {
        return (
            <svg {...common}>
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                <path d="M8 8h8" />
                <path d="M8 12h6" />
            </svg>
        );
    }

    if (name === "providers") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
            </svg>
        );
    }

    if (name === "models") {
        return (
            <svg {...common}>
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M9 9h6v6H9z" />
            </svg>
        );
    }

    if (name === "domains") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 0 1 0 18" />
                <path d="M12 3a15 15 0 0 0 0 18" />
            </svg>
        );
    }

    if (name === "emails") {
        return (
            <svg {...common}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </svg>
    );
}