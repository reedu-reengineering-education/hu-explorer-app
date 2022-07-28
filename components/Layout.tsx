import React, { ReactElement } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<ReactElement> = props => {
  return (
    <div className="h-full">
      {/* <Navbar /> */}
      <div className="h-full">{props}</div>
    </div>
  );
};

export default Layout;
