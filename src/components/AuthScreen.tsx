import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Quick switch demo profiles
  const demoProfiles = [
    {
      name: 'Alex Vance (Photographer)',
      email: 'alex@zero.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Elena Rostova (Traveler)',
      email: 'elena@zero.app',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Marcus Brody (Architect)',
      email: 'marcus@zero.app',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Authenticate
    onLogin({
      id: 'usr_me',
      email,
      username: username || email.split('@')[0],
      displayName: displayName || (isSignUp ? 'New Explorer' : 'Alex Vance'),
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
  };

  const handleSelectDemo = (demo: typeof demoProfiles[0]) => {
    onLogin({
      id: 'usr_me',
      email: demo.email,
      username: demo.email.split('@')[0],
      displayName: demo.name.split(' (')[0],
      avatarUrl: demo.avatar,
    });
  };

  return (
    <div
      id="zero-auth-screen"
      className="min-h-full flex flex-col justify-between p-6 select-none bg-[#0c0e12] text-white"
    >
      {/* Top Brand Logo */}
      <div className="pt-6 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/10">
          <div className="w-full h-full bg-[#0c0e12] rounded-[14px] flex items-center justify-center">
            <span className="font-mono text-2xl font-black tracking-tighter text-emerald-400">
              0
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white font-mono">
          ZERO
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Social Network & Private Cloud Vault
        </p>
      </div>

      {/* Form Card */}
      <div className="my-auto py-6">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800/80 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                !isSignUp ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                isSignUp ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isSignUp && (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Alex Vance"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      placeholder="alexvance"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@zero.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-[11px] font-medium pt-1 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-colors mt-2 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{isSignUp ? 'Start Storing with ZERO' : 'Sign In to Vault'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login selector */}
          <div className="mt-5 pt-4 border-t border-neutral-800/80">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2 text-center">
              Or quick explore with demo account:
            </span>
            <div className="space-y-1.5">
              {demoProfiles.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className="w-full p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={demo.avatar}
                      alt={demo.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium group-hover:text-white">
                      {demo.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Instant Demo</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature perks footer */}
      <div className="pb-4 text-center space-y-1 text-[11px] text-neutral-500">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>50 GB Cloud Storage included • E2E Encrypted</span>
        </p>
      </div>
    </div>
  );
};
