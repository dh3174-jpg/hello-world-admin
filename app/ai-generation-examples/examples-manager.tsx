"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Example = {
    id: number;
    input_text: string;
    output_text: string;
    notes: string | null;
    created_at: string;
};

export default function ExamplesManager({
                                            initialExamples,
                                        }: {
    initialExamples: Example[];
}) {
    const supabase = createClient();

    const [examples, setExamples] = useState(initialExamples);

    const [newInput, setNewInput] = useState("");
    const [newOutput, setNewOutput] = useState("");
    const [newNotes, setNewNotes] = useState("");

    const [message, setMessage] = useState("");

    const createExample = async () => {
        if (!newInput.trim() || !newOutput.trim()) {
            setMessage("Please enter both an input and an output.");
            return;
        }

        const { data, error } = await supabase
            .from("ai_generation_examples")
            .insert({
                input_text: newInput.trim(),
                output_text: newOutput.trim(),
                notes: newNotes.trim() || null,
            })
            .select()
            .single();

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setExamples((current) => [data, ...current]);

        setNewInput("");
        setNewOutput("");
        setNewNotes("");

        setMessage("Example created successfully.");
    };

    const updateExample = async (example: Example) => {
        const { error } = await supabase
            .from("ai_generation_examples")
            .update({
                input_text: example.input_text,
                output_text: example.output_text,
                notes: example.notes || null,
            })
            .eq("id", example.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Example updated successfully.");
        }
    };

    const deleteExample = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this example?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("ai_generation_examples")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setExamples((current) =>
            current.filter((example) => example.id !== id)
        );

        setMessage("Example deleted successfully.");
    };

    const editLocalExample = (
        id: number,
        field: "input_text" | "output_text" | "notes",
        value: string
    ) => {
        setExamples((current) =>
            current.map((example) =>
                example.id === id
                    ? { ...example, [field]: value }
                    : example
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
                    Add Example
                </h3>

                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    <textarea
                        placeholder="Example input"
                        value={newInput}
                        onChange={(e) => setNewInput(e.target.value)}
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

                    <textarea
                        placeholder="Example AI output"
                        value={newOutput}
                        onChange={(e) => setNewOutput(e.target.value)}
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

                    <textarea
                        placeholder="Notes (optional)"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        rows={2}
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
                        onClick={createExample}
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
                        Add Example
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "18px",
                }}
            >
                {examples.map((example) => (
                    <div
                        key={example.id}
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
                            <div>
                                <p
                                    style={{
                                        color: "#a78bfa",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    INPUT
                                </p>

                                <textarea
                                    value={example.input_text}
                                    onChange={(e) =>
                                        editLocalExample(
                                            example.id,
                                            "input_text",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        border: "1px solid #3a3a3a",
                                        background: "#111111",
                                        color: "#ffffff",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

                            <div>
                                <p
                                    style={{
                                        color: "#a78bfa",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    AI OUTPUT
                                </p>

                                <textarea
                                    value={example.output_text}
                                    onChange={(e) =>
                                        editLocalExample(
                                            example.id,
                                            "output_text",
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        border: "1px solid #3a3a3a",
                                        background: "#111111",
                                        color: "#ffffff",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

                            <div>
                                <p
                                    style={{
                                        color: "#a78bfa",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    NOTES
                                </p>

                                <textarea
                                    value={example.notes || ""}
                                    onChange={(e) =>
                                        editLocalExample(
                                            example.id,
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    rows={2}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        border: "1px solid #3a3a3a",
                                        background: "#111111",
                                        color: "#ffffff",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

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
                                        updateExample(example)
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
                                        deleteExample(example.id)
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
