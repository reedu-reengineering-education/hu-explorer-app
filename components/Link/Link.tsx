import { default as NextLink, LinkProps as NextLinkProps } from 'next/link';

interface LinkProps extends NextLinkProps {
  text: string;
  className?: string;
}

export const Link = ({ href, className, text, ...props }: LinkProps) => {
  return (
    <NextLink href={href} {...props}>
      <a className={`text-indigo-600 hover:text-indigo-900 ${className}`}>
        {text}
      </a>
    </NextLink>
  );
};
