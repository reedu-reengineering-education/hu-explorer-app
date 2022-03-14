import { default as NextLink, LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

interface LinkProps extends NextLinkProps {
  className?: string;
  children?: React.ReactNode;
}

export const Link = ({ href, className, children, ...props }: LinkProps) => {
  return (
    <NextLink href={href} {...props}>
      <a className={`text-indigo-600 hover:text-indigo-900 ${className}`}>
        {children}
      </a>
    </NextLink>
  );
};
