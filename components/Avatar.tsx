import Image from 'next/image'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const sizeMap = {
  xs: 'h-6 w-6 text-[9px] leading-none',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-2xl',
}

export function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: {
  name: string
  src?: string | null
  size?: keyof typeof sizeMap
  className?: string
}) {
  const dim = size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 64 : 96
  const initials = initialsFromName(name || '?')

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={dim}
        height={dim}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
        unoptimized
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 font-bold text-white shadow-inner ${sizeMap[size]} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  )
}
