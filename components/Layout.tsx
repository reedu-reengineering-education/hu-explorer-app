import React, { ReactElement } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<ReactElement> = props => {
  return (
    <div className="h-full p-8">
      {/* <Navbar /> */}
      <div className="container mx-auto h-full">{props}</div>
    </div>
  );
};

export default Layout;
