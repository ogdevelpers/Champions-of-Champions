interface ActorSmileImageProps {
  src: string;
  alt: string;
  position: string;
}

export function ActorSmileImage({ src, alt, position }: ActorSmileImageProps) {
  return (
    <div className="group relative aspect-square overflow-hidden bg-brand-header">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full scale-[1.65] object-cover transition-transform duration-500 group-hover:scale-[1.75]"
        style={{ objectPosition: position }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-brand-header via-brand-header/85 to-transparent" />
    </div>
  );
}
