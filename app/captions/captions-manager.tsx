"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Caption = {
    id: number;
    user_id: string;
    prompt: string;
    generated_text: string;
    vibe: string | null;
    favorite: boolean | null;
    created_at: string | null;
};

export default function CaptionsManager({
                                            captions,
                                            adminUserId,
                                        }: {
    captions: Caption[];
    adminUserId: string;
}) {
    const supabase = createClient();
    const router = useRouter();

    const [prompt, setPrompt] = useState("");
    const [generatedText, setGeneratedText] = useState("");
    const [vibe, setVibe] = useState("Casual");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingPrompt, setEditingPrompt] = useState("");
    const [editingText, setEditingText] = useState("");
    const [editingVibe, setEditingVibe] = useState("");

    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const createCaption = async () => {
        if (!prompt.trim() || !generatedText.trim()) {
            setMessage("Prompt and caption are required.");
            return;
        }

        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("generations")
            .insert({
                user_id: adminUserId,
                prompt: prompt.trim(),
                generated_text: generatedText.trim(),
                vibe,
            });

        if (error) {
            setMessage(`Error: ${error.message}`);
            setSaving(false);
            return;
        }

        setPrompt("");
        setGeneratedText("");
        setVibe("Casual");
        setMessage("Caption created successfully.");
        setSaving(false);

        router.refresh();
    };

    const beginEdit = (caption: Caption) => {
        setEditingId(caption.id);
        setEditingPrompt(caption.prompt);
        setEditingText(caption.generated_text);
        setEditingVibe(caption.vibe || "");
        setMessage("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingPrompt("");
        setEditingText("");
        setEditingVibe("");
    };

    const saveEdit = async (captionId: number) => {
        if (!editingPrompt.trim() || !editingText.trim()) {
            setMessage("Prompt and caption cannot be empty.");
            return;
        }

        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("generations")
            .update({
                prompt: editingPrompt.trim(),
                generated_text: editingText.trim(),
                vibe: editingVibe.trim() || null,
            })
            .eq("id", captionId);

        if (error) {
            setMessage(`Error: ${error.message}`);
            setSaving(false);
            return;
        }

        setEditingId(null);
        setSaving(false);
        setMessage("Caption updated successfully.");

        router.refresh();
    };

    const deleteCaption = async (captionId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this caption?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");

        const { error } = await supabase
            .from("generations")
            .delete()
            .eq("id", captionId);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setMessage("Caption deleted successfully.");
        router.refresh();
    };

    return (
        <div>
            <section
                className="admin-card"
                style={{
                    border: "1px solid #2f2f2f",
                    borderRadius: "20px",
                    background: "#0a0a0a",
                    padding: "26px",
                    marginBottom: "36px",
                }}
            >
                <p
                    style={{
                        color: "#a78bfa",
                        fontWeight: 600,
                        margin: "0 0 8px",
                    }}
                >
                    CREATE CAPTION
                </p>

                <h2
                    style={{
                        margin: "0 0 22px",
                        fontSize: "26px",
                    }}
                >
                    Add AI-generated media
                </h2>

                <div
                    style={{
                        display: "grid",
                        gap: "18px",
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                            }}
                        >
                            Original prompt
                        </label>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            placeholder="Enter the original moment or prompt..."
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "14px",
                                borderRadius: "12px",
                                border: "1px solid #3a3a3a",
                                background: "#111111",
                                color: "#ffffff",
                                resize: "vertical",
                                fontSize: "15px",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                            }}
                        >
                            AI-generated caption
                        </label>

                        <textarea
                            value={generatedText}
                            onChange={(e) =>
                                setGeneratedText(e.target.value)
                            }
                            rows={3}
                            placeholder="Enter the generated caption..."
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "14px",
                                borderRadius: "12px",
                                border: "1px solid #3a3a3a",
                                background: "#111111",
                                color: "#ffffff",
                                resize: "vertical",
                                fontSize: "15px",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                            }}
                        >
                            Vibe
                        </label>

                        <select
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            style={{
                                width: "135px",
                                padding: "12px 14px",
                                borderRadius: "12px",
                                border: "1px solid #3a3a3a",
                                background: "#111111",
                                color: "#ffffff",
                                fontSize: "15px",
                                cursor: "pointer",
                            }}
                        >
                            <option value="Casual">Casual</option>
                            <option value="Funny">Funny</option>
                            <option value="Thoughtful">Thoughtful</option>
                            <option value="Professional">
                                Professional
                            </option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={createCaption}
                        disabled={saving}
                        className="admin-button"
                        style={{
                            width: "fit-content",
                            padding: "12px 18px",
                            borderRadius: "11px",
                            border: "none",
                            background: "#ffffff",
                            color: "#050505",
                            fontWeight: 600,
                            cursor: saving
                                ? "not-allowed"
                                : "pointer",
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        {saving ? "Saving..." : "Create Caption"}
                    </button>
                </div>
            </section>

            {message && (
                <p
                    style={{
                        marginBottom: "24px",
                        color: message.startsWith("Error")
                            ? "#fca5a5"
                            : "#86efac",
                    }}
                >
                    {message}
                </p>
            )}

            <section>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "18px",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "28px",
                        }}
                    >
                        All Captions
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: "#777777",
                        }}
                    >
                        {captions.length} total
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gap: "18px",
                    }}
                >
                    {captions.map((caption) => (
                        <article
                            key={caption.id}
                            className="admin-card"
                            style={{
                                border: "1px solid #2f2f2f",
                                borderRadius: "18px",
                                background: "#0a0a0a",
                                padding: "24px",
                            }}
                        >
                            {editingId === caption.id ? (
                                <div
                                    style={{
                                        display: "grid",
                                        gap: "14px",
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#777777",
                                                fontSize: "12px",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            ORIGINAL PROMPT
                                        </label>

                                        <textarea
                                            value={editingPrompt}
                                            onChange={(e) =>
                                                setEditingPrompt(
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                            style={{
                                                width: "100%",
                                                boxSizing: "border-box",
                                                padding: "12px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #3a3a3a",
                                                background: "#111111",
                                                color: "#ffffff",
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#777777",
                                                fontSize: "12px",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            GENERATED CAPTION
                                        </label>

                                        <textarea
                                            value={editingText}
                                            onChange={(e) =>
                                                setEditingText(
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                            style={{
                                                width: "100%",
                                                boxSizing: "border-box",
                                                padding: "12px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #3a3a3a",
                                                background: "#111111",
                                                color: "#ffffff",
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#777777",
                                                fontSize: "12px",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            VIBE
                                        </label>

                                        <input
                                            type="text"
                                            value={editingVibe}
                                            onChange={(e) =>
                                                setEditingVibe(
                                                    e.target.value
                                                )
                                            }
                                            style={{
                                                padding: "11px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #3a3a3a",
                                                background: "#111111",
                                                color: "#ffffff",
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveEdit(caption.id)
                                            }
                                            disabled={saving}
                                            className="admin-button"
                                            style={{
                                                padding:
                                                    "10px 15px",
                                                borderRadius: "10px",
                                                border: "none",
                                                background:
                                                    "#a78bfa",
                                                color: "#090909",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="admin-button"
                                            style={{
                                                padding:
                                                    "10px 15px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #3a3a3a",
                                                background:
                                                    "#111111",
                                                color: "#ffffff",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "18px",
                                            flexWrap: "wrap",
                                            marginBottom: "18px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: "260px",
                                            }}
                                        >
                                            <p
                                                style={{
                                                    color: "#777777",
                                                    fontSize: "12px",
                                                    margin:
                                                        "0 0 6px",
                                                }}
                                            >
                                                ORIGINAL PROMPT
                                            </p>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: "#bdbdbd",
                                                    lineHeight: "1.5",
                                                }}
                                            >
                                                {caption.prompt}
                                            </p>
                                        </div>

                                        <span
                                            style={{
                                                height: "fit-content",
                                                padding: "7px 11px",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "rgba(167, 139, 250, 0.15)",
                                                border:
                                                    "1px solid rgba(167, 139, 250, 0.55)",
                                                color: "#c4b5fd",
                                                fontSize: "12px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {caption.vibe ||
                                                "No vibe"}
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            color: "#a78bfa",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                        }}
                                    >
                                        AI-GENERATED CAPTION
                                    </p>

                                    <h3
                                        style={{
                                            margin: "0 0 16px",
                                            fontSize: "22px",
                                            lineHeight: "1.45",
                                        }}
                                    >
                                        {caption.generated_text}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#666666",
                                            fontSize: "12px",
                                            marginBottom: "18px",
                                        }}
                                    >
                                        ID: {caption.id} ·{" "}
                                        {caption.created_at
                                            ? new Date(
                                                caption.created_at
                                            ).toLocaleDateString()
                                            : "Unknown date"}
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                beginEdit(caption)
                                            }
                                            className="admin-button"
                                            style={{
                                                padding:
                                                    "10px 15px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #3a3a3a",
                                                background:
                                                    "#111111",
                                                color: "#ffffff",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteCaption(
                                                    caption.id
                                                )
                                            }
                                            className="admin-button"
                                            style={{
                                                padding:
                                                    "10px 15px",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid #7f1d1d",
                                                background:
                                                    "#2a0b0b",
                                                color: "#fca5a5",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </article>
                    ))}

                    {captions.length === 0 && (
                        <p style={{ color: "#a3a3a3" }}>
                            No captions found.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}