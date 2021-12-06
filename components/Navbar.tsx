import React from 'react';
import Link from 'next/link';
import { Button } from './Elements/Button';

const Navbar = () => {
  return (
    <nav className="w-full bg-white rounded-3xl shadow p-4 flex">
      <h1 className="text-2xl font-bold py-2 px-4">HU Explorers</h1>
      <Link href="/" passHref>
        <Button>Karte</Button>
      </Link>
      <Link href="/expidition" passHref>
        <Button>Expiditionen</Button>
      </Link>
    </nav>
  );
};

export default Navbar;
