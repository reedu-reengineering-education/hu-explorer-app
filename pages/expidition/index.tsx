import { Button } from '@/components/Elements/Button';
import { Link } from '@/components/Elements/Link';
import React, { useState } from 'react';

function Lerneinheit() {
  const [group, setGroup] = useState('senseBox1');

  const groupChanged = event => {
    setGroup(event.target.value);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-auto p-4">
        <h1 className="text-4xl">Title</h1>
      </div>
      <div className="flex flex-col">
        <label htmlFor="group">Gruppe auswählen:</label>
        <select name="group" id="group" value={group} onChange={groupChanged}>
          <option value="senseBox1">senseBox1</option>
          <option value="senseBox2">senseBox2</option>
          <option value="senseBox3">senseBox3</option>
          <option value="senseBox4">senseBox4</option>
          <option value="senseBox5">senseBox5</option>
          <option value="senseBox6">senseBox6</option>
          <option value="senseBox7">senseBox7</option>
          <option value="senseBox8">senseBox8</option>
          <option value="senseBox9">senseBox9</option>
          <option value="senseBox10">senseBox10</option>
        </select>
        <Link href="/expidition/schall?schule=UniLab" passHref>
          <Button>Schall</Button>
        </Link>
        <Link
          href={`/expidition/artenvielfalt/data?schule=Didaktik der Physik&gruppe=${group}&daten=versiegelung`}
        >
          <Button>Datenerfassung Undurchlässigkeit</Button>
        </Link>
        <Link
          href={`/expidition/artenvielfalt/data?schule=Didaktik der Physik&gruppe=${group}&daten=artenvielfalt`}
        >
          <Button>Datenerfassung Artenvielfalt</Button>
        </Link>
        <Link
          href={`/expidition/artenvielfalt/group?schule=Didaktik der Physik&gruppe=${group}`}
        >
          <Button>Datenvergleich Gruppen</Button>
        </Link>
        <Link
          href={`/expidition/artenvielfalt?schule=Didaktik der Physik&gruppe=${group}`}
          passHref
        >
          <Button>Artenvielfalt Auswertung</Button>
        </Link>
      </div>
    </div>
  );
}

export default Lerneinheit;
