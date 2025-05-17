// src/state/useStore.js
import { useState, useEffect, useContext } from 'react';
import { fetchAllPokemons } from '../utils/api';
import { useSearch } from '../contexts/SearchContext';

export const useStore = () => {
  const { searchTerm } = useSearch(); // Получаем searchTerm из контекста
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState('id-asc');
  const [filterType, setFilterType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const pokemons = await fetchAllPokemons();
      setAllPokemons(pokemons);
      setIsLoading(false);
    };
    load();
  }, []);

  // Фильтрация и сортировка
  useEffect(() => {
    let result = [...allPokemons];
    
    // Фильтрация по поиску
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтрация по типу
    if (filterType) {
      result = result.filter(p => 
        p.types.includes(filterType)
      );
    }
    
    // Сортировка
    result = sortPokemons(result, sortOption);
    
    setFilteredPokemons(result);
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  }, [allPokemons, searchTerm, filterType, sortOption]);

  const sortPokemons = (pokemons, option) => {
    // ... ваша реализация сортировки
    return pokemons;
  };

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
    isLoading,
  };
};