import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Save } from 'lucide-react';
import { LEAVE_TYPES, DURATION_OPTIONS } from '../lib/constants';
import toast from 'react-hot-toast';

export default function LeaveForm({ onSubmit, onClose, initialData, allocations, leaves }) {
    const [formData, setFormData] = useState({
        leave_type: 'Casual Leave',
        start_date: '',
        end_date: '',
        duration: 'full_day',
        note: '',
    });
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                leave_type: initialData.leave_type || 'Casual Leave',
                start_date: initialData.start_date || '',
                end_date: initialData.end_date || initialData.start_date || '',
                duration: initialData.duration || 'full_day',
                note: initialData.note || '',
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (!formData.leave_type || !allocations) return;

        const allocation = allocations.find((a) => a.leave_type === formData.leave_type);
        if (!allocation) return;

        const takenLeaves = leaves.filter(
            (l) => l.leave_type === formData.leave_type && (!initialData || l.id !== initialData.id)
        );
        const totalTaken = takenLeaves.reduce(
            (sum, l) => sum + (l.duration === 'half_day' ? 0.5 : 1),
            0
        );
        const newCount = formData.duration === 'half_day' ? 0.5 : 1;

        if (totalTaken + newCount > allocation.total_allowed) {
            setWarning(
                `Warning: This will exceed your ${formData.leave_type} balance! (${totalTaken + newCount}/${allocation.total_allowed})`
            );
        } else {
            setWarning('');
        }
    }, [formData.leave_type, formData.duration, allocations, leaves, initialData]);

    const handleChange = (field, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'start_date' && !prev.end_date) {
                updated.end_date = value;
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date) {
            toast.error('Please select dates');
            return;
        }
        if (formData.end_date < formData.start_date) {
            toast.error('End date cannot be before start date');
            return;
        }
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl border border-surface-lighter/30 animate-in">
                <div className="flex items-center justify-between p-6 border-b border-surface-lighter/30">
                    <h2 className="text-lg font-bold text-text-bright">
                        {initialData?.id ? 'Edit Leave' : 'Add Leave'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:text-text hover:bg-surface-light rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {warning && (
                        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning text-sm">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Leave Type</label>
                        <select
                            id="leave-type-select"
                            value={formData.leave_type}
                            onChange={(e) => handleChange('leave_type', e.target.value)}
                            className="w-full px-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
                        >
                            {LEAVE_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Start Date</label>
                            <input
                                id="leave-start-date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className="w-full px-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">End Date</label>
                            <input
                                id="leave-end-date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                className="w-full px-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Duration</label>
                        <div className="flex gap-3">
                            {DURATION_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleChange('duration', value)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${formData.duration === value
                                            ? 'bg-primary text-white'
                                            : 'bg-surface-light text-text-muted border border-surface-lighter hover:border-primary/50'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Note (optional)</label>
                        <textarea
                            id="leave-note"
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            placeholder="Reason for leave..."
                        />
                    </div>

                    <button
                        id="leave-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Saving...' : initialData?.id ? 'Update Leave' : 'Add Leave'}
                    </button>
                </form>
            </div>
        </div>
    );
}
