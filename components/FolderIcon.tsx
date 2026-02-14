'use client';

import React from 'react';
import Image from 'next/image';

interface AppItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface FolderIconProps {
  apps: AppItem[];
  title: string;
  onClick?: () => void;
}

/**
 * iOS 18 Style Folder Icon Component
 * Renders a folder with a 3x3 grid of app icons using Tailwind CSS
 * Features: Glass morphism effect, hover animations, haptical feedback
 */
export const FolderIcon: React.FC<FolderIconProps> = ({
  apps,
  title,
  onClick
}) => {
  // Display only the first 9 apps
  const displayApps = apps.slice(0, 9);

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer">
      {/* Folder Container */}
      <button
        onClick={onClick}
        className="group relative w-32 h-32
                   rounded-[32px]
                   bg-gradient-to-br from-blue-400/25 via-cyan-300/15 to-purple-400/20
                   backdrop-blur-2xl border border-white/30
                   shadow-2xl drop-shadow-2xl
                   hover:from-blue-400/35 hover:via-cyan-300/25 hover:to-purple-400/30
                   hover:border-white/40
                   hover:shadow-2xl hover:drop-shadow-2xl
                   active:scale-95
                   transition-all duration-200 ease-out
                   overflow-hidden p-2.5
                   focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      >
        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-1 w-full h-full">
          {displayApps.map((app, index) => (
            <AppIconSlot key={app.id || index} app={app} index={index} />
          ))}

          {/* Empty Placeholder Slots */}
          {displayApps.length < 9 &&
            Array.from({ length: 9 - displayApps.length }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10
                             group-hover:bg-white/10 transition-colors duration-200"
                  style={{ aspectRatio: '1 / 1' }}
                />
              )
            )}
        </div>

        {/* "More Apps" Indicator Badge (if more than 9 apps) */}
        {apps.length > 9 && (
          <div className="absolute bottom-1 right-1 bg-red-500 text-white text-xs font-bold
                          rounded-full w-5 h-5 flex items-center justify-center">
            +{apps.length - 9}
          </div>
        )}
      </button>

      {/* Folder Title */}
      <p className="text-sm font-medium text-gray-700 text-center max-w-32 truncate
                    group-hover:text-gray-900 transition-colors duration-200">
        {title}
      </p>
    </div>
  );
};

/**
 * Individual App Icon Slot Component
 */
interface AppIconSlotProps {
  app: AppItem;
  index: number;
}

const AppIconSlot: React.FC<AppIconSlotProps> = ({ app, index }) => {
  const hasIcon = !!app.icon;
  
  // Use app-specific colors matching desktop icons
  let bgColor = app.color || getColorForApp(index);
  if (app.id === 'firmenvorstellung') {
    bgColor = 'rgba(255, 255, 255, 0.9)'; // white/90 like desktop
  } else if (app.id === 'easy') {
    bgColor = '#003A66'; // OVB blue like desktop
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg
                  transform transition-transform duration-150 hover:scale-105
                  flex items-center justify-center"
      style={{
        backgroundColor: bgColor,
        padding: '2px',
        aspectRatio: '1 / 1',
        width: '100%',
      }}
    >
      {/* Icon Container with proper styling */}
      {hasIcon ? (
        <div className="relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden"
             style={{ backgroundColor: bgColor }}>
          <Image 
            src={app.icon!} 
            alt={app.name}
            width={24}
            height={24}
            className="object-contain"
          />
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Icon Label Fallback (First Letter) */
        <div className="w-full h-full flex items-center justify-center
                        bg-gradient-to-br rounded-lg"
             style={{
               backgroundImage: `linear-gradient(135deg, ${bgColor}, ${lightenColor(bgColor, 20)})`
             }}>
          <span className="text-white text-xs font-bold drop-shadow-sm">
            {app.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Color palette for app icons (iOS style)
 */
function getColorForApp(index: number): string {
  const colors = [
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#34C759', // Green
    '#00C7FF', // Cyan
    '#30B0C4', // Teal
    '#007AFF', // Blue
    '#5856D6', // Purple
    '#AF52DE', // Pink
  ];
  return colors[index % colors.length];
}

/**
 * Simple color lightening helper
 */
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
