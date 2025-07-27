import React, { forwardRef, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useButtonInteractions, useCardInteractions } from '../hooks/useWorldClassInteractions';

// === 🎨 通用接口定义 ===

interface BaseProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

interface VariantProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface StateProps {
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
}

// === 🔘 Button 组件 ===

interface ButtonProps extends BaseProps, VariantProps, StateProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  onLongPress?: () => void;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  rippleEffect?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  elevation?: 0 | 1 | 2 | 3;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  error = false,
  success = false,
  type = 'button',
  onClick,
  onLongPress,
  hapticFeedback = true,
  soundFeedback = false,
  rippleEffect = true,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  elevation = 1,
  'data-testid': testId,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number; size: number }>>([]);
  
  const interactions = useButtonInteractions(
    () => {
      if (!disabled && !loading && onClick) {
        onClick();
      }
    },
    {
      hapticPattern: success ? 'success' : error ? 'warning' : 'light',
      soundEnabled: soundFeedback
    }
  );

  // 涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect || disabled) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Math.random().toString(36),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  // 组合样式类名
  const baseClasses = [
    'btn',
    `btn-${size}`,
    `btn-${variant}`,
    fullWidth && 'w-full',
    rounded && 'rounded-full',
    disabled && 'cursor-not-allowed opacity-50',
    loading && 'cursor-wait',
    error && 'border-semantic-error-500',
    success && 'border-semantic-success-500',
    elevation > 0 && `shadow-${elevation === 1 ? 'md' : elevation === 2 ? 'lg' : 'xl'}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={createRipple}
      data-testid={testId}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      {...interactions.a11yProps}
      {...props}
    >
      {/* 涟漪效果 */}
      {rippleEffect && (
        <div className="absolute inset-0 overflow-hidden rounded-inherit">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* 按钮内容 */}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>

      {/* 状态指示器 */}
      {(error || success) && (
        <motion.div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            error ? 'bg-semantic-error-500' : 'bg-semantic-success-500'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

// === 🃏 Card 组件 ===

interface CardProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  header?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  error?: boolean;
  blur?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  onSwipe,
  header,
  footer,
  loading = false,
  error = false,
  blur = false,
  'data-testid': testId,
  ...props
}, ref) => {
  const interactions = useCardInteractions(onClick, onSwipe);

  const baseClasses = [
    'card',
    padding !== 'none' && `p-${padding === 'sm' ? '4' : padding === 'md' ? '6' : padding === 'lg' ? '8' : '10'}`,
    variant === 'elevated' && 'shadow-lg',
    variant === 'outlined' && 'border border-neutral-200',
    variant === 'filled' && 'bg-glass-strong',
    interactive && 'cursor-pointer hover:shadow-lg',
    error && 'border-semantic-error-500/50',
    blur && 'backdrop-blur-lg',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {header && (
        <div className="card-header mb-4 pb-4 border-b border-neutral-200/10">
          {header}
        </div>
      )}
      
      <div className="card-content">
        {loading ? (
          <CardSkeleton />
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className="card-footer mt-4 pt-4 border-t border-neutral-200/10">
          {footer}
        </div>
      )}

      {error && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 bg-semantic-error-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </>
  );

  if (interactive) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        data-testid={testId}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...interactions.a11yProps}
        {...props}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      data-testid={testId}
      {...props}
    >
      {content}
    </div>
  );
});

Card.displayName = 'Card';

// === 📝 Input 组件 ===

interface InputProps extends BaseProps, StateProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  maxLength?: number;
  autoComplete?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  label,
  helperText,
  errorMessage,
  disabled = false,
  loading = false,
  error = false,
  icon,
  iconPosition = 'left',
  clearable = false,
  maxLength,
  autoComplete,
  required = false,
  size = 'md',
  'data-testid': testId,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  const hasError = error || !!errorMessage;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    const newValue = '';
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg'
  };

  const inputClasses = [
    'input',
    sizeClasses[size],
    icon && iconPosition === 'left' && 'pl-10',
    icon && iconPosition === 'right' && 'pr-10',
    clearable && currentValue && 'pr-10',
    hasError && 'border-semantic-error-500 focus:border-semantic-error-500',
    disabled && 'cursor-not-allowed opacity-50',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          {label}
          {required && <span className="text-semantic-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* 左侧图标 */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}

        {/* 输入框 */}
        <motion.input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          disabled={disabled || loading}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={required}
          data-testid={testId}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          {...props}
        />

        {/* 右侧图标或清除按钮 */}
        {icon && iconPosition === 'right' && !clearable && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}

        {/* 清除按钮 */}
        {clearable && currentValue && !loading && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
            onClick={handleClear}
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <motion.div
              className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* 焦点指示器 */}
        {focused && (
          <motion.div
            className="absolute inset-0 border-2 border-brand-primary-500 rounded-md pointer-events-none"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* 帮助文本或错误信息 */}
      <AnimatePresence>
        {(helperText || errorMessage) && (
          <motion.div
            className={`mt-2 text-sm ${hasError ? 'text-semantic-error-500' : 'text-neutral-400'}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {errorMessage || helperText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 字符计数 */}
      {maxLength && (
        <div className="mt-2 text-xs text-neutral-500 text-right">
          {currentValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// === 🎭 Avatar 组件 ===

interface AvatarProps extends BaseProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  online?: boolean;
  shape?: 'circle' | 'square';
  border?: boolean;
  loading?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  online,
  shape = 'circle',
  border = false,
  loading = false,
  className = '',
  'data-testid': testId
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const avatarClasses = [
    'relative inline-flex items-center justify-center overflow-hidden bg-neutral-600 text-neutral-300 font-medium',
    sizeClasses[size],
    shape === 'circle' ? 'rounded-full' : 'rounded-md',
    border && 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800',
    className
  ].filter(Boolean).join(' ');

  const showImage = src && !imageError && !loading;
  const showFallback = !showImage && fallback;
  const showPlaceholder = !showImage && !showFallback;

  return (
    <div className={avatarClasses} data-testid={testId}>
      {/* 头像图片 */}
      {src && (
        <motion.img
          className={`w-full h-full object-cover ${imageLoading || imageError ? 'opacity-0' : 'opacity-100'}`}
          src={src}
          alt={alt}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoading || imageError ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* 加载状态 */}
      {(loading || imageLoading) && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-neutral-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-1/2 h-1/2 border-2 border-neutral-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* 回退文字 */}
      {showFallback && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {fallback}
        </motion.span>
      )}

      {/* 默认占位符 */}
      {showPlaceholder && (
        <motion.svg
          className="w-1/2 h-1/2 text-neutral-400"
          fill="currentColor"
          viewBox="0 0 24 24"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </motion.svg>
      )}

      {/* 在线状态指示器 */}
      {online !== undefined && (
        <motion.div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            online ? 'bg-semantic-success-500' : 'bg-neutral-400'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );
};

// === 💀 Skeleton 组件 ===

interface SkeletonProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  shape?: 'rectangle' | 'circle' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  shape = 'rectangle',
  animation = 'pulse',
  lines = 1,
  className = '',
  'data-testid': testId
}) => {
  const baseClasses = [
    'bg-neutral-700',
    shape === 'circle' && 'rounded-full',
    shape === 'rectangle' && 'rounded',
    shape === 'text' && 'rounded-sm',
    animation === 'pulse' && 'animate-pulse',
    className
  ].filter(Boolean).join(' ');

  if (shape === 'text' && lines > 1) {
    return (
      <div className="space-y-2" data-testid={testId}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={{ width, height }}
      data-testid={testId}
    />
  );
};

// === 🃏 CardSkeleton 组件 ===

export const CardSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton shape="circle" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height="1rem" />
        <Skeleton width="40%" height="0.875rem" />
      </div>
    </div>
    <Skeleton shape="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton width={80} height={32} />
      <Skeleton width={60} height={32} />
    </div>
  </div>
);

// === 🎯 Badge 组件 ===

interface BadgeProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  dot?: boolean;
  count?: number;
  max?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  outline = false,
  dot = false,
  count,
  max = 99,
  className = '',
  'data-testid': testId
}) => {
  const displayCount = count !== undefined ? (count > max ? `${max}+` : count.toString()) : '';
  const showBadge = dot || count !== undefined || children;

  if (!showBadge) return null;

  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5',
    md: dot ? 'w-2.5 h-2.5' : 'px-2 py-1 text-xs min-w-[1.5rem] h-6',
    lg: dot ? 'w-3 h-3' : 'px-2.5 py-1 text-sm min-w-[1.75rem] h-7'
  };

  const variantClasses = {
    primary: outline ? 'border-brand-primary-500 text-brand-primary-500' : 'bg-brand-primary-500 text-white',
    secondary: outline ? 'border-brand-secondary-500 text-brand-secondary-500' : 'bg-brand-secondary-500 text-white',
    success: outline ? 'border-semantic-success-500 text-semantic-success-500' : 'bg-semantic-success-500 text-white',
    warning: outline ? 'border-semantic-warning-500 text-semantic-warning-500' : 'bg-semantic-warning-500 text-white',
    error: outline ? 'border-semantic-error-500 text-semantic-error-500' : 'bg-semantic-error-500 text-white',
    info: outline ? 'border-semantic-info-500 text-semantic-info-500' : 'bg-semantic-info-500 text-white'
  };

  const badgeClasses = [
    'inline-flex items-center justify-center rounded-full font-medium',
    sizeClasses[size],
    variantClasses[variant],
    outline && 'border bg-transparent',
    dot && !outline && 'border-2 border-white',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.span
      className={badgeClasses}
      data-testid={testId}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {dot ? null : count !== undefined ? displayCount : children}
    </motion.span>
  );
};

