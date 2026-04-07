import { useState } from 'react';
import { useAllocations } from '../hooks/useAllocations';
import { useLeaves } from '../hooks/useLeaves';
import { LEAVE_COLORS } from '../lib/constants';
import { Save, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Allocations() {
    const { allocations, loading, updateAllocation } = useAllocations();
    const { leaves } = useLeaves();
    const [editValues, setEditValues] = useState({});
    const [saving, setSaving] = useState({});

    const getTaken = (leaveType) => {
        return leaves
            .filter((l) => l.leave_type === leaveType)
            .reduce((sum, l) => sum + (l.duration === 'half_day' ? 0.5 : 1), 0);
    };

    const handleSave = async (alloc) => {
        const newVal = editValues[alloc.id];
        if (newVal === undefined || newVal === alloc.total_allowed) return;

        setSaving((prev) => ({ ...prev, [alloc.id]: true }));
        const { error } = await updateAllocation(alloc.id, parseInt(newVal));
        setSaving((prev) => ({ ...prev, [alloc.id]: false }));

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(`${alloc.leave_type} updated!`);
            setEditValues((prev) => {
                const next = { ...prev };
                delete next[alloc.id];
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-bright">Leave Allocations</h1>
                <p className="text-text-muted text-sm mt-1">Set your total leave quota per type</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allocations.map((alloc) => {
                    const taken = getTaken(alloc.leave_type);
                    const color = LEAVE_COLORS[alloc.leave_type] || { bg: '#6366f1' };
                    const editVal = editValues[alloc.id];
                    const currentTotal = editVal !== undefined ? parseInt(editVal) : alloc.total_allowed;
                    const remaining = currentTotal - taken;
                    const isExceeded = remaining < 0;
                    const pct = currentTotal > 0 ? (taken / currentTotal) * 100 : 0;

                    return (
                        <div
                            key={alloc.id}
                            className="bg-surface rounded-2xl border border-surface-lighter/30 p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${color.bg}20` }}
                                >
                                    <Settings className="w-5 h-5" style={{ color: color.bg }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-bright">{alloc.leave_type}</h3>
                                    <p className={`text-xs ${isExceeded ? 'text-danger' : 'text-text-muted'}`}>
                                        {taken} used · {remaining} remaining
                                    </p>
                                </div>
                            </div>

                            <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(pct, 100)}%`,
                                        backgroundColor: isExceeded ? '#ef4444' : color.bg,
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-text-muted whitespace-nowrap">Total:</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editVal !== undefined ? editVal : alloc.total_allowed}
                                    onChange={(e) =>
                                        setEditValues((prev) => ({ ...prev, [alloc.id]: e.target.value }))
                                    }
                                    className="flex-1 px-3 py-2 bg-surface-light rounded-lg border border-surface-lighter text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button
                                    onClick={() => handleSave(alloc)}
                                    disabled={
                                        saving[alloc.id] || editVal === undefined || parseInt(editVal) === alloc.total_allowed
                                    }
                                    className="p-2 bg-primary/15 text-primary rounded-lg hover:bg-primary/25 transition-colors disabled:opacity-30 cursor-pointer"
                                >
                                    {saving[alloc.id] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
