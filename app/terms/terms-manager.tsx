"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Term = {
    id: number;
    term: string;
    description: string | null;
    created_at: string;
};

export default function TermsManager({
                                         initialTerms,
                                     }: {
    initialTerms: Term[];
}) {
    const supabase = createClient();

    const [terms, setTerms] = useState(initialTerms);
    const [newTerm, setNewTerm] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [message, setMessage] = useState("");

    const createTerm = async () => {
        if (!newTerm.trim()) {
            setMessage("Please enter a term.");
            return;
        }

        const { data, error } = await supabase
            .from("terms")
            .insert({
                term: newTerm.trim(),
                description: newDescription.trim() || null,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setTerms((current) => [data, ...current]);
        setNewTerm("");
        setNewDescription("");
        setMessage("Term created successfully.");
    };

    const updateTerm = async (
        id: number,
        term: string,
        description: string
    ) => {
        const { error } = await supabase
            .from("terms")
            .update({
                term,
                description: description || null,
            })
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Term updated successfully.");
        }
    };

    const deleteTerm = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this term?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("terms")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setTerms((current) =>
            current.filter((term) => term.id !== id)
        );

        setMessage("Term deleted successfully.");
    };

    const editLocalTerm = (
        id: number,
        field: "term" | "description",
        value: string
    ) => {
        setTerms((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, [field]: value }
                    : item
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
                    Add a Term
                </h3>

                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Term name"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                        }}
                    />

                    <textarea
                        placeholder="Description"
                        value={newDescription}
                        onChange={(e) =>
                            setNewDescription(e.target.value)
                        }
                        rows={3}
                        style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                            resize: "vertical",
                        }}
                    />

                    <button
                        type="button"
                        onClick={createTerm}
                        style={{
                            width: "fit-content",
                            padding: "11px 18px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#a78bfa",
                            color: "#090909",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Add Term
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {terms.map((item) => (
                    <div
                        key={item.id}
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
                                gap: "14px",
                            }}
                        >
                            <input
                                type="text"
                                value={item.term}
                                onChange={(e) =>
                                    editLocalTerm(
                                        item.id,
                                        "term",
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

                            <textarea
                                value={item.description || ""}
                                onChange={(e) =>
                                    editLocalTerm(
                                        item.id,
                                        "description",
                                        e.target.value
                                    )
                                }
                                rows={3}
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3a3a3a",
                                    background: "#111111",
                                    color: "#ffffff",
                                    resize: "vertical",
                                }}
                            />

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
                                        updateTerm(
                                            item.id,
                                            item.term,
                                            item.description || ""
                                        )
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
                                        deleteTerm(item.id)
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