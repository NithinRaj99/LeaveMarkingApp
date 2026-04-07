import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useAdmin() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [allAllocations, setAllAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);

        const [profilesRes, leavesRes, allocationsRes] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at'),
            supabase.from('leaves').select('*').order('start_date', { ascending: false }),
            supabase.from('leave_allocations').select('*'),
        ]);

        if (!profilesRes.error) setUsers(profilesRes.data || []);
        if (!leavesRes.error) setAllLeaves(leavesRes.data || []);
        if (!allocationsRes.error) setAllAllocations(allocationsRes.data || []);

        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const sendPasswordReset = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login`,
        });
        return { error };
    };

    const getUserStats = (userId) => {
        const userLeaves = allLeaves.filter((l) => l.user_id === userId);
        const userAllocations = allAllocations.filter((a) => a.user_id === userId);

        const taken = {};
        userLeaves.forEach((l) => {
            const count = l.duration === 'half_day' ? 0.5 : 1;
            taken[l.leave_type] = (taken[l.leave_type] || 0) + count;
        });

        const stats = userAllocations.map((a) => ({
            leaveType: a.leave_type,
            totalAllowed: a.total_allowed,
            taken: taken[a.leave_type] || 0,
            remaining: a.total_allowed - (taken[a.leave_type] || 0),
        }));

        return {
            totalLeaves: userLeaves.length,
            stats,
            leaves: userLeaves,
        };
    };

    return { users, allLeaves, allAllocations, loading, fetchAll, sendPasswordReset, getUserStats };
}
