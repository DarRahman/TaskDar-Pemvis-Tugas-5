import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  UserCheck,
  Sparkles,
  Building2,
  User,
  Hash,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { STUDENT_METADATA } from '../data/initialTasks';
import { AppScreenPhase, StudentUserSession } from '../types/task';
import { toWebpAssetPath } from '../utils/imageOptimizer';

export interface WelcomeSplashModalProps {
  screenPhase: AppScreenPhase;
  onFinishSplash: () => void;
  onLoginSuccess: (session: StudentUserSession) => void;
  onGoogleLogin: () => Promise<{
    uid: string;
    name: string;
    email: string;
    avatarUrl: string;
  }>;
  isGoogleLoading?: boolean;
}

/*
 * Full-screen Bottom-to-Top Liquid Wave Splash Screen:
 * Crimson Red (#C41E3A) liquid wave rises smoothly from a clean #FFFFFF white base
 * until it fills 100% of the screen, with expressive character eyes and a
 * Playfair Display Black Italic wordmark + unboxed subtitle.
 */
export const WelcomeSplashModal: React.FC<WelcomeSplashModalProps> = ({
  screenPhase,
  onFinishSplash,
  onLoginSuccess,
  onGoogleLogin,
  isGoogleLoading = false,
}) => {
  const [authStep, setAuthStep] = useState<'form' | 'google-complete'>('form');
  const [waveSubmerged, setWaveSubmerged] = useState<boolean>(false);

  const [googleDraft, setGoogleDraft] = useState<{
    uid: string;
    name: string;
    email: string;
    avatarUrl: string;
  } | null>(null);

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
    setWaveSubmerged(false);
    const submergeTimer = window.setTimeout(() => {
      setWaveSubmerged(true);
    }, 950);
    const finishTimer = window.setTimeout(() => {
      onFinishSplash();
    }, 2600);
    return () => {
      window.clearTimeout(submergeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [screenPhase, onFinishSplash]);

  if (screenPhase === 'main') {
    return null;
  }

  const handleTriggerGoogleStep = async () => {
    setAuthError(null);
    const googleProfile = await onGoogleLogin();
    setGoogleDraft(googleProfile);
    setNameInput(googleProfile.name || STUDENT_METADATA.name);
    setAuthStep('google-complete');
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedNim = nimInput.trim();
    const trimmedCampus = institutionInput.trim() || 'Kampus Akademik';
    if (!trimmedName) {
      setAuthError('Nama lengkap mahasiswa wajib diisi.');
      return;
    }
    if (!trimmedNim) {
      setAuthError('NIM atau NPM mahasiswa wajib diisi.');
      return;
    }
    const firstWord = trimmedName.split(' ')[0] || trimmedName;
    onLoginSuccess({
      uid: googleDraft ? googleDraft.uid : `student-${trimmedNim}`,
      name: trimmedName,
      shortName: firstWord,
      nim: trimmedNim,
      classGroup: classInput.trim() || 'TI-1',
      semester: semesterInput.trim() || 'Semester 5',
      program: programInput.trim() || 'Teknik Informatika',
      institution: trimmedCampus,
      email: googleDraft ? googleDraft.email : STUDENT_METADATA.email,
      avatarUrl: googleDraft
        ? toWebpAssetPath(googleDraft.avatarUrl)
        : '/assets/mascot-splash.webp',
      authMethod: googleDraft ? 'google' : 'nim',
    });
  };

  return (
    <AnimatePresence mode="wait">
      {screenPhase === 'splash' && (
        <motion.div
          key="taskdar-aptivo-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onFinishSplash}
          role="dialog"
          aria-label="Layar Pemuatan TaskDar"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden cursor-pointer select-none px-6"
        >
          {/* Rising Liquid Wave Fill from Bottom (0%) to Full Top (100%) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 2.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-x-0 -bottom-24 h-[135%] bg-[#C41E3A] pointer-events-none z-10"
          >
            {/* Secondary Back Liquid Wave Crest */}
            <div className="absolute -top-16 sm:-top-22 left-0 w-[200%] h-18 sm:h-24 overflow-hidden">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-full h-full fill-[#FB7185]/65"
              >
                <path d="M0,64 C150,120 300,8 450,64 C600,120 750,8 900,64 C1050,120 1125,36 1200,64 L1200,120 L0,120 Z" />
              </motion.svg>
            </div>

            {/* Primary Front Liquid Wave Crest */}
            <div className="absolute -top-14 sm:-top-20 left-0 w-[200%] h-16 sm:h-22 overflow-hidden">
              <motion.svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                animate={{ x: ['-50%', '0%'] }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-full h-full fill-[#C41E3A]"
              >
                <path d="M0,56 C200,4 400,112 600,56 C800,4 1000,112 1200,56 L1200,120 L0,120 Z" />
              </motion.svg>
            </div>
          </motion.div>

          {/* Expressive Aptivo-Style Character Eyes + Smile Centered Above Rising Wave */}
          <motion.div
            initial={{ y: 36, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 130,
              damping: 16,
            }}
            className="relative z-20 flex flex-col items-center justify-center text-center"
          >
            <svg
              viewBox="0 0 260 155"
              className="w-56 sm:w-64 h-auto overflow-visible"
              aria-hidden="true"
            >
              {/* Left Eye Eyelashes */}
              <path
                d="M52 28 L44 12 M68 22 L65 5 M85 20 L86 3 M102 24 L108 8 M115 32 L125 19"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Right Eye Eyelashes */}
              <path
                d="M145 32 L135 19 M158 24 L152 8 M175 20 L174 3 M192 22 L195 5 M208 28 L216 12"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Left White Sclera */}
              <ellipse
                cx="84"
                cy="70"
                rx="46"
                ry="48"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="4.5"
              />
              {/* Right White Sclera */}
              <ellipse
                cx="176"
                cy="70"
                rx="46"
                ry="48"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="4.5"
              />

              {/* Left Pupil */}
              <motion.g
                initial={{ x: -5, y: 4 }}
                animate={{ x: [0, 4, 0], y: [0, -2, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <circle cx="92" cy="72" r="27" fill="#0F172A" />
                <circle cx="81" cy="60" r="7.5" fill="#FFFFFF" />
                <circle cx="102" cy="82" r="3.5" fill="#FFFFFF" />
              </motion.g>

              {/* Right Pupil */}
              <motion.g
                initial={{ x: -5, y: 4 }}
                animate={{ x: [0, 4, 0], y: [0, -2, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <circle cx="168" cy="72" r="27" fill="#0F172A" />
                <circle cx="157" cy="60" r="7.5" fill="#FFFFFF" />
                <circle cx="178" cy="82" r="3.5" fill="#FFFFFF" />
              </motion.g>

              {/* Cheerful Curved Smile (adapts from Crimson to White as wave rises) */}
              <path
                d="M110 132 Q130 148 150 132"
                fill="none"
                stroke={waveSubmerged ? '#FFFFFF' : '#C41E3A'}
                strokeWidth="4.5"
                strokeLinecap="round"
                className="transition-colors duration-300"
              />
            </svg>

            {/* Luxury Serif Italic TaskDar Wordmark */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.12,
                type: 'spring',
                stiffness: 140,
                damping: 16,
              }}
              className={`mt-4 text-6xl sm:text-7xl font-black font-luxury-italic tracking-tight transition-colors duration-300 ${
                waveSubmerged
                  ? 'text-white drop-shadow-[0_3px_0_rgba(15,23,42,0.35)]'
                  : 'text-[#C41E3A]'
              }`}
            >
              TaskDar
            </motion.h1>

            {/* Clean Unboxed Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24, duration: 0.35 }}
              className={`mt-2.5 text-sm sm:text-base font-bold tracking-wide transition-colors duration-300 ${
                waveSubmerged ? 'text-white/95' : 'text-[#0F172A]'
              }`}
            >
              Manajer Tugas & Jadwal Kuliah Mahasiswa
            </motion.p>
          </motion.div>

          {/* Subtle Bottom Tap Prompt Over the Liquid Fill */}
          <div className="absolute bottom-9 z-20 flex flex-col items-center">
            <span className="text-xs font-extrabold text-white/95 tracking-wide">
              Ketuk layar untuk mulai
            </span>
          </div>
        </motion.div>
      )}

      {screenPhase === 'auth' && (
        <motion.div
          key="taskdar-auth-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label="Masuk ke TaskDar"
          className="fixed inset-0 z-50 flex flex-col bg-[#C41E3A] text-[#0F172A] overflow-y-auto no-scrollbar"
        >
          {/* Top Dominant #C41E3A Red Brand Header with New Crimson Mascot */}
          <div className="w-full max-w-[540px] mx-auto px-5 pt-6 pb-5 text-white flex flex-col items-center text-center">
            <div className="flex items-center gap-3.5">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] bg-white shrink-0">
                <img
                  src={
                    googleDraft
                      ? toWebpAssetPath(googleDraft.avatarUrl)
                      : '/assets/mascot-splash.webp'
                  }
                  alt="Maskot TaskDar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {authStep === 'google-complete'
                    ? 'Lengkapi Data Kampus'
                    : 'Selamat Datang!'}
                </h1>
                <p className="text-xs font-bold text-white/90">
                  {authStep === 'google-complete'
                    ? 'Langkah 2/2: Isi NIM dan nama perguruan tinggimu'
                    : 'Kelola tugas kuliah, jadwal, dan progres akademikmu'}
                </p>
              </div>
            </div>
          </div>

          {/* Crisp #FFFFFF White Sub-Surface Card Sheet (Unified Single Form) */}
          <div className="flex-1 w-full max-w-[540px] mx-auto bg-white rounded-t-[36px] border-t-3 border-x-2 border-[#0F172A] px-5 pt-6 pb-8 shadow-2xl flex flex-col justify-between">
            {authStep === 'form' ? (
              <div className="space-y-4">
                {/* Google Sign-In Button (Triggers 2-Step Campus Completion) */}
                <button
                  type="button"
                  onClick={handleTriggerGoogleStep}
                  disabled={isGoogleLoading}
                  className="w-full min-h-[48px] px-4 rounded-2xl taskdar-btn-secondary text-xs font-extrabold flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  <div className="h-0.5 flex-1 bg-[#E2E8F0]" />
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Atau Isi Identitas Mahasiswa
                  </span>
                  <div className="h-0.5 flex-1 bg-[#E2E8F0]" />
                </div>

                {authError && (
                  <div className="p-3 rounded-2xl bg-[#C41E3A] text-white border-2 border-[#0F172A] text-xs font-extrabold">
                    {authError}
                  </div>
                )}

                <form
                  onSubmit={handleIdentitySubmit}
                  className="space-y-3"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="login-student-name"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        <User className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>Nama Lengkap</span>
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
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="login-student-nim"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        <Hash className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>NIM / NPM</span>
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
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-student-campus"
                      className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] mb-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#C41E3A]" />
                      <span>Nama Kampus / Perguruan Tinggi</span>
                    </label>
                    <input
                      id="login-student-campus"
                      type="text"
                      value={institutionInput}
                      onChange={(e) => setInstitutionInput(e.target.value)}
                      placeholder="Contoh: STIKOM Poltek Cirebon"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label
                        htmlFor="login-student-program"
                        className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#C41E3A]" />
                        <span>Program Studi</span>
                      </label>
                      <input
                        id="login-student-program"
                        type="text"
                        value={programInput}
                        onChange={(e) => setProgramInput(e.target.value)}
                        placeholder="Teknik Informatika"
                        className="w-full min-h-[44px] px-3 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="login-student-class"
                        className="block text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        Kelas
                      </label>
                      <input
                        id="login-student-class"
                        type="text"
                        value={classInput}
                        onChange={(e) => setClassInput(e.target.value)}
                        placeholder="TI-1"
                        className="w-full min-h-[44px] px-3 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[50px] mt-2 rounded-2xl taskdar-btn-primary text-sm font-extrabold flex items-center justify-center gap-2"
                  >
                    <span>Mulai Gunakan TaskDar</span>
                    <ArrowRight
                      className="w-4 h-4 stroke-[2.5]"
                      aria-hidden="true"
                    />
                  </button>
                </form>
              </div>
            ) : (
              /* STEP 2/2: Complete Campus, NIM, and Class after Google Sign-In */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-[#0F172A] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#C41E3A] text-white border-2 border-[#0F172A] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black block truncate">
                        Akun Google Terverifikasi
                      </span>
                      <span className="text-[11px] font-bold text-[#475569] block truncate">
                        {googleDraft?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthStep('form')}
                    className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] text-[11px] font-extrabold flex items-center gap-1 shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-2xl bg-[#C41E3A] text-white border-2 border-[#0F172A] text-xs font-extrabold">
                    {authError}
                  </div>
                )}

                <form
                  onSubmit={handleIdentitySubmit}
                  className="space-y-3"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="google-step-name"
                      className="block text-xs font-extrabold text-[#0F172A] mb-1"
                    >
                      Nama Lengkap Mahasiswa (Dari Google)
                    </label>
                    <input
                      id="google-step-name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="google-step-campus"
                      className="block text-xs font-extrabold text-[#0F172A] mb-1"
                    >
                      Nama Kampus / Perguruan Tinggi
                    </label>
                    <input
                      id="google-step-campus"
                      type="text"
                      value={institutionInput}
                      onChange={(e) => setInstitutionInput(e.target.value)}
                      placeholder="Contoh: Universitas / Politeknik Anda"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="google-step-nim"
                        className="block text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        NIM / NPM
                      </label>
                      <input
                        id="google-step-nim"
                        type="text"
                        value={nimInput}
                        onChange={(e) => setNimInput(e.target.value)}
                        placeholder="14524303"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="google-step-semester"
                        className="block text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        Semester
                      </label>
                      <input
                        id="google-step-semester"
                        type="text"
                        value={semesterInput}
                        onChange={(e) => setSemesterInput(e.target.value)}
                        placeholder="Semester 5"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label
                        htmlFor="google-step-program"
                        className="block text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        Program Studi
                      </label>
                      <input
                        id="google-step-program"
                        type="text"
                        value={programInput}
                        onChange={(e) => setProgramInput(e.target.value)}
                        placeholder="Teknik Informatika"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="google-step-class"
                        className="block text-xs font-extrabold text-[#0F172A] mb-1"
                      >
                        Kelas
                      </label>
                      <input
                        id="google-step-class"
                        type="text"
                        value={classInput}
                        onChange={(e) => setClassInput(e.target.value)}
                        placeholder="TI-1"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 border-[#0F172A] bg-[#F8FAFC] focus:bg-white text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[50px] mt-2 rounded-2xl taskdar-btn-primary text-sm font-extrabold flex items-center justify-center gap-2"
                  >
                    <span>Simpan & Masuk ke Beranda</span>
                    <ArrowRight
                      className="w-4 h-4 stroke-[2.5]"
                      aria-hidden="true"
                    />
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
