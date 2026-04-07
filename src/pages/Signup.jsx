import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const { error } = await signUp(email, password, fullName);
        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Account created! Check your email to verify.');
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-bright">Create Account</h1>
                    <p className="text-text-muted mt-2">Start managing your leaves today</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-surface rounded-2xl p-8 shadow-xl border border-surface-lighter/30"
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            id="signup-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>

                    <p className="text-center text-text-muted mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
