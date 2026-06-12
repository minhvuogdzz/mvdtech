const Skeleton = ({ className = '', width, height, rounded = 'rounded-lg' }) => (
  <div 
    className={`skeleton ${rounded} ${className}`} 
    style={{ width: width || '100%', height: height || '20px' }} 
  />
);

export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton height="180px" rounded="rounded-xl" />
    <Skeleton height="20px" width="60%" />
    <Skeleton height="14px" width="80%" />
    <div className="flex gap-2">
      <Skeleton height="24px" width="60px" rounded="rounded-full" />
      <Skeleton height="24px" width="50px" rounded="rounded-full" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height="14px" width={`${100 - i * 15}%`} />
    ))}
  </div>
);

export default Skeleton;
