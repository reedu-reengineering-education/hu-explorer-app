function Lerneinheit() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-auto p-4">
        <h1>Title</h1>
      </div>
      <div className="flex flex-col sm:flex-row divide-x-2 divide-blue-500">
        <div className="flex-grow md:w-2/3 p-4">Tabelle</div>
        <div className="flex-none md:w-1/3 p-4">Auswertung</div>
      </div>
    </div>
  );
}

export default Lerneinheit;
