"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const links = [
        { href: "/", label: "Dashboard" },
        { href: "/users", label: "Users" },
        { href: "/captions", label: "Captions" },
        { href: "/votes", label: "Votes" },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();

        router.push("/login");
        router.refresh();
    };

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
            }}
        >
            {links.map((link) => {
                const active = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="admin-nav-link"
                        style={{
                            color: active ? "#ffffff" : "#bdbdbd",
                            textDecoration: "none",
                            fontWeight: active ? 500 : 400,
                        }}
                    >
                        {link.label}
                    </Link>
                );
            })}

            <button
                type="button"
                onClick={handleLogout}
                className="admin-logout-button"
            >
                Log out
            </button>
        </nav>
    );
}