// === 🔄 Loading 组件 ===

interface LoadingProps extends BaseProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  'data-testid': testId
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const colorClasses = {
    primary: 'text-brand-primary-500',
    secondary: 'text-brand-secondary-500',
    white: 'text-white',
    current: 'text-current'
  };

  const loadingClasses = [
    'inline-block',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={`${loadingClasses} border-2 border-current border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
      
      case 'dots':
        return (
          <div className={`${loadingClasses} flex space-x-1`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-current rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <motion.div
            className={`${loadingClasses} bg-current rounded-full`}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        );
      
      case 'bars':
        return (
          <div className={`${loadingClasses} flex space-x-1 items-end`}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-current rounded-full"
                style={{ height: '100%' }}
                animate={{ scaleY: [1, 0.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="inline-flex items-center space-x-2" data-testid={testId}>
      {renderVariant()}
      {text && (
        <span className={`text-sm ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// === 📏 Divider 组件 ===

interface DividerProps extends BaseProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  text,
  className = '',
  'data-testid': testId
}) => {
  const spacingClasses = {
    xs: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    sm: orientation === 'horizontal' ? 'my-3' : 'mx-3',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    xl: orientation === 'horizontal' ? 'my-8' : 'mx-8'
  };

  const borderStyle = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  };

  if (text && orientation === 'horizontal') {
    return (
      <div className={`relative ${spacingClasses[spacing]} ${className}`} data-testid={testId}>
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t border-neutral-200/20 ${borderStyle[variant]}`} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-dark-surface-1 text-sm text-neutral-400">
            {text}
          </span>
        </div>
      </div>
    );
  }

  const dividerClasses = [
    orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
    'border-neutral-200/20',
    borderStyle[variant],
    spacingClasses[spacing],
    className
  ].filter(Boolean).join(' ');

  return <div className={dividerClasses} data-testid={testId} />;
};

export default {
  Button,
  Card,
  Input,
  Avatar,
  Skeleton,
  CardSkeleton,
  Badge,
  Loading,
  Divider
}; 