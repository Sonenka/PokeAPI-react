// src/state/useStore.js
import { useState, useEffect } from 'react';
import { fetchAllPokemons } from '../utils/api';

export const useStore = () => {
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState('id-asc');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const pokemons = await fetchAllPokemons();
      setAllPokemons(pokemons);
      setFilteredPokemons(pokemons);
      setIsLoading(false);
    };

    load();
  }, []);

  return {
    allPokemons,
    filteredPokemons,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    sortOption,
    setSortOption,
    filterType,
    setFilterType,
    searchTerm,
    setSearchTerm,
    isLoading,
  };
};
