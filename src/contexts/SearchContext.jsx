import { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const value = {
    searchTerm,
    setSearchTerm,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};