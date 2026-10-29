"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Model = {
    id: number;
    provider_id: number | null;
    provider_name: string;
    name: string;
    model_identifier: string | null;
    active: boolean;
    created_at: string;
};

type Provider = {
    id: number;
    name: string;
};

export default function ModelsManager({
                                          initialModels,
                                          providers,
                                      }: {
    initialModels: Model[];
    providers: Provider[];
}) {
    const supabase = createClient();

    const [models, setModels] = useState(initialModels);
    const [newName, setNewName] = useState("");
    const [newIdentifier, setNewIdentifier] = useState("");
    const [newProviderId, setNewProviderId] = useState(
        providers[0]?.id?.toString() || ""
    );
    const [message, setMessage] = useState("");

    const createModel = async () => {
        if (!newName.trim()) {
            setMessage("Please enter a model name.");
            return;
        }

        const providerId = newProviderId
            ? Number(newProviderId)
            : null;

        const { data, error } = await supabase
            .from("llm_models")
            .insert({
                name: newName.trim(),
                model_identifier: newIdentifier.trim() || null,
                provider_id: providerId,
                active: true,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        const providerName =
            providers.find(
                (provider) => provider.id === providerId
            )?.name || "No provider";

        setModels((current) => [
            {
                ...data,
                provider_name: providerName,
            },
            ...current,
        ]);

        setNewName("");
        setNewIdentifier("");
        setMessage("Model created successfully.");
    };

    const updateModel = async (model: Model) => {
        const { error } = await supabase
            .from("llm_models")
            .update({
                name: model.name,
                model_identifier: model.model_identifier || null,
                provider_id: model.provider_id,
                active: model.active,
            })
            .eq("id", model.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Model updated successfully.");
        }
    };

    const deleteModel = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this model?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("llm_models")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setModels((current) =>
            current.filter((model) => model.id !== id)
        );

        setMessage("Model deleted successfully.");
    };

    const editLocalModel = (
        id: number,
        field: "name" | "model_identifier" | "provider_id" | "active",
        value: string | number | boolean | null
    ) => {
        setModels((current) =>
            current.map((model) => {
                if (model.id !== id) {
                    return model;
                }

                const updated = {
                    ...model,
                    [field]: value,
                };

                if (field === "provider_id") {
                    updated.provider_name =
                        providers.find(
                            (provider) => provider.id === value
                        )?.name || "No provider";
                }

                return updated;
            })
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
                    Add Model
                </h3>

                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Model name"
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

                    <input
                        type="text"
                        placeholder="Model identifier"
                        value={newIdentifier}
                        onChange={(e) =>
                            setNewIdentifier(e.target.value)
                        }
                        style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                        }}
                    />

                    <select
                        value={newProviderId}
                        onChange={(e) =>
                            setNewProviderId(e.target.value)
                        }
                        style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: "1px solid #3a3a3a",
                            background: "#111111",
                            color: "#ffffff",
                        }}
                    >
                        {providers.map((provider) => (
                            <option
                                key={provider.id}
                                value={provider.id}
                            >
                                {provider.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={createModel}
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
                        Add Model
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {models.map((model) => (
                    <div
                        key={model.id}
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
                                value={model.name}
                                onChange={(e) =>
                                    editLocalModel(
                                        model.id,
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
                                }}
                            />

                            <input
                                type="text"
                                value={model.model_identifier || ""}
                                onChange={(e) =>
                                    editLocalModel(
                                        model.id,
                                        "model_identifier",
                                        e.target.value
                                    )
                                }
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3a3a3a",
                                    background: "#111111",
                                    color: "#ffffff",
                                }}
                            />

                            <select
                                value={model.provider_id || ""}
                                onChange={(e) =>
                                    editLocalModel(
                                        model.id,
                                        "provider_id",
                                        Number(e.target.value)
                                    )
                                }
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #3a3a3a",
                                    background: "#111111",
                                    color: "#ffffff",
                                }}
                            >
                                {providers.map((provider) => (
                                    <option
                                        key={provider.id}
                                        value={provider.id}
                                    >
                                        {provider.name}
                                    </option>
                                ))}
                            </select>

                            <label
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    color: "#d4d4d4",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={model.active}
                                    onChange={(e) =>
                                        editLocalModel(
                                            model.id,
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
                                    onClick={() => updateModel(model)}
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
                                    onClick={() => deleteModel(model.id)}
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