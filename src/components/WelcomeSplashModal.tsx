import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, UserCheck, Sparkles } from 'lucide-react';
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
 * Full-screen coral-red Aptivo-style splash screen featuring animated cartoon
 * character eyes and rising TaskDar wordmark, followed by universal student
 * login & registration (Google Sign-In + customizable campus/NIM identity).
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
  const [institutionInput, setInstitutionInput] = useState<string>(
    STUDENT_METADATA.institution
  );
  const [programInput, setProgramInput] = useState<string>(
    STUDENT_METADATA.program
  );
  const [semesterInput, setSemesterInput] = useState<string>(
    STUDENT_METADATA.semester
  );
  const [classInput, setClassInput] = useState<string>(
    STUDENT_METADATA.classGroup
  );
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (screenPhase !== 'splash') return;
    const timer = window.setTimeout(() => {
      onFinishSplash();
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [screenPhase, onFinishSplash]);

  if (screenPhase === 'main') {
    return null;
  }

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedNim = nimInput.trim();
    const trimmedCampus = institutionInput.trim() || 'Kampus Akademik';
    if (!trimmedName) {
      setAuthError('Nama lengkap wajib diisi.');
      return;
    }
    if (!trimmedNim) {
      setAuthError('NIM atau nomor identitas mahasiswa wajib diisi.');
      return;
    }
    const firstWord = trimmedName.split(' ')[0] || trimmedName;
    onLoginSuccess({
      uid: `student-${trimmedNim}`,
      name: trimmedName,
      shortName: firstWord,
      nim: trimmedNim,
      classGroup: classInput.trim() || 'TI-1',
      semester: semesterInput.trim() || 'Semester 5',
      program: programInput.trim() || 'Teknik Informatika',
      institution: trimmedCampus,
      email: STUDENT_METADATA.email,
      avatarUrl: '/assets/mascot-splash.jpg',
      authMethod: 'nim',
    });
  };

  return (
    <AnimatePresence mode="wait">
      {screenPhase === 'splash' && (
        <motion.div
          key="taskdar-aptivo-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35 }}
          onClick={onFinishSplash}
          role="dialog"
          aria-label="Layar Pemuatan TaskDar"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#E85D56] text-white overflow-hidden cursor-pointer select-none px-6"
        >
          {/* Expressive Aptivo-Style Character Eyes + Smile Rising to Center */}
          <motion.div
            initial={{ y: 220, scale: 0.78, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 115,
              damping: 14,
            }}
            className="flex flex-col items-center justify-center"
          >
            {/* Cartoon Eyes SVG modeled after Aptivo Red Splash */}
            <svg
              viewBox="0 0 260 155"
              className="w-56 sm:w-64 h-auto overflow-visible drop-shadow-xs"
              aria-hidden="true"
            >
              {/* Left Eye Eyelashes */}
              <path
                d="M52 28 L44 12 M68 22 L65 5 M85 20 L86 3 M102 24 L108 8 M115 32 L125 19"
                stroke="#18181B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Right Eye Eyelashes */}
              <path
                d="M145 32 L135 19 M158 24 L152 8 M175 20 L174 3 M192 22 L195 5 M208 28 L216 12"
                stroke="#18181B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Left White Sclera */}
              <ellipse
                cx="84"
                cy="70"
                rx="46"
                ry="48"
                fill="#FFFFFF"
                stroke="#18181B"
                strokeWidth="4"
              />
              {/* Right White Sclera */}
              <ellipse
                cx="176"
                cy="70"
                rx="46"
                ry="48"
                fill="#FFFFFF"
                stroke="#18181B"
                strokeWidth="4"
              />

              {/* Left Pupil */}
              <motion.g
                initial={{ x: -6, y: 6 }}
                animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <circle cx="92" cy="72" r="27" fill="#09090B" />
                <circle cx="81" cy="60" r="7.5" fill="#FFFFFF" />
                <circle cx="102" cy="82" r="3.5" fill="#FFFFFF" />
              </motion.g>

              {/* Right Pupil */}
              <motion.g
                initial={{ x: -6, y: 6 }}
                animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <circle cx="168" cy="72" r="27" fill="#09090B" />
                <circle cx="157" cy="60" r="7.5" fill="#FFFFFF" />
                <circle cx="178" cy="82" r="3.5" fill="#FFFFFF" />
              </motion.g>

              {/* Cute Curved Smile Underneath Eyes */}
              <path
                d="M112 132 Q130 148 148 132"
                fill="none"
                stroke="#18181B"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Bold Playful Rounded TaskDar Wordmark */}
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.18,
                type: 'spring',
                stiffness: 130,
                damping: 15,
              }}
              className="mt-6 text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-xs"
            >
              TaskDar
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.92 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-2 text-xs sm:text-sm font-extrabold tracking-wide text-white/90"
            >
              Teman Belajar & Pengatur Tugas Kuliahmu
            </motion.p>
          </motion.div>

          {/* Subtle Bottom Progress Bar */}
          <div className="absolute bottom-10 flex flex-col items-center">
            <div className="w-40 h-2 rounded-full bg-black/20 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.1, ease: 'easeInOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <span className="mt-2 text-[11px] font-bold text-white/85">
              Ketuk layar untuk langsung mulai
            </span>
          </div>
        </motion.div>
      )}

      {screenPhase === 'auth' && (
        <motion.div
          key="taskdar-auth-screen"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-label="Masuk atau Daftar TaskDar"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF7ED] text-[#0F172A] p-4 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-[440px] my-auto space-y-4">
            {/* Top Mascot Greeting (Aptivo Onboarding Style) */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[30px] overflow-hidden border-3 border-[#0F172A] shadow-md bg-white"
              >
                <img
                  src="/assets/mascot-splash.jpg"
                  alt="Maskot TaskDar"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FEE2E2] text-[#C41E3A] text-[11px] font-extrabold">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>Selamat Datang di TaskDar</span>
              </span>

              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-[#0F172A]">
                Siapa nama & kampusmu?
              </h1>
              <p className="mt-0.5 text-xs font-medium text-[#475569] max-w-[320px]">
                Hubungkan Akun Google atau isi identitas akademikmu untuk mulai mencatat tugas dan mata kuliah.
              </p>
            </div>

            {/* Auth Form Card */}
            <div className="bg-white rounded-[28px] border-2 border-[#0F172A] p-4 sm:p-5 shadow-md space-y-3.5">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-2 border-[#0F172A] text-xs font-extrabold flex items-center justify-center gap-2.5 shadow-2xs transition-transform active:scale-[0.99] disabled:opacity-60"
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
                    : 'Masuk Cepat dengan Akun Google'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Atau Isi Profil Mahasiswa
                </span>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#C41E3A]">
                  {authError}
                </div>
              )}

              <form onSubmit={handleIdentitySubmit} className="space-y-2.5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="login-student-name"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      Nama Lengkap
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
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-student-nim"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      NIM / NPM
                    </label>
                    <input
                      id="login-student-nim"
                      type="text"
                      value={nimInput}
                      onChange={(e) => {
                        setNimInput(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Contoh: 14524303"
                      className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-student-campus"
                    className="block text-[11px] font-extrabold text-[#334155] mb-1"
                  >
                    Nama Kampus / Perguruan Tinggi
                  </label>
                  <input
                    id="login-student-campus"
                    type="text"
                    value={institutionInput}
                    onChange={(e) => setInstitutionInput(e.target.value)}
                    placeholder="Contoh: Universitas / Politeknik / Kampus Anda"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="login-student-program"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      Program Studi
                    </label>
                    <input
                      id="login-student-program"
                      type="text"
                      value={programInput}
                      onChange={(e) => setProgramInput(e.target.value)}
                      placeholder="Teknik Informatika"
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-student-class"
                      className="block text-[11px] font-extrabold text-[#334155] mb-1"
                    >
                      Kelas
                    </label>
                    <input
                      id="login-student-class"
                      type="text"
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value)}
                      placeholder="TI-1"
                      className="w-full min-h-[42px] px-3 py-2 rounded-xl border-2 border-[#E2E8F0] focus:border-[#C41E3A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] mt-1 rounded-2xl bg-[#E85D56] hover:bg-[#C41E3A] text-white text-sm font-extrabold flex items-center justify-center gap-2 border-2 border-[#0F172A] shadow-xs transition-transform active:scale-[0.99]"
                >
                  <span>Mulai Gunakan TaskDar</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </button>
              </form>
            </div>

            {/* Quick Fill Footer */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setNameInput(STUDENT_METADATA.name);
                  setNimInput(STUDENT_METADATA.nim);
                  setInstitutionInput(STUDENT_METADATA.institution);
                  setProgramInput(STUDENT_METADATA.program);
                  setSemesterInput(STUDENT_METADATA.semester);
                  setClassInput(STUDENT_METADATA.classGroup);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] hover:text-[#C41E3A] min-h-[36px] px-3"
              >
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Isi Cepat Profil Default ({STUDENT_METADATA.name})</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
