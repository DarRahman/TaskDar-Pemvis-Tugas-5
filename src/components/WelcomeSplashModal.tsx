import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Sparkles, UserCheck, Shield } from 'lucide-react';
import { STUDENT_METADATA } from '../data/initialTasks';
import { AppScreenPhase, StudentUserSession } from '../types/task';

export interface WelcomeSplashModalProps {
  screenPhase: AppScreenPhase;
  onFinishSplash: () => void;
  onLoginSuccess: (session: StudentUserSession) => void;
  onGoogleLogin: () => Promise<void>;
  isGoogleLoading?: boolean;
}

/*
 * Aptivo-style full-screen rising character splash animation followed by
 * Google Account Sign-In and STIKOM NIM login/registration.
 */
export const WelcomeSplashModal: React.FC<WelcomeSplashModalProps> = ({
  screenPhase,
  onFinishSplash,
  onLoginSuccess,
  onGoogleLogin,
  isGoogleLoading = false,
}) => {
  const [nameInput, setNameInput] = useState<string>(STUDENT_METADATA.name);
  const [nimInput, setNimInput] = useState<string>(STUDENT_METADATA.nim);
  const [classInput, setClassInput] = useState<string>('TI-1');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (screenPhase !== 'splash') return;
    const timer = window.setTimeout(() => {
      onFinishSplash();
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [screenPhase, onFinishSplash]);

  if (screenPhase === 'main') {
    return null;
  }

  const handleNimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedNim = nimInput.trim();
    if (!trimmedName) {
      setAuthError('Nama mahasiswa wajib diisi.');
      return;
    }
    if (!trimmedNim) {
      setAuthError('Nomor Induk Mahasiswa (NIM) wajib diisi.');
      return;
    }
    const firstWord = trimmedName.split(' ')[0] || trimmedName;
    onLoginSuccess({
      uid: `nim-${trimmedNim}`,
      name: trimmedName,
      shortName: firstWord,
      nim: trimmedNim,
      classGroup: classInput,
      semester: 'Semester 5',
      program: 'Teknik Informatika',
      institution: 'STIKOM Poltek Cirebon',
      email: `${trimmedNim}@mahasiswa.stikompoltek.ac.id`,
      avatarUrl: '/assets/mascot-splash.jpg',
      authMethod: 'nim',
    });
  };

  return (
    <AnimatePresence mode="wait">
      {screenPhase === 'splash' && (
        <motion.div
          key="aptivo-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.35 }}
          onClick={onFinishSplash}
          role="dialog"
          aria-label="Layar Pemuatan Aplikasi STIKOM Poltek Cirebon"
          className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-[#FFF7ED] text-[#0F172A] overflow-hidden cursor-pointer select-none"
        >
          {/* Top Brand Header rising softly */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="pt-14 px-6 text-center z-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEE2E2] border border-[#FECACA] text-[#C41E3A] text-xs font-extrabold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>STIKOM POLTEK CIREBON</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#C41E3A]">
              stikom.app
            </h1>
            <p className="text-xs font-bold text-[#64748B] mt-1">
              Manajer Tugas & Akademik Semester 5
            </p>
          </motion.div>

          {/* Center-to-Bottom Rising Character Animation (Aptivo Style) */}
          <motion.div
            initial={{ y: 280, scale: 0.82, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 110,
              damping: 15,
              delay: 0.1,
            }}
            className="relative flex flex-col items-center justify-end w-full px-6 pb-10"
          >
            <div className="w-64 h-64 rounded-[44px] overflow-hidden border-4 border-[#0F172A] shadow-2xl bg-[#FFF7ED] flex items-center justify-center">
              <img
                src="/assets/mascot-splash.jpg"
                alt="Maskot Mahasiswa STIKOM"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Loading Progress Pill */}
            <div className="mt-7 w-48 h-2.5 rounded-full bg-[#FED7AA] overflow-hidden border border-[#FDBA74]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.0, ease: 'easeInOut' }}
                className="h-full bg-[#C41E3A] rounded-full"
              />
            </div>
            <span className="mt-2.5 text-[11px] font-bold text-[#64748B]">
              Menyiapkan ruang belajar Anda...
            </span>
          </motion.div>
        </motion.div>
      )}

      {screenPhase === 'auth' && (
        <motion.div
          key="aptivo-auth-screen"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-label="Masuk Akun Mahasiswa STIKOM Poltek Cirebon"
          className="absolute inset-0 z-50 flex flex-col justify-between bg-[#FFF7ED] text-[#0F172A] p-5 overflow-y-auto"
        >
          {/* Top Mascot Greeting (Aptivo Screen 3 Layout) */}
          <div className="pt-4 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 14 }}
              className="w-32 h-32 rounded-[32px] overflow-hidden border-3 border-[#0F172A] shadow-md bg-white"
            >
              <img
                src="/assets/mascot-splash.jpg"
                alt="Karakter Sambutan STIKOM"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <span className="mt-3 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FEE2E2] text-[#C41E3A] text-[11px] font-extrabold">
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>Portal Akademik TI-1 · Semester 5</span>
            </span>

            <h1 className="mt-2 text-xl font-black tracking-tight text-[#0F172A]">
              Halo! Siapa nama & NIM kamu?
            </h1>
            <p className="mt-1 text-xs font-medium text-[#475569] max-w-[290px]">
              Masuk dengan Akun Google kampus atau gunakan identitas mahasiswa STIKOM Poltek Cirebon.
            </p>
          </div>

          {/* Auth Card */}
          <div className="my-auto py-3">
            <div className="bg-white rounded-[28px] border-2 border-[#0F172A] p-4 shadow-md space-y-3.5">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold flex items-center justify-center gap-2.5 shadow-xs transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                  />
                </svg>
                <span>
                  {isGoogleLoading
                    ? 'Menghubungkan Akun Google...'
                    : 'Lanjutkan dengan Akun Google'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Atau Identitas Mahasiswa
                </span>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#C41E3A]">
                  {authError}
                </div>
              )}

              <form onSubmit={handleNimSubmit} className="space-y-2.5" noValidate>
                <div>
                  <label
                    htmlFor="login-student-name"
                    className="block text-[11px] font-extrabold text-[#334155] mb-1"
                  >
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    id="login-student-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Contoh: Badar Rahman"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="login-student-nim"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      NIM STIKOM
                    </label>
                    <input
                      id="login-student-nim"
                      type="text"
                      value={nimInput}
                      onChange={(e) => {
                        setNimInput(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="14524303"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-student-class"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      Kelas
                    </label>
                    <select
                      id="login-student-class"
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value)}
                      className="w-full min-h-[44px] px-2.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] text-xs font-bold outline-none"
                    >
                      <option value="TI-1">TI-1</option>
                      <option value="TI-2">TI-2</option>
                      <option value="SI-1">SI-1</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] mt-1 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-extrabold flex items-center justify-center gap-2 border-2 border-[#0F172A] shadow-xs transition-transform active:scale-[0.99]"
                >
                  <span>Mulai Belajar Sekarang</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Demo Fill Footer */}
          <div className="pb-1 text-center">
            <button
              type="button"
              onClick={() => {
                setNameInput(STUDENT_METADATA.name);
                setNimInput(STUDENT_METADATA.nim);
                setClassInput('TI-1');
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] hover:text-[#C41E3A] min-h-[36px] px-3"
            >
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Isi Cepat: Badar Rahman (NIM 14524303 · TI-1)</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
