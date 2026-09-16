interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <img
      src="/cubitx-logo.png"
      alt="CubitX"
      style={{
        height: `${size}px`,
        width: showText ? 'auto' : `${size}px`,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}