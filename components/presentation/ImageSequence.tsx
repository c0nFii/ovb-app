"use client";

type Props = {
  images: string[];
  imageIndex: number;
};

export default function ImageSequence({ images, imageIndex }: Props) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      {images.slice(0, imageIndex + 1).map((img, i) => {
        const isV = img === "v.png";
        const isOVB = img === "ovb.png";

        // 🔥 Präsentations‑Skalierung
        const scale = isV || isOVB ? 1 : 1;

        return (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center ${
              isOVB ? "reveal-left" : ""
            }`}
            style={{ zIndex: i }}
          >
            <img
              src={`/${img}`}
              alt=""
              className="select-none premium-image"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${scale})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
