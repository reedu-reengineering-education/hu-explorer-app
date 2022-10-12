const LayoutTile = ({ children }: { children: JSX.Element }) => (
  <div className="mb-4 max-h-[49%] min-h-[49%] min-w-[49%] max-w-[49%] flex-auto p-4">
    {children}
  </div>
);

export default LayoutTile;
