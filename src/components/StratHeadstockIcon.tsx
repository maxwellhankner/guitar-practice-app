import { forwardRef } from 'react'
import type { LucideProps } from 'lucide-react'

/** Tune tab icon. Paths come from design/strat-headstock.svg. */
export const StratHeadstockIcon = forwardRef<SVGSVGElement, LucideProps>(
  function StratHeadstockIcon(
    { size = 24, className, strokeWidth = 2, ...rest },
    ref,
  ) {
    const weight = Number(strokeWidth) * (453 / 24)
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="30 30 453 453"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...rest}
        strokeWidth={weight}
      >
        <path d="M135.7,365.46c72.42-80.78,137.27-152.52,193.66-210.27,56.56-49.3,105.58-36.79,125.92-1,13.07,23.61,16.71,53.93-5.08,77.18-27.6,21.79-41.75,28.38-80.63,17.27,0,0-63.81,155.2-77.7,194.08-21.07-1.39-68.45,12.44-92.97,35.59,0,0-23.53-22.39-42.21-40.69l-28.88-27.13,7.9-45.03h-.01Z" />
        <circle cx="80.18" cy="308.57" r="34" fill="currentColor" stroke="none" />
        <circle cx="156.81" cy="225.76" r="34" fill="currentColor" stroke="none" />
        <circle cx="231.69" cy="142.68" r="34" fill="currentColor" stroke="none" />
        <circle cx="313.04" cy="67.69" r="34" fill="currentColor" stroke="none" />
      </svg>
    )
  },
)
