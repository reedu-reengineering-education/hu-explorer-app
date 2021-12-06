import { Button } from '@/components/Elements/Button';
import { Link } from '@/components/Elements/Link';
import React from 'react';

function Lerneinheit() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-auto p-4">
        <h1 className="text-4xl">Title</h1>
      </div>
      <div className="flex flex-col">
        <Link href="/expidition/schall" passHref>
          <Button>Schall</Button>
        </Link>
        <Link href="/expidition/artenvielfalt" passHref>
          <Button>Artenvielfalt</Button>
        </Link>
      </div>
    </div>
  );
}

export default Lerneinheit;
