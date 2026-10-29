"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MixItem = {
    id: number;
    prompt_chain_id: number;
    weight: number;
    active: boolean;
    chain_name: string;
};

export default function MixManager({
                                       initialMix,
                                   }: {
    initialMix: MixItem[];
}) {
    const supabase = createClient();

    const [mix, setMix] = useState(initialMix);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    const updateWeight = (id: number, weight: number) => {
        setMix((current) =>
            current.map((item) =>
                item.id === id ? { ...item, weight } : item
            )
        );
    };

    const toggleActive = (id: number) => {
        setMix((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, active: !item.active }
                    : item
            )
        );
    };

    const saveMixItem = async (item: MixItem) => {
        setSavingId(item.id);
        setMessage("");

        const { error } = await supabase
            .from("prompt_chain_mix")
            .update({
                weight: item.weight,
                active: item.active,
            })
            .eq("id", item.id);

        if (error) {
            console.error(error);
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage(`${item.chain_name} saved successfully.`);
        }

        setSavingId(null);
    };

    return (
        <div
            style={{
                display: "grid",
                gap: "18px",
            }}
        >
            {mix.map((item) => (
                <div
                    key={item.id}
                    style={{
                        background: "#0a0a0a",
                        border: item.active
                            ? "1px solid rgba(167, 139, 250, 0.35)"
                            : "1px solid #2f2f2f",
                        borderRadius: "18px",
                        padding: "24px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    margin: "0 0 6px",
                                    color: "#a78bfa",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                }}
                            >
                                PROMPT CHAIN
                            </p>

                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "22px",
                                }}
                            >
                                {item.chain_name}
                            </h3>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "18px",
                                flexWrap: "wrap",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    color: "#bdbdbd",
                                    fontSize: "14px",
                                }}
                            >
                                Weight

                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={item.weight}
                                    onChange={(e) =>
                                        updateWeight(
                                            item.id,
                                            Number(e.target.value)
                                        )
                                    }
                                    style={{
                                        width: "100px",
                                        padding: "10px 12px",
                                        borderRadius: "10px",
                                        border: "1px solid #3a3a3a",
                                        background: "#111111",
                                        color: "#ffffff",
                                    }}
                                />
                            </label>

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "#f5f5f5",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.active}
                                    onChange={() => toggleActive(item.id)}
                                />

                                {item.active ? "Active" : "Inactive"}
                            </label>

                            <button
                                type="button"
                                onClick={() => saveMixItem(item)}
                                disabled={savingId === item.id}
                                style={{
                                    padding: "11px 18px",
                                    borderRadius: "10px",
                                    border: "1px solid #a78bfa",
                                    background:
                                        savingId === item.id
                                            ? "#211832"
                                            : "#a78bfa",
                                    color:
                                        savingId === item.id
                                            ? "#c4b5fd"
                                            : "#090909",
                                    fontWeight: 700,
                                    cursor:
                                        savingId === item.id
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                {savingId === item.id
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {message && (
                <p
                    style={{
                        color: message.startsWith("Error")
                            ? "#fca5a5"
                            : "#c4b5fd",
                        marginTop: "6px",
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}