const LayoutTile = ({ children }: { children: JSX.Element }) => (
  <div className="flex-auto max-w-[50%] min-w-[50%] max-h-[50%] min-h-[50%] p-4 mb-4">
    {children}
  </div>
);

export default LayoutTile;
