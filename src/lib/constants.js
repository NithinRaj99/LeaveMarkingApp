export const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave'];

export const LEAVE_COLORS = {
    'Casual Leave': { bg: '#6366f1', text: '#ffffff' },
    'Sick Leave': { bg: '#ef4444', text: '#ffffff' },
    'Earned Leave': { bg: '#22c55e', text: '#ffffff' },
};

export const DURATION_OPTIONS = [
    { value: 'full_day', label: 'Full Day' },
    { value: 'half_day', label: 'Half Day' },
];

export const calculateLeaveDays = (startDate, endDate, duration) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in milliseconds, convert to days, add 1 (inclusive)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Only apply half-day logic if it's a single day leave, otherwise it doesn't make sense 
    // to have a multi-day "half day" leave. If they selected multi-day and "half_day", 
    // we'll just treat it as the total days minus 0.5 for the partial last day.
    if (diffDays === 1 && duration === 'half_day') {
        return 0.5;
    }

    // For multi-day 'half_day' selects, assume the last day is a half day (total days - 0.5)
    if (diffDays > 1 && duration === 'half_day') {
        return diffDays - 0.5;
    }

    return diffDays;
};

