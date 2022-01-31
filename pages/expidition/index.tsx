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
        <Link href="/expidition/schall?schule=esn" passHref>
          <Button>Schall</Button>
        </Link>
        <Link href="/expidition/artenvielfalt/data?schule=esn&gruppe=sensebox9&daten=versiegelung">
          <Button>Datenerfassung Undurchlässigkeit</Button>
        </Link>
        <Link href="/expidition/artenvielfalt/data?schule=esn&gruppe=sensebox9&daten=artenvielfalt">
          <Button>Datenerfassung Artenvielfalt</Button>
        </Link>
        <Link href="/expidition/artenvielfalt/group?schule=esn&gruppe=sensebox9">
          <Button>Datenvergleich Gruppen</Button>
        </Link>
        <Link
          href="/expidition/artenvielfalt?schule=esn&gruppe=sensebox1"
          passHref
        >
          <Button>Artenvielfalt Auswertung</Button>
        </Link>
      </div>
    </div>
  );
}

export default Lerneinheit;
