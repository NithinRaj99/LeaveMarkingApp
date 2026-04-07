import { useState } from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { useAllocations } from '../hooks/useAllocations';
import LeaveForm from '../components/LeaveForm';
import { LEAVE_COLORS } from '../lib/constants';
import { Plus, Edit2, Trash2, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function LeaveList() {
    const { leaves, loading, addLeave, updateLeave, deleteLeave } = useLeaves();
    const { allocations } = useAllocations();
    const [showForm, setShowForm] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All Months');

    const filteredLeaves = leaves.filter((l) => {
        if (filterType !== 'All' && l.leave_type !== filterType) return false;
        if (filterMonth !== 'All Months') {
            const month = new Date(l.start_date).getMonth();
            if (MONTHS[month + 1] !== filterMonth) return false;
        }
        return true;
    });

    const handleAdd = async (formData) => {
        const { error } = await addLeave(formData);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Leave added!');
            setShowForm(false);
        }
    };

    const handleEdit = async (formData) => {
        const { error } = await updateLeave(editingLeave.id, formData);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Leave updated!');
            setEditingLeave(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this leave entry?')) return;
        const { error } = await deleteLeave(id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Leave deleted');
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-bright">My Leaves</h1>
                    <p className="text-text-muted text-sm mt-1">{leaves.length} total leave entries</p>
                </div>
                <button
                    id="add-leave-btn"
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add Leave
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-text-muted" />
                <select
                    id="filter-type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-surface rounded-xl border border-surface-lighter text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    <option value="All">All Types</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                </select>
                <select
                    id="filter-month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2 bg-surface rounded-xl border border-surface-lighter text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Leave Table */}
            <div className="bg-surface rounded-2xl border border-surface-lighter/30 overflow-hidden">
                {filteredLeaves.length === 0 ? (
                    <div className="p-12 text-center text-text-muted">
                        <p className="text-lg">No leaves found</p>
                        <p className="text-sm mt-1">Add a leave entry to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-lighter/30">
                                    <th className="text-left p-4 text-text-muted font-medium">Type</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Dates</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Duration</th>
                                    <th className="text-left p-4 text-text-muted font-medium">Note</th>
                                    <th className="text-right p-4 text-text-muted font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaves.map((leave) => {
                                    const color = LEAVE_COLORS[leave.leave_type] || { bg: '#6366f1' };
                                    return (
                                        <tr
                                            key={leave.id}
                                            className="border-b border-surface-lighter/20 hover:bg-surface-light/50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: color.bg }}
                                                    />
                                                    <span className="text-text">{leave.leave_type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-text">
                                                {leave.start_date === leave.end_date
                                                    ? new Date(leave.start_date).toLocaleDateString()
                                                    : `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${leave.duration === 'half_day'
                                                            ? 'bg-warning/15 text-warning'
                                                            : 'bg-primary/15 text-primary'
                                                        }`}
                                                >
                                                    {leave.duration === 'half_day' ? 'Half Day' : 'Full Day'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-text-muted max-w-[200px] truncate">
                                                {leave.note || '—'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setEditingLeave(leave)}
                                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(leave.id)}
                                                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showForm && (
                <LeaveForm
                    onSubmit={handleAdd}
                    onClose={() => setShowForm(false)}
                    allocations={allocations}
                    leaves={leaves}
                />
            )}
            {editingLeave && (
                <LeaveForm
                    onSubmit={handleEdit}
                    onClose={() => setEditingLeave(null)}
                    initialData={editingLeave}
                    allocations={allocations}
                    leaves={leaves}
                />
            )}
        </div>
    );
}
