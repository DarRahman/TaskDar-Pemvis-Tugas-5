import React from 'react';

export interface MascotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  avatarUrl?: string;
}

/*
 * Expressive 2D character avatar in Aptivo and Charmi style,
 * properly framed so the graduation cap and character are never clipped.
 */
export const StudentMascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 'md',
  avatarUrl = '/assets/mascot-splash.jpg',
}) => {
  const dimensionClass =
    size === 'lg'
      ? 'w-22 h-22 rounded-[28px]'
      : size === 'md'
      ? 'w-13 h-13 rounded-2xl'
      : 'w-11 h-11 rounded-2xl';

  return (
    <div
      className={`${dimensionClass} bg-white border-2 border-[#0F172A] flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}
      aria-hidden="true"
    >
      <img
        src={avatarUrl}
        alt="Karakter Mahasiswa"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

/*
 * Large waving student mascot illustration for splash and onboarding screens.
 */
export const WelcomeSplashMascot: React.FC = () => {
  return (
    <div
      className="w-44 h-44 mx-auto rounded-[36px] border-3 border-[#0F172A] overflow-hidden bg-white flex items-center justify-center shadow-md"
      aria-hidden="true"
    >
      <img
        src="/assets/mascot-splash.jpg"
        alt="Maskot Sambutan TaskDar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

/*
 * Celebratory trophy and mascot illustration displayed when all tasks are completed
 * or when a search/filter state is empty.
 */
export const CelebrationMascotIllustration: React.FC = () => {
  return (
    <div
      className="w-28 h-28 mx-auto rounded-[28px] border-2 border-[#0F172A] overflow-hidden bg-[#EDE9FE] flex items-center justify-center shadow-sm"
      aria-hidden="true"
    >
      <img
        src="/assets/olympiad-trophy.jpg"
        alt="Trofi Pencapaian Tugas"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
