import React from 'react';

export interface MascotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

/*
 * Vector student mascot character wearing STIKOM Poltek Cirebon Crimson Red
 * and White academic attire with a graduation mortarboard cap.
 */
export const StudentMascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 'md',
}) => {
  const dimensionClass =
    size === 'lg'
      ? 'w-20 h-20'
      : size === 'md'
      ? 'w-15 h-15'
      : 'w-12 h-12';

  return (
    <div
      className={`${dimensionClass} rounded-2xl bg-white border-2 border-[#FECACA] flex items-center justify-center shrink-0 overflow-hidden shadow-sm`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect width="64" height="64" fill="#FFF1F2" />

        {/* STIKOM Crimson Red Academic Jacket */}
        <path
          d="M12 58C12 47.5066 20.9543 39 32 39C43.0457 39 52 47.5066 52 58V64H12V58Z"
          fill="#C41E3A"
        />
        <path d="M26 39L32 48L38 39H26Z" fill="#FFFFFF" />

        {/* Mascot Head */}
        <rect
          x="16"
          y="19"
          width="32"
          height="25"
          rx="12.5"
          fill="#C41E3A"
        />
        <rect
          x="19.5"
          y="23"
          width="25"
          height="18"
          rx="9"
          fill="#FFFFFF"
        />

        {/* Expressive Eyes */}
        <circle cx="27" cy="31.5" r="3.2" fill="#0F172A" />
        <circle cx="37" cy="31.5" r="3.2" fill="#0F172A" />
        <circle cx="28" cy="30.5" r="1.1" fill="#FFFFFF" />
        <circle cx="38" cy="30.5" r="1.1" fill="#FFFFFF" />

        {/* Rosy Cheeks */}
        <circle cx="23.5" cy="34.5" r="2.2" fill="#FECACA" />
        <circle cx="40.5" cy="34.5" r="2.2" fill="#FECACA" />

        {/* Cheerful Smile */}
        <path
          d="M29 36.2C30.2 37.8 33.8 37.8 35 36.2"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Mortarboard Cap */}
        <path d="M32 7L51 15L32 23L13 15L32 7Z" fill="#0F172A" />
        <path
          d="M21 18V22.5C21 22.5 26 25 32 25C38 25 43 22.5 43 22.5V18"
          fill="#1E293B"
        />
        <path
          d="M47 16.5V25"
          stroke="#F59E0B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="47" cy="25.5" r="2.2" fill="#F59E0B" />
      </svg>
    </div>
  );
};

/*
 * Large waving student mascot illustration for Screen 0 (Welcome Splash Screen),
 * inspired by the Aptivo and Charmi onboarding characters.
 */
