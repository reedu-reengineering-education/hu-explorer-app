import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = props => {
  return (
    <div className="container mx-auto min-h-screen p-5">{props.children}</div>
  );
};

export default Layout;
