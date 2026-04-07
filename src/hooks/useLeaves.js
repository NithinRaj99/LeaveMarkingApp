import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useLeaves() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('leaves')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

        if (!error) setLeaves(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const addLeave = async (leave) => {
        const { data, error } = await supabase
            .from('leaves')
            .insert([{ ...leave, user_id: user.id }])
            .select()
            .single();
        if (!error) {
            setLeaves((prev) => [data, ...prev]);
        }
        return { data, error };
    };

    const updateLeave = async (id, updates) => {
        const { data, error } = await supabase
            .from('leaves')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (!error) {
            setLeaves((prev) => prev.map((l) => (l.id === id ? data : l)));
        }
        return { data, error };
    };

    const deleteLeave = async (id) => {
        const { error } = await supabase.from('leaves').delete().eq('id', id);
        if (!error) {
            setLeaves((prev) => prev.filter((l) => l.id !== id));
        }
        return { error };
    };

    return { leaves, loading, fetchLeaves, addLeave, updateLeave, deleteLeave };
}
