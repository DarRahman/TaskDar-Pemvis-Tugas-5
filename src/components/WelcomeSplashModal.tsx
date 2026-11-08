import React from 'react';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { STUDENT_METADATA } from '../data/initialTasks';
import { WelcomeSplashMascot } from './StudentMascot';

export interface WelcomeSplashModalProps {
  isOpen: boolean;
  onStartLearning: () => void;
  pendingCount: number;
  totalCourses: number;
}

/*
 * Screen 0: Welcome Splash Screen modal rendered on initial launch and
 * accessible on demand from Tab 4 (Profil) via "Buka Layar Sambutan".
 */
export const WelcomeSplashModal: React.FC<WelcomeSplashModalProps> = ({
  isOpen,
  onStartLearning,
  pendingCount,
  totalCourses,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-splash-heading"
    >
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[780px] sm:max-h-[860px] sm:rounded-[40px] bg-gradient-to-b from-[#C41E3A] via-[#B91C1C] to-[#881337] text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
        {/* Top Academic Crest Header */}
        <div className="pt-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shadow-sm mb-3">
            <Shield className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FECACA]">
            {STUDENT_METADATA.institution}
          </span>
          <span className="text-[11px] font-semibold text-white/85 mt-0.5">
            {STUDENT_METADATA.program} · {STUDENT_METADATA.classGroup}
          </span>
        </div>

        {/* Center Waving Mascot Card & Greeting */}
        <div className="my-auto py-4 text-center">
          <div className="bg-white rounded-[32px] p-6 text-[#0F172A] shadow-xl mx-1">
            <WelcomeSplashMascot />

            <h1
              id="welcome-splash-heading"
              className="mt-3 text-xl font-extrabold tracking-tight leading-snug text-[#0F172A]"
            >
              Halo, {STUDENT_METADATA.name}! Siap menuntaskan tugas Semester 5?
            </h1>

            <p className="mt-2 text-xs text-[#475569] leading-relaxed">
              Kelola jadwal kuliah, pantau progres praktikum, dan selesaikan setiap tugas tepat waktu.
            </p>

            {/* Quick Academic Readiness Summary Row */}
            <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 rounded-2xl bg-[#FEE2E2] flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#C41E3A] shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-xs font-extrabold text-[#991B1B] font-mono tabular-nums">
                    {pendingCount} Tugas Aktif
                  </span>
                  <span className="block text-[10px] font-semibold text-[#C41E3A]">
                    Siap Dikerjakan
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#EEF2FF] flex items-center gap-2">
                <Shield
                  className="w-4 h-4 text-[#4F46E5] shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <span className="block text-xs font-extrabold text-[#3730A3] font-mono tabular-nums">
                    {totalCourses} Mata Kuliah
                  </span>
                  <span className="block text-[10px] font-semibold text-[#4F46E5]">
                    Semester 5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Primary CTA Button */}
        <div className="pb-2">
          <button
            type="button"
            onClick={onStartLearning}
            className="w-full min-h-[54px] rounded-2xl bg-white hover:bg-[#FFF1F2] text-[#C41E3A] text-base font-extrabold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99]"
          >
            <span>Mulai Belajar</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
