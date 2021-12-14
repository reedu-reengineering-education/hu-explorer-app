const LayoutTile = ({ children }: { children: JSX.Element }) => (
  <div className="flex-auto md:max-w-[50%] min-w-[250px] max-h-[50%] p-4">
    {children}
  </div>
);

export default LayoutTile;
