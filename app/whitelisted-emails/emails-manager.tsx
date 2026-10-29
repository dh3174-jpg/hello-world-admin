"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EmailEntry = {
    id: number;
    email: string;
    active: boolean;
    created_at: string;
};

export default function EmailsManager({
                                          initialEmails,
                                      }: {
    initialEmails: EmailEntry[];
}) {
    const supabase = createClient();

    const [emails, setEmails] = useState<EmailEntry[]>(initialEmails);
    const [newEmail, setNewEmail] = useState("");
    const [message, setMessage] = useState("");

    const createEmail = async () => {
        if (!newEmail.trim()) {
            setMessage("Please enter an email address.");
            return;
        }

        const cleanedEmail = newEmail.trim().toLowerCase();

        const { data, error } = await supabase
            .from("whitelisted_emails")
            .insert({
                email: cleanedEmail,
                active: true,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setEmails((current) => [data as EmailEntry, ...current]);
        setNewEmail("");
        setMessage("Email created successfully.");
    };

    const updateEmail = async (entry: EmailEntry) => {
        const cleanedEmail = entry.email.trim().toLowerCase();

        const { error } = await supabase
            .from("whitelisted_emails")
            .update({
                email: cleanedEmail,
                active: entry.active,
            })
            .eq("id", entry.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setEmails((current) =>
            current.map((item) =>
                item.id === entry.id
                    ? {
                        ...item,
                        email: cleanedEmail,
                    }
                    : item
            )
        );

        setMessage("Email updated successfully.");
    };

    const deleteEmail = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this email?"
        );

        if (!confirmed) {
            return;
        }

        const { error } = await supabase
            .from("whitelisted_emails")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setEmails((current) =>
            current.filter((entry) => entry.id !== id)
        );

        setMessage("Email deleted successfully.");
    };

    const updateLocalEmail = (
        id: number,
        field: "email" | "active",
        value: string | boolean
    ) => {
        setEmails((current) =>
            current.map((entry) =>
                entry.id === id
                    ? {
                        ...entry,
                        [field]: value,
                    }
                    : entry
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
                        margin: "0 0 20px",
                        fontSize: "22px",
                    }}
                >
                    Add Email
                </h3>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        type="email"
                        placeholder="person@example.com"
                        value={newEmail}
                        onChange={(event) =>
                            setNewEmail(event.target.value)
                        }
                        style={{
                            flex: 1,
                            minWidth: "280px",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                        }}
                    />

                    <button
                        type="button"
                        onClick={createEmail}
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
                        Add Email
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {emails.map((entry) => (
                    <div
                        key={entry.id}
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
                                type="email"
                                value={entry.email}
                                onChange={(event) =>
                                    updateLocalEmail(
                                        entry.id,
                                        "email",
                                        event.target.value
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
                                    checked={entry.active}
                                    onChange={(event) =>
                                        updateLocalEmail(
                                            entry.id,
                                            "active",
                                            event.target.checked
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
                                        updateEmail(entry)
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
                                        deleteEmail(entry.id)
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