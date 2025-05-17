// hooks/useLoader.js
import { useState } from 'react';
import Loader from '../components/Loader';

const useLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleLoader = (show) => {
    setIsLoading(show);
  };
  
  const LoaderComponent = () => isLoading ? <Loader /> : null;
  
  return { isLoading, toggleLoader, LoaderComponent };
};

export default useLoader;