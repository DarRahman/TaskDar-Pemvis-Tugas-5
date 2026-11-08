import React from 'react';

export interface MascotAvatarProps {
  size?: 'sm' | 'lg';
}

/*
 * Custom vector student mascot avatar inspired by the Kidory and Aptivo
 * character illustrations, featuring a friendly scholar character with
 * an academic mortarboard cap.
 */
export const StudentMascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 'sm',
}) => {
  const dimensionClass = size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';

  return (
    <div
      className={`${dimensionClass} rounded-full bg-[#FFEAE6] border-2 border-[#EC6B56] flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft Warm Backdrop Circle */}
        <circle cx="32" cy="32" r="32" fill="#FFEAE6" />

        {/* Shoulders / Academic Hoodie */}
        <path
          d="M14 58C14 48.6112 22.0589 41 32 41C41.9411 41 50 48.6112 50 58V64H14V58Z"
          fill="#2A9D8F"
        />
        <path
          d="M27 41L32 48L37 41H27Z"
          fill="#FFFFFF"
        />

        {/* Mascot Head / Friendly Rounded Character */}
        <rect
          x="17"
          y="20"
          width="30"
          height="25"
          rx="12.5"
          fill="#EC6B56"
        />

        {/* Inner Face Patch */}
        <rect
          x="20"
          y="24"
          width="24"
          height="18"
          rx="9"
          fill="#FFF8F5"
        />

        {/* Expressive Aptivo-Style Eyes */}
        <circle cx="27.5" cy="32" r="3.2" fill="#1E1B18" />
        <circle cx="36.5" cy="32" r="3.2" fill="#1E1B18" />
        <circle cx="28.5" cy="31" r="1.1" fill="#FFFFFF" />
        <circle cx="37.5" cy="31" r="1.1" fill="#FFFFFF" />

        {/* Friendly Smile */}
        <path
          d="M29 37C30 38.4 34 38.4 35 37"
          stroke="#1E1B18"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Academic Mortarboard Cap */}
        <path
          d="M32 9L50 16.5L32 24L14 16.5L32 9Z"
          fill="#1E1B18"
        />
        <path
          d="M22 19.5V23.5C22 23.5 26.5 26 32 26C37.5 26 42 23.5 42 23.5V19.5"
          fill="#2B2520"
        />
        {/* Cap Tassel */}
        <path
          d="M46 18V26"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="46" cy="26.5" r="2" fill="#F59E0B" />
      </svg>
    </div>
  );
};

/*
 * Celebratory vector mascot illustration displayed when all tasks are
 * completed or when a search/filter state is empty.
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
        {/* Warm Decorative Aura */}
        <circle cx="60" cy="62" r="46" fill="#FFEAE6" />
        <circle cx="60" cy="62" r="36" fill="#FFF5F2" />

        {/* Floating Vector Sparkles (Non-emoji geometric stars) */}
        <path
          d="M24 30L26 35L31 37L26 39L24 44L22 39L17 37L22 35L24 30Z"
          fill="#F59E0B"
        />
        <path
          d="M96 26L97.5 30L101.5 31.5L97.5 33L96 37L94.5 33L90.5 31.5L94.5 30L96 26Z"
          fill="#2A9D8F"
        />
        <circle cx="92" cy="78" r="3.5" fill="#EC6B56" />
        <circle cx="26" cy="74" r="3" fill="#2A9D8F" />

        {/* Relaxing Mascot Body */}
        <rect
          x="33"
          y="42"
          width="54"
          height="46"
          rx="23"
          fill="#EC6B56"
        />
        <rect
          x="39"
          y="49"
          width="42"
          height="32"
          rx="16"
          fill="#FFFFFF"
        />

        {/* Happy Closed Arc Eyes */}
        <path
          d="M47 62C48.5 59.2 52.5 59.2 54 62"
          stroke="#1E1B18"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M66 62C67.5 59.2 71.5 59.2 73 62"
          stroke="#1E1B18"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Rosy Cheeks */}
        <circle cx="45" cy="66" r="3" fill="#FBC7BE" />
        <circle cx="75" cy="66" r="3" fill="#FBC7BE" />

        {/* Content Smile */}
        <path
          d="M55 68C57 71 63 71 65 68"
          stroke="#1E1B18"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Graduation Cap on Top */}
        <path
          d="M60 22L88 33L60 44L32 33L60 22Z"
          fill="#1E1B18"
        />
        <path
          d="M82 35.5V46"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="82" cy="47" r="2.8" fill="#F59E0B" />

        {/* Completed Check Badge at Bottom Right */}
        <circle
          cx="82"
          cy="84"
          r="13"
          fill="#2A9D8F"
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
