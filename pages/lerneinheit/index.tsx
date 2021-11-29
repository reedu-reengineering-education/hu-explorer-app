import { Link } from '@/components/Link';
import React from 'react';

function Lerneinheit() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-auto p-4">
        <h1 className="text-4xl">Title</h1>
      </div>
      <div className="flex flex-col">
        <Link href="lerneinheit/schall" text="Schall" passHref></Link>
        <Link
          href="lerneinheit/biodiversitaet"
          text="Biodiversität"
          passHref
        ></Link>
      </div>
    </div>
  );
}

export default Lerneinheit;
