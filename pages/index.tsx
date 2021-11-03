import Map from '../components/Map';

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold mb-4">Humbold Explorers</h1>
      <div className="rounded overflow-hidden shadow">
        <Map width={'100%'} height={500}></Map>
      </div>
    </main>
  );
}
