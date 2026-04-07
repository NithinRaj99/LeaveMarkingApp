import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useAllocations() {
    const { user } = useAuth();
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllocations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('leave_allocations')
            .select('*')
            .eq('user_id', user.id)
            .order('leave_type');

        if (!error) setAllocations(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchAllocations();
    }, [fetchAllocations]);

    const updateAllocation = async (id, totalAllowed) => {
        const { data, error } = await supabase
            .from('leave_allocations')
            .update({ total_allowed: totalAllowed })
            .eq('id', id)
            .select()
            .single();
        if (!error) {
            setAllocations((prev) => prev.map((a) => (a.id === id ? data : a)));
        }
        return { data, error };
    };

    return { allocations, loading, fetchAllocations, updateAllocation };
}
