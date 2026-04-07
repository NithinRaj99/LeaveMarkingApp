import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useLeaves } from '../hooks/useLeaves';
import { useAllocations } from '../hooks/useAllocations';
import LeaveForm from '../components/LeaveForm';
import { LEAVE_COLORS } from '../lib/constants';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CalendarView() {
    const { leaves, loading, addLeave, updateLeave } = useLeaves();
    const { allocations } = useAllocations();
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingLeave, setEditingLeave] = useState(null);

    const events = useMemo(
        () =>
            leaves.map((leave) => {
                const color = LEAVE_COLORS[leave.leave_type] || { bg: '#6366f1', text: '#ffffff' };
                const endDate = new Date(leave.end_date);
                endDate.setDate(endDate.getDate() + 1);

                return {
                    id: leave.id,
                    title: `${leave.leave_type}${leave.duration === 'half_day' ? ' (½)' : ''}`,
                    start: leave.start_date,
                    end: endDate.toISOString().split('T')[0],
                    backgroundColor: color.bg,
                    textColor: color.text,
                    extendedProps: { leave },
                };
            }),
        [leaves]
    );

    const handleDateClick = (info) => {
        const existingLeave = leaves.find(
            (l) => l.start_date <= info.dateStr && l.end_date >= info.dateStr
        );
        if (existingLeave) {
            setEditingLeave(existingLeave);
        } else {
            setSelectedDate(info.dateStr);
            setShowForm(true);
        }
    };

    const handleEventClick = (info) => {
        const leave = info.event.extendedProps.leave;
        setEditingLeave(leave);
    };

    const handleAdd = async (formData) => {
        const { error } = await addLeave(formData);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Leave added!');
            setShowForm(false);
            setSelectedDate(null);
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
                <h1 className="text-2xl font-bold text-text-bright">Calendar</h1>
                <p className="text-text-muted text-sm mt-1">Click a date to add or view leave</p>
            </div>

            <div className="bg-surface rounded-2xl border border-surface-lighter/30 p-4 md:p-6">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth',
                    }}
                    height="auto"
                    dayMaxEvents={3}
                    eventDisplay="block"
                />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                {Object.entries(LEAVE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-sm text-text-muted">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.bg }} />
                        {type}
                    </div>
                ))}
            </div>

            {showForm && (
                <LeaveForm
                    onSubmit={handleAdd}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedDate(null);
                    }}
                    initialData={selectedDate ? { start_date: selectedDate, end_date: selectedDate } : null}
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
