
"use client";

import { useMemo, useState } from "react";

type ContentActivityProps = {
    dates: string[];
};

type ViewMode = "weekly" | "daily";

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function ContentActivity({
                                            dates,
                                        }: ContentActivityProps) {
    // Convert database timestamps into valid dates.
    const validDates = useMemo(() => {
        return dates
            .map((date) => new Date(date))
            .filter((date) => !Number.isNaN(date.getTime()));
    }, [dates]);

    // Available years, including the current year.
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();

        const available = new Set<number>([currentYear]);

        validDates.forEach((date) => {
            available.add(date.getUTCFullYear());
        });

        return Array.from(available).sort((a, b) => b - a);
    }, [validDates]);

    const [selectedYear, setSelectedYear] = useState<number>(
        years[0]
    );

    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth()
    );

    const [view, setView] = useState<ViewMode>("weekly");

    // Calculate captions generated during selected month.
    const chartData = useMemo(() => {
        const daysInMonth = new Date(
            Date.UTC(selectedYear, selectedMonth + 1, 0)
        ).getUTCDate();

        const dailyCounts = Array(daysInMonth).fill(0) as number[];

        validDates.forEach((date) => {
            if (
                date.getUTCFullYear() === selectedYear &&
                date.getUTCMonth() === selectedMonth
            ) {
                dailyCounts[date.getUTCDate() - 1] += 1;
            }
        });

        const total = dailyCounts.reduce(
            (sum, value) => sum + value,
            0
        );

        // Daily view: one bar for every day.
        if (view === "daily") {
            const bars = dailyCounts.map((count, index) => ({
                label: String(index + 1),
                count,
                description:
                    `${MONTH_NAMES[selectedMonth]} ${index + 1}`,
            }));

            return {
                total,
                bars,
                peak: Math.max(...dailyCounts, 0),
            };
        }

        // Weekly view: seven-day intervals within the month.
        const weeklyBars = [];

        for (let start = 1; start <= daysInMonth; start += 7) {
            const end = Math.min(start + 6, daysInMonth);

            const count = dailyCounts
                .slice(start - 1, end)
                .reduce((sum, value) => sum + value, 0);

            weeklyBars.push({
                label: `${start}–${end}`,
                count,
                description:
                    `${MONTH_NAMES[selectedMonth]} ${start}–${end}`,
            });
        }

        return {
            total,
            bars: weeklyBars,
            peak: Math.max(
                ...weeklyBars.map((bar) => bar.count),
                0
            ),
        };
    }, [validDates, selectedYear, selectedMonth, view]);

    const maxScale = Math.max(chartData.peak, 1);
    const hasActivity = chartData.total > 0;

    return (
        <section className="content-activity-panel">
            <div className="content-activity-heading">
                <div>
                    <p className="content-activity-eyebrow">
                        CONTENT ANALYTICS
                    </p>

                    <h2>Content Activity</h2>

                    <p className="content-activity-description">
                        Explore when your community generates
                        AI captions.
                    </p>
                </div>

                <div className="content-activity-total">
                    <strong>{chartData.total}</strong>
                    <span>Captions this month</span>
                </div>
            </div>

            {/* Separate Year and Month dropdowns */}
            <div className="content-activity-controls">
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <div className="content-month-control">
                        <label htmlFor="activity-year">
                            Year
                        </label>

                        <select
                            id="activity-year"
                            value={selectedYear}
                            onChange={(event) =>
                                setSelectedYear(Number(event.target.value))
                            }
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="content-month-control">
                        <label htmlFor="activity-month">
                            Month
                        </label>

                        <select
                            id="activity-month"
                            value={selectedMonth}
                            onChange={(event) =>
                                setSelectedMonth(Number(event.target.value))
                            }
                        >
                            {MONTH_NAMES.map((name, index) => (
                                <option key={name} value={index}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div
                    className="content-view-switch"
                    role="group"
                    aria-label="Chart time interval"
                >
                    <button
                        type="button"
                        className={
                            view === "weekly" ? "active" : ""
                        }
                        onClick={() => setView("weekly")}
                        aria-pressed={view === "weekly"}
                    >
                        Weekly
                    </button>

                    <button
                        type="button"
                        className={
                            view === "daily" ? "active" : ""
                        }
                        onClick={() => setView("daily")}
                        aria-pressed={view === "daily"}
                    >
                        Daily
                    </button>
                </div>
            </div>

            <div className="content-activity-chart-box">
                <div className="content-activity-chart-header">
                    <div>
                        <h3>
                            {MONTH_NAMES[selectedMonth]} {selectedYear}
                        </h3>

                        <p>
                            {view === "weekly"
                                ? "Captions generated by seven-day period"
                                : "Captions generated each day"}
                        </p>
                    </div>

                    <span className="content-activity-legend">
                        <span />
                        AI Captions
                    </span>
                </div>

                {!hasActivity ? (
                    <div className="content-activity-empty">
                        No caption activity recorded for this month yet.
                        <p style={{
                            margin: "8px 0 0",
                            color: "#e5e5e5",
                            fontSize: "13px",
                        }}>
                            Select another month or year to explore
                            existing activity.
                        </p>
                    </div>
                ) : (
                    <div className="content-chart-scroll">
                        <div
                            className={`content-chart-bars ${
                                view === "daily"
                                    ? "content-chart-daily"
                                    : "content-chart-weekly"
                            }`}
                            key={`${selectedYear}-${selectedMonth}-${view}`}
                        >
                            {chartData.bars.map((bar) => {
                                const height =
                                    (bar.count / maxScale) * 100;

                                return (
                                    <div
                                        className="content-chart-column"
                                        key={bar.label}
                                        title={`${bar.description}: ${bar.count} captions`}
                                    >
                                        <div className="content-chart-plot">
                                            <div
                                                className="content-chart-bar"
                                                style={{
                                                    height: `${height}%`,
                                                    opacity:
                                                        bar.count === 0
                                                            ? 0.25
                                                            : 1,
                                                }}
                                            />
                                        </div>

                                        <span className="content-chart-label">
                                            {bar.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="content-chart-footer">
                    <span>
                        {view === "weekly"
                            ? "Weekly view"
                            : "Daily view"}
                    </span>

                    <span>
                        {chartData.total} captions generated
                    </span>
                </div>
            </div>
        </section>
    );
}
