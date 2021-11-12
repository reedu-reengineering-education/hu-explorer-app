import React, { ReactElement } from 'react';

const Layout: React.FC<ReactElement> = props => {
  return <div className="container mx-auto">{props}</div>;
};

export default Layout;
