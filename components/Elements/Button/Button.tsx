import * as React from 'react';

import { Spinner } from '@/components/Elements/Spinner';

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-gray-50:text-blue-600 focus:ring-blue-500 focus:ring-offset-blue-200',
  inverse:
    'bg-white text-blue-600 hover:bg-blue-600:text-white focus:ring-white focus:ring-offset-blue-100',
  danger:
    'bg-red-600 text-white hover:bg-red-50:text-red-600 focus:ring-red-500 focus:ring-offset-red-200',
  lufttemperatur: 'bg-he-yellow text-white focus:ring-he-yellow',
  bodenfeuchte: 'bg-he-blue text-white focus:ring-he-blue',
  undurchlaessigkeit: 'bg-he-green text-white focus:ring-he-green',
  artenvielfalt: 'bg-he-red text-white focus:ring-he-red',
};

const sizes = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-2 px-6 text-md',
  lg: 'py-3 px-8 text-lg',
};

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined };

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
} & IconProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`m-1 flex items-center justify-center rounded-lg py-2 px-4 shadow-md transition duration-100 ease-in focus:outline-none  focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <Spinner size="sm" className="text-current" variant="light" />
        )}
        {!isLoading && startIcon}
        <span className="mx-2 text-xl">{props.children}</span>{' '}
        {!isLoading && endIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
