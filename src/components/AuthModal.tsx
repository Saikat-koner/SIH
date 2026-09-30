import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  X,
  KeyRound,
  BadgeCheck,
  Compass,
  AlertCircle,
  HelpCircle,
  Landmark,
} from 'lucide-react';
import { AuthUser, AuthRole } from '../types';
import { loginUser, registerUser } from '../services/cadastralApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  defaultRole?: 'citizen' | 'admin';
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'citizen',
  defaultTab = 'login',
}) => {
  const [activeSegment, setActiveSegment] = useState<'citizen' | 'admin'>(defaultRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(defaultTab);

  // Form State
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [village, setVillage] = useState<string>('Haveli');
  const [district, setDistrict] = useState<string>('Pune');
  const [state, setState] = useState<string>('Maharashtra');
  const [khasraNumber, setKhasraNumber] = useState<string>('MH-PUN-HAV-2024-142B');
  const [officerRole, setOfficerRole] = useState<AuthRole>('admin');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveSegment(defaultRole);
    setAuthMode(defaultTab);
  }, [defaultRole, defaultTab]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const enteredIdentifier = identifier.trim() || (activeSegment === 'citizen' ? 'rameshwar.shinde@farmer.in' : 'suresh.deshmukh@rev.gov.in');
    const enteredPassword = password.trim() || 'official@2025';

    try {
      const res = await loginUser({
        identifier: enteredIdentifier,
        password: enteredPassword,
        role: activeSegment,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill helper for test verification
  const handleAutofill = (testRole: 'citizen' | 'admin') => {
    if (testRole === 'citizen') {
      setActiveSegment('citizen');
      setIdentifier('rameshwar.shinde@farmer.in');
      setPassword('official@2025');
    } else {
      setActiveSegment('admin');
      setIdentifier('suresh.deshmukh@rev.gov.in');
      setPassword('official@2025');
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await registerUser({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: activeSegment === 'admin' ? officerRole : 'citizen',
        village,
        district,
        state,
        khasraNumber,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Sovereign Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-5 border-b border-emerald-800/40 relative">
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Landmark className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-300">
                  Sovereign National Cadastre
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950 uppercase">
                  DILRMP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {activeSegment === 'citizen' ? 'Citizen Land Services Login' : 'Revenue Officer & GIS Login'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            {activeSegment === 'citizen'
              ? 'Access digitized village land records, download official E-Gharouni property cards, and lodge boundary disputes.'
              : 'Secure authentication for Survey of India CORS drone surveyors, Tehsildars, and Patwari revenue officials.'}
          </p>

          {/* Segment Switcher (Citizen vs Officer) */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              id="btn-tab-citizen-auth"
              onClick={() => {
                setActiveSegment('citizen');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                activeSegment === 'citizen'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen Portal (नागरिक)</span>
            </button>
            <button
              id="btn-tab-admin-auth"
              onClick={() => {
                setActiveSegment('admin');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                activeSegment === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Officer / Admin (अधिकारी)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Sub-mode switcher (Login vs Register) */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`text-sm font-bold pb-1 transition border-b-2 ${
                  authMode === 'login'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`text-sm font-bold pb-1 transition border-b-2 ${
                  authMode === 'register'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {activeSegment === 'citizen' ? 'New Citizen Registration' : 'Register Field Personnel'}
              </button>
            </div>

            <span className="text-[11px] text-slate-400">DPDP Act 2023 Compliant</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Official Sovereign Single Sign-On Notice & Quick-Fill Chips */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>e-Pramaan / MeriPehchaan SSO Gateway</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                SSL 256-Bit Encrypted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 text-[10px] mr-1">Quick Select:</span>
              <button
                type="button"
                onClick={() => handleAutofill('citizen')}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 font-medium"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Citizen: Rameshwar Shinde
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('admin')}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-teal-500 text-xs text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1 font-medium"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Officer: Suresh Deshmukh (Tehsildar)
              </button>
            </div>
          </div>

          {/* FORM: Sign In */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {activeSegment === 'citizen' ? 'Registered Mobile Number or Email' : 'Government Officer ID / Official Email'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {activeSegment === 'citizen' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeSegment === 'citizen'
                        ? 'e.g. 9876543210 or rameshwar.shinde@farmer.in'
                        : 'e.g. suresh.deshmukh@rev.gov.in or OFF-PUN-091'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {activeSegment === 'citizen' ? 'OTP or Password' : 'Secure Digital PIN / Password'}
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">
                    {activeSegment === 'citizen' ? 'Send OTP to Mobile' : 'Forgot Security PIN?'}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or OTP"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>{activeSegment === 'citizen' ? 'Access Citizen Land Dashboard' : 'Authenticate Revenue Officer'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORM: Registration */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (as in Aadhaar / Land Deed)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rameshwar Kisan Shinde"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (for SMS & OTP)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@rural.in"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {activeSegment === 'citizen' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Village / Gram Panchayat
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tehsil / District
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Khasra / Plot #
                    </label>
                    <input
                      type="text"
                      value={khasraNumber}
                      onChange={(e) => setKhasraNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designated Cadastral Role
                  </label>
                  <select
                    value={officerRole}
                    onChange={(e) => setOfficerRole(e.target.value as AuthRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="admin">Revenue Inspector (RI) / Tehsildar</option>
                    <option value="surveyor">Survey of India (SOI) Drone Pilot</option>
                    <option value="auditor">Village Accountant / Patwari</option>
                    <option value="viewer">Public Audit Officer</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Generate Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 px-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with SHA-256 Sovereign Protocol</span>
          </div>
          <a
            href="tel:18001801551"
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Toll-Free Helpline: 1800-180-1551
          </a>
        </div>
      </div>
    </div>
  );
};
