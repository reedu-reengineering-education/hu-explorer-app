import React, { ReactElement } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<ReactElement> = props => {
  return (
    <div className="p-8">
      <Navbar />
      <div className="container mx-auto">{props}</div>
    </div>
  );
};

export default Layout;
