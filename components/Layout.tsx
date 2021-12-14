import React, { ReactElement } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<ReactElement> = props => {
  return (
    <div className="p-8 h-full">
      {/* <Navbar /> */}
      <div className="container mx-auto h-full">{props}</div>
    </div>
  );
};

export default Layout;
