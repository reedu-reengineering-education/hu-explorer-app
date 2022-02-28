const LayoutTile = ({ children }: { children: JSX.Element }) => (
  <div className="mb-4 max-h-[50%] min-h-[50%] min-w-[50%] max-w-[50%] flex-auto p-4">
    {children}
  </div>
);

export default LayoutTile;
