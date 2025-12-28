'use client';

import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <div className="relative w-full h-full">
        
        {/* Hintergrundbild */}
        <Image
          src="/ovb-header.png"
          alt="Header"
          fill
          priority
          className="object-cover"
        />
 {/* weißes Overlay oben */}
        <div className="absolute top-0 left-0 w-full bg-white bg-opacity-80 py-8">
         </div>
		 {/* OVB Overlay */}
        <div className="absolute bottom-0 left-0">
  <Image
    src="/ovb-overlay.png"
    alt="Overlay"
    width={1200}   // echte Bildbreite
    height={400}   // echte Bildhöhe
    className="w-[50vw] h-auto"
  />
</div>
{/* Kreis-Container – responsive */}
<div className="absolute bottom-2 left-140 -translate-x-1/2 flex gap-8 md:gap-12">

  {/* Kapitalmarkt */}
  <a
    href="/kapitalmarkt"
    className="bg-white rounded-full shadow-xl flex flex-col items-center justify-center text-center text-[#002b5c] font-semibold hover:bg-blue-50 transition
               w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40"
  >
    <Image
      src="/kapitalmarkt-icon.png"
      alt="Kapitalmarkt Icon"
      width={100}
      height={100}
      className="mt-[-20px] md:mt-[-25px] lg:mt-[-35px] w-12 md:w-16 lg:w-24 h-auto"
    />
    <span className="text-[0.75rem] md:text-[0.85rem] lg:text-[0.95rem] leading-tight">
      Der Kapitalmarkt
    </span>
  </a>

  {/* Lebensplan */}
  <a
    href="/lebensplan"
    className="bg-white rounded-full shadow-xl flex flex-col items-center justify-center text-center text-[#002b5c] font-semibold hover:bg-blue-50 transition
               w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40"
  >
    <Image
      src="/lebensplan-icon.png"
      alt="Lebensplan Icon"
      width={80}
      height={80}
      className="mt-[-10px] md:mt-[-10px] lg:mt-[-10px] w-10 md:w-14 lg:w-20 h-auto"
    />
    <span className="text-[0.75rem] md:text-[0.85rem] lg:text-[0.95rem] leading-tight">
      Finanzieller Lebensplan
    </span>
  </a>

  {/* ABS */}
  <a
    href="/abs"
    className="bg-white rounded-full shadow-xl flex flex-col items-center justify-center text-center text-[#002b5c] font-semibold hover:bg-blue-50 transition
               w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40"
  >
    <Image
      src="/abs-icon.png"
      alt="ABS Icon"
      width={90}
      height={90}
      className="mt-[-10px] md:mt-[-15px] lg:mt-[-15px] w-12 md:w-16 lg:w-24 h-auto"
    />
    <span className="text-[0.75rem] md:text-[0.85rem] lg:text-[0.95rem] leading-tight">
      ABS-System
    </span>
  </a>

  {/* Werbung */}
  <a
    href="/werbung"
    className="bg-white rounded-full shadow-xl flex flex-col items-center justify-center text-center text-[#002b5c] font-semibold hover:bg-blue-50 transition
               w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40"
  >
    <Image
      src="/werbung-icon.png"
      alt="Werbung Icon"
      width={90}
      height={90}
      className="mt-[-15px] md:mt-[-20px] lg:mt-[-20px] w-12 md:w-16 lg:w-24 h-auto"
    />
    <span className="text-[0.75rem] md:text-[0.85rem] lg:text-[0.95rem] leading-tight">
      Werbung
    </span>
  </a>

</div>


      </div>
    </main>
  );
}
