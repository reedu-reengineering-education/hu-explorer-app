function Lerneinheit() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-auto">
        <h1>Title</h1>
      </div>
      <div className="flex flex-col sm:flex-row ">
        <div className="flex-grow md:w-2/3 bg-red-400">Tabelle</div>
        <div className="flex-none md:w-1/3 bg-green-400">Auswertung</div>
      </div>
    </div>
  );
}

export default Lerneinheit;
