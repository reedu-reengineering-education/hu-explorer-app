import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="w-full bg-white rounded-3xl shadow p-4 flex">
      <h1 className="text-2xl font-bold py-2 px-4">HU Explorers</h1>
      <Link href="/" passHref>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded-xl">
          Karte
        </button>
      </Link>
      <Link href="/lerneinheit" passHref>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded-xl">
          Lerneinheit
        </button>
      </Link>
    </nav>
  );
};

export default Navbar;
