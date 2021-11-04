import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = props => {
  return <>{props.children}</>;
};

export default Layout;
