import React from 'react'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'jade' | 'silk' | 'bronze'
  className?: string
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick
}) => {
  const baseClasses = 'zen-card'
  const variantClasses = {
    default: 'zen-card',
    jade: 'zen-card-jade',
    silk: 'zen-card-silk',
    bronze: 'zen-card-bronze'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  )
} 