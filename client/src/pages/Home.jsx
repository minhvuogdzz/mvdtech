import Hero from '../components/Hero/Hero';
import TechGlobe from '../components/TechGlobe/TechGlobe';
import { useData } from '../contexts/DataContext';

const Home = () => {
  const { loading } = useData();

  if (loading) return null;

  return (
    <>
      <Hero />
      <TechGlobe />
    </>
  );
};

export default Home;
