import React, { useEffect, useState } from 'react';
import { fetchPokemonList, fetchPokemonTypes } from './utils/api';
import PokemonCard from './components/PokemonCard';
import Pagination from './components/Pagination';
import Header from './components/Header'
import './styles/header.css'
import './styles/variables.css'

import './styles/card.css'
import './styles/index.css'

const POKEMONS_PER_PAGE = 12;

const App = () => {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPokemons();
    fetchPokemonTypes().then(setTypes);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pokemons, search, selectedType, sortOrder]);

  const loadPokemons = async () => {
    const all = await fetchPokemonList(150); // можно увеличить
    setPokemons(all);
  };

  const applyFilters = () => {
    let filteredList = [...pokemons];

    if (search) {
      filteredList = filteredList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedType) {
      filteredList = filteredList.filter(p =>
        p.types.includes(selectedType)
      );
    }

    if (sortOrder === 'asc') {
      filteredList.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filteredList.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFiltered(filteredList);
    setCurrentPage(1); // сброс при изменении фильтров
  };

  const indexOfLast = currentPage * POKEMONS_PER_PAGE;
  const indexOfFirst = indexOfLast - POKEMONS_PER_PAGE;
  const currentPokemons = filtered.slice(indexOfFirst, indexOfLast);

  return (
    <div className="container">
      <Header
        // Search props
        searchValue={search}
        onSearchChange={setSearch}
        
        // Filter props
        types={types}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        
        // Sort props
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      
      <div className="grid">
        {currentPokemons.map(pokemon => (
          <PokemonCard key={pokemon.name} pokemon={pokemon} />
        ))}
      </div>
      
      <Pagination
        total={filtered.length}
        perPage={POKEMONS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default App;
