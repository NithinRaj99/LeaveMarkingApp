import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Welcome back!');
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-bright">Welcome Back</h1>
                    <p className="text-text-muted mt-2">Sign in to manage your leaves</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-surface rounded-2xl p-8 shadow-xl border border-surface-lighter/30"
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    id="login-email"
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
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-light rounded-xl border border-surface-lighter text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <p className="text-center text-text-muted mt-6 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