export const WelcomeSplashMascot: React.FC = () => {
  return (
    <div
      className="w-44 h-44 mx-auto flex items-center justify-center relative"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft Glowing Backdrop Circles */}
        <circle cx="90" cy="92" r="76" fill="#FEE2E2" />
        <circle cx="90" cy="92" r="58" fill="#FFF1F2" />

        {/* Decorative Geometric Accents */}
        <circle cx="32" cy="48" r="6" fill="#4F46E5" />
        <circle cx="148" cy="54" r="7" fill="#D97706" />
        <circle cx="34" cy="130" r="5" fill="#059669" />
        <circle cx="148" cy="128" r="6" fill="#0891B2" />

        {/* Left Resting Arm */}
        <path
          d="M45 110C34 115 30 126 35 134"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="35" cy="135" r="6" fill="#0F172A" />

        {/* Right Waving Arm (Raised Cheerfully) */}
        <path
          d="M135 104C150 92 156 76 148 64"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="148" cy="63" r="6.5" fill="#0F172A" />
        {/* Waving Motion Lines */}
        <path
          d="M158 55C162 58 163 64 160 69"
          stroke="#C41E3A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M164 51C169 56 170 65 166 72"
          stroke="#C41E3A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Character Rounded Bento Body in STIKOM Crimson Red */}
        <rect
          x="44"
          y="60"
          width="92"
          height="78"
          rx="34"
          fill="#C41E3A"
          stroke="#0F172A"
          strokeWidth="3.5"
        />

        {/* Crisp White Face Window */}
        <rect
          x="54"
          y="72"
          width="72"
          height="52"
          rx="24"
          fill="#FFFFFF"
        />

        {/* Big Friendly Aptivo Eyes */}
        <circle cx="76" cy="95" r="7.5" fill="#0F172A" />
        <circle cx="104" cy="95" r="7.5" fill="#0F172A" />
        <circle cx="78.5" cy="92.5" r="2.6" fill="#FFFFFF" />
        <circle cx="106.5" cy="92.5" r="2.6" fill="#FFFFFF" />

        {/* Warm Cheek Blushes */}
        <ellipse cx="64" cy="103" rx="5" ry="3.2" fill="#FECACA" />
        <ellipse cx="116" cy="103" rx="5" ry="3.2" fill="#FECACA" />

        {/* Happy Smile */}
        <path
          d="M82 106C85 111 95 111 98 106"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Academic Mortarboard Cap */}
        <path
          d="M90 26L138 45L90 64L42 45L90 26Z"
          fill="#0F172A"
        />
        <path
          d="M64 52V62C64 62 76 68 90 68C104 68 116 62 116 62V52"
          fill="#1E293B"
        />
        {/* Golden Tassel */}
        <path
          d="M126 49V68"
          stroke="#F59E0B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="126" cy="70" r="4.5" fill="#F59E0B" />

        {/* Character Legs */}
        <path
          d="M74 138V154"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M106 138V154"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <ellipse cx="71" cy="156" rx="8" ry="4.5" fill="#0F172A" />
        <ellipse cx="109" cy="156" rx="8" ry="4.5" fill="#0F172A" />
      </svg>
    </div>
  );
};

/*
 * Celebratory mascot illustration displayed when all tasks are completed
 * or when a search/filter state is empty.
 */
export const CelebrationMascotIllustration: React.FC = () => {
  return (
    <div
      className="w-28 h-28 mx-auto flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="60" cy="62" r="46" fill="#FEE2E2" />
        <circle cx="60" cy="62" r="36" fill="#FFF1F2" />

        {/* Geometric Stars */}
        <path
          d="M24 30L26 35L31 37L26 39L24 44L22 39L17 37L22 35L24 30Z"
          fill="#D97706"
        />
        <path
          d="M96 26L97.5 30L101.5 31.5L97.5 33L96 37L94.5 33L90.5 31.5L94.5 30L96 26Z"
          fill="#059669"
        />
        <circle cx="92" cy="78" r="3.5" fill="#C41E3A" />
        <circle cx="26" cy="74" r="3" fill="#4F46E5" />

        {/* Mascot Character */}
        <rect
          x="33"
          y="42"
          width="54"
          height="46"
          rx="23"
          fill="#C41E3A"
        />
        <rect
          x="39"
          y="49"
          width="42"
          height="32"
          rx="16"
          fill="#FFFFFF"
        />

        {/* Happy Eyes */}
        <path
          d="M47 62C48.5 59.2 52.5 59.2 54 62"
          stroke="#0F172A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M66 62C67.5 59.2 71.5 59.2 73 62"
          stroke="#0F172A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        <circle cx="45" cy="66" r="3" fill="#FECACA" />
        <circle cx="75" cy="66" r="3" fill="#FECACA" />

        <path
          d="M55 68C57 71 63 71 65 68"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Academic Cap */}
        <path d="M60 22L88 33L60 44L32 33L60 22Z" fill="#0F172A" />
        <path
          d="M82 35.5V46"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="82" cy="47" r="2.8" fill="#F59E0B" />

        {/* Check Badge */}
        <circle
          cx="82"
          cy="84"
          r="13"
          fill="#059669"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <path
          d="M76.5 84L80.2 87.7L87.8 80.2"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
