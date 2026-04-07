import { useMemo } from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { useAllocations } from '../hooks/useAllocations';
import { LEAVE_COLORS, LEAVE_TYPES, calculateLeaveDays } from '../lib/constants';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { CalendarDays, TrendingUp, PieChart, Clock, Loader2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
    const { leaves, loading: leavesLoading } = useLeaves();
    const { allocations, loading: allocLoading } = useAllocations();

    const stats = useMemo(() => {
        const taken = {};
        leaves.forEach((l) => {
            const count = calculateLeaveDays(l.start_date, l.end_date, l.duration);
            taken[l.leave_type] = (taken[l.leave_type] || 0) + count;
        });

        const totalTaken = Object.values(taken).reduce((a, b) => a + b, 0);
        const totalAllowed = allocations.reduce((sum, a) => sum + a.total_allowed, 0);
        const totalRemaining = totalAllowed - totalTaken;
        const percentUsed = totalAllowed > 0 ? ((totalTaken / totalAllowed) * 100).toFixed(1) : 0;

        const byType = LEAVE_TYPES.map((type) => {
            const alloc = allocations.find((a) => a.leave_type === type);
            return {
                type,
                taken: taken[type] || 0,
                total: alloc?.total_allowed || 0,
                remaining: (alloc?.total_allowed || 0) - (taken[type] || 0),
            };
        });

        return { totalTaken, totalAllowed, totalRemaining, percentUsed, byType, taken };
    }, [leaves, allocations]);

    const monthlyData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
            count: 0,
        }));

        leaves.forEach((l) => {
            const monthIdx = new Date(l.start_date).getMonth();
            months[monthIdx].count += calculateLeaveDays(l.start_date, l.end_date, l.duration);
        });

        return months;
    }, [leaves]);

    const doughnutData = {
        labels: stats.byType.map((s) => s.type),
        datasets: [
            {
                data: stats.byType.map((s) => s.taken),
                backgroundColor: stats.byType.map((s) => LEAVE_COLORS[s.type]?.bg || '#6366f1'),
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    };

    const barData = {
        labels: monthlyData.map((m) => m.month),
        datasets: [
            {
                label: 'Leaves',
                data: monthlyData.map((m) => m.count),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#a6adc8', font: { size: 12 } },
            },
        },
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: {
                grid: { color: 'rgba(54, 54, 80, 0.3)' },
                ticks: { color: '#a6adc8' },
            },
            y: {
                grid: { color: 'rgba(54, 54, 80, 0.3)' },
                ticks: { color: '#a6adc8', stepSize: 1 },
                beginAtZero: true,
            },
        },
    };

    if (leavesLoading || allocLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-bright">Dashboard</h1>
                <p className="text-text-muted text-sm mt-1">Your leave overview at a glance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={<CalendarDays className="w-5 h-5" />}
                    label="Total Taken"
                    value={stats.totalTaken}
                    sub={`of ${stats.totalAllowed} days`}
                    color="text-primary"
                    bgColor="bg-primary/15"
                />
                <SummaryCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Remaining"
                    value={stats.totalRemaining}
                    sub="days left"
                    color="text-success"
                    bgColor="bg-success/15"
                />
                <SummaryCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="% Used"
                    value={`${stats.percentUsed}%`}
                    sub="of total allocation"
                    color="text-warning"
                    bgColor="bg-warning/15"
                />
                <SummaryCard
                    icon={<PieChart className="w-5 h-5" />}
                    label="Leave Entries"
                    value={leaves.length}
                    sub="total records"
                    color="text-secondary"
                    bgColor="bg-secondary/15"
                />
            </div>

            {/* Leave Balance */}
            <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                <h2 className="text-lg font-semibold text-text-bright mb-4">Leave Balance</h2>
                <div className="space-y-4">
                    {stats.byType.map((s) => {
                        const pct = s.total > 0 ? (s.taken / s.total) * 100 : 0;
                        const isExceeded = s.remaining < 0;
                        return (
                            <div key={s.type}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: LEAVE_COLORS[s.type]?.bg }}
                                        />
                                        <span className="text-sm font-medium text-text">{s.type}</span>
                                    </div>
                                    <span className={`text-sm font-medium ${isExceeded ? 'text-danger' : 'text-text-muted'}`}>
                                        {s.taken} / {s.total}
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-surface-lighter rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(pct, 100)}%`,
                                            backgroundColor: isExceeded ? '#ef4444' : LEAVE_COLORS[s.type]?.bg,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                    <h2 className="text-lg font-semibold text-text-bright mb-4">By Leave Type</h2>
                    <div className="max-w-[280px] mx-auto">
                        <Doughnut data={doughnutData} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-6">
                    <h2 className="text-lg font-semibold text-text-bright mb-4">Monthly Summary</h2>
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, sub, color, bgColor }) {
    return (
        <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${bgColor}`}>
                    <div className={color}>{icon}</div>
                </div>
                <span className="text-sm text-text-muted">{label}</span>
            </div>
            <p className="text-3xl font-bold text-text-bright">{value}</p>
            <p className="text-xs text-text-muted mt-1">{sub}</p>
        </div>
    );
}
