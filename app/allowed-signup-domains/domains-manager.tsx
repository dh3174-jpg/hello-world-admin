"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Domain = {
    id: number;
    domain: string;
    active: boolean;
    created_at: string;
};

export default function DomainsManager({
                                           initialDomains,
                                       }: {
    initialDomains: Domain[];
}) {
    const supabase = createClient();

    const [domains, setDomains] = useState(initialDomains);
    const [newDomain, setNewDomain] = useState("");
    const [message, setMessage] = useState("");

    const createDomain = async () => {
        if (!newDomain.trim()) {
            setMessage("Please enter a domain.");
            return;
        }

        const cleanedDomain = newDomain
            .trim()
            .toLowerCase()
            .replace(/^@/, "");

        const { data, error } = await supabase
            .from("allowed_signup_domains")
            .insert({
                domain: cleanedDomain,
                active: true,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setDomains((current) => [data, ...current]);
        setNewDomain("");
        setMessage("Domain created successfully.");
    };

    const updateDomain = async (domain: Domain) => {
        const cleanedDomain = domain.domain
            .trim()
            .toLowerCase()
            .replace(/^@/, "");

        const { error } = await supabase
            .from("allowed_signup_domains")
            .update({
                domain: cleanedDomain,
                active: domain.active,
            })
            .eq("id", domain.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setDomains((current) =>
                current.map((item) =>
                    item.id === domain.id
                        ? { ...item, domain: cleanedDomain }
                        : item
                )
            );

            setMessage("Domain updated successfully.");
        }
    };

    const deleteDomain = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this domain?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("allowed_signup_domains")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setDomains((current) =>
            current.filter((domain) => domain.id !== id)
        );

        setMessage("Domain deleted successfully.");
    };

    const editLocalDomain = (
        id: number,
        field: "domain" | "active",
        value: string | boolean
    ) => {
        setDomains((current) =>
            current.map((domain) =>
                domain.id === id
                    ? { ...domain, [field]: value }
                    : domain
            )
        );
    };

    return (
        <div>
            <div
                style={{
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    background: "rgba(167, 139, 250, 0.06)",
                    borderRadius: "18px",
                    padding: "24px",
                    marginBottom: "32px",
                }}
            >
                <h3
                    style={{
                        marginTop: 0,
                        marginBottom: "20px",
                        fontSize: "22px",
                    }}
                >
                    Add Domain
                </h3>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        type="text"
                        placeholder="example.edu"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: "260px",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                        }}
                    />

                    <button
                        type="button"
                        onClick={createDomain}
                        style={{
                            padding: "11px 18px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#a78bfa",
                            color: "#090909",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Add Domain
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {domains.map((domain) => (
                    <div
                        key={domain.id}
                        style={{
                            border: "1px solid #2f2f2f",
                            borderRadius: "18px",
                            background: "#0a0a0a",
                            padding: "24px",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gap: "16px",
                            }}
                        >
                            <input
                                type="text"
                                value={domain.domain}
                                onChange={(e) =>
                                    editLocalDomain(
                                        domain.id,
                                        "domain",
                                        e.target.value
                                    )
                                }
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3a3a3a",
                                    background: "#111111",
                                    color: "#ffffff",
                                    fontSize: "17px",
                                }}
                            />

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "#d4d4d4",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={domain.active}
                                    onChange={(e) =>
                                        editLocalDomain(
                                            domain.id,
                                            "active",
                                            e.target.checked
                                        )
                                    }
                                />
                                Active
                            </label>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateDomain(domain)
                                    }
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: "10px",
                                        border: "1px solid #a78bfa",
                                        background: "#a78bfa",
                                        color: "#090909",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    Save Changes
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        deleteDomain(domain.id)
                                    }
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: "10px",
                                        border: "1px solid #ef4444",
                                        background: "transparent",
                                        color: "#f87171",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {message && (
                <p
                    style={{
                        marginTop: "24px",
                        color: message.startsWith("Error")
                            ? "#fca5a5"
                            : "#c4b5fd",
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}