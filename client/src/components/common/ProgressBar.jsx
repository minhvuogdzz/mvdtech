import { useState, useEffect } from 'react';

const ProgressBar = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70), 100);
    const t2 = setTimeout(() => setWidth(100), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (width >= 100) return null;

  return <div className="progress-bar" style={{ width: `${width}%` }} />;
};

export default ProgressBar;
