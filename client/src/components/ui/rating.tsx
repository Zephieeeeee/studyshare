import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  value?: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({
  value = 0,
  max = 5,
  readOnly = false,
  onChange,
  size = 'md',
  className
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = (newValue: number) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseEnter = (newValue: number) => {
    if (!readOnly) {
      setHoverValue(newValue);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-7 w-7';
      default: return 'h-5 w-5';
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div 
      className={cn(
        'flex items-center',
        isFocused && 'outline-none ring-2 ring-primary ring-offset-2',
        className
      )}
      onKeyDown={(e) => {
        if (!readOnly && onChange) {
          if (e.key === 'ArrowRight' && value < max) {
            onChange(value + 1);
          } else if (e.key === 'ArrowLeft' && value > 0) {
            onChange(value - 1);
          }
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={readOnly ? -1 : 0}
    >
      <div className="flex">
        {stars.map((star) => (
          <span
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? -1 : 0}
            aria-label={readOnly ? `Rated ${value} out of ${max} stars` : `Rate ${star} out of ${max} stars`}
            className={cn(
              'cursor-pointer transition-colors',
              !readOnly && 'hover:text-yellow-400',
              readOnly && 'cursor-default',
              'text-gray-300', // Default color
              displayValue >= star && 'text-yellow-400', // Filled color
              getIconSize()
            )}
          >
            <Star className="fill-current" />
          </span>
        ))}
      </div>
    </div>
  );
}
