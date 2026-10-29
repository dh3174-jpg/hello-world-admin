"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
    created_at: string;
};

export default function ProvidersManager({
                                             initialProviders,
                                         }: {
    initialProviders: Provider[];
}) {
    const supabase = createClient();

    const [providers, setProviders] = useState(initialProviders);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [message, setMessage] = useState("");

    const createProvider = async () => {
        if (!newName.trim()) {
            setMessage("Please enter a provider name.");
            return;
        }

        const { data, error } = await supabase
            .from("llm_providers")
            .insert({
                name: newName.trim(),
                description: newDescription.trim() || null,
                active: true,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setProviders((current) => [data, ...current]);
        setNewName("");
        setNewDescription("");
        setMessage("Provider created successfully.");
    };

    const updateProvider = async (provider: Provider) => {
        const { error } = await supabase
            .from("llm_providers")
            .update({
                name: provider.name,
                description: provider.description || null,
                active: provider.active,
            })
            .eq("id", provider.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Provider updated successfully.");
        }
    };

    const deleteProvider = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this provider?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("llm_providers")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setProviders((current) =>
            current.filter((provider) => provider.id !== id)
        );

        setMessage("Provider deleted successfully.");
    };

    const editLocalProvider = (
        id: number,
        field: "name" | "description" | "active",
        value: string | boolean
    ) => {
        setProviders((current) =>
            current.map((provider) =>
                provider.id === id
                    ? { ...provider, [field]: value }
                    : provider
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
                    Add Provider
                </h3>

                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Provider name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
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
                        onClick={createProvider}
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
                        Add Provider
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {providers.map((provider) => (
                    <div
                        key={provider.id}
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
                                value={provider.name}
                                onChange={(e) =>
                                    editLocalProvider(
                                        provider.id,
                                        "name",
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
                                value={provider.description || ""}
                                onChange={(e) =>
                                    editLocalProvider(
                                        provider.id,
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
                                    checked={provider.active}
                                    onChange={(e) =>
                                        editLocalProvider(
                                            provider.id,
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
                                        updateProvider(provider)
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
                                        deleteProvider(provider.id)
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