import React from 'react';
import Link from 'next/link';
import { Button } from './Elements/Button';

const Navbar = () => {
  return (
    <nav className="flex w-full rounded-3xl bg-white p-4 shadow">
      <h1 className="py-2 px-4 text-2xl font-bold">HU Explorers</h1>
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
