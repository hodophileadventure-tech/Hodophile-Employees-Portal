'use client'

import Image from 'next/image'

interface BrandLogoProps {
  compact?: boolean
  className?: string
}

export default function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} ${className}`.trim()}>
      <div className={`relative flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <Image
          src="/logo.png"
          alt="Hodophile logo"
          fill
          sizes="(max-width: 768px) 32px, 40px"
          className="object-contain"
          priority
        />
      </div>

      {!compact && (
        <div className="text-left">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Hodophile</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Employee Portal</p>
        </div>
      )}

      {compact && (
        <span className="font-semibold text-slate-900 dark:text-white">Hodophile</span>
      )}
    </div>
  )
}
