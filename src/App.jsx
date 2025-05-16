import React, { useEffect, useState } from 'react';
import { fetchPokemonList, fetchPokemonTypes, fetchPokemonDetails } from './utils/api';
import PokemonCard from './components/PokemonCard';
import Pagination from './components/Pagination';
import Header from './components/Header';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';

import './styles/variables.css';
import './styles/header.css';
import './styles/card.css';
import './styles/index.css';
import './styles/pagination.css';

const POKEMONS_PER_PAGE = 12;
const MAX_RETRIES = 3;

const App = () => {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonDetails, setPokemonDetails] = useState([]);
  const [types, setTypes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [allPokemons, allTypes] = await Promise.all([
          fetchPokemonList(1000), // Уменьшил лимит для теста
          fetchPokemonTypes()
        ]);
        
        setPokemons(allPokemons);
        setTypes(allTypes);
        setFiltered(allPokemons);
        
        // Загружаем детали для первой страницы
        await loadPokemonDetails(allPokemons.slice(0, POKEMONS_PER_PAGE));
      } catch (err) {
        console.error("Error initializing app:", err);
        setError({
          message: "Failed to load Pokémon data. Please check your internet connection.",
          retry: () => window.location.reload()
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  const loadPokemonDetails = async (pokemonsToLoad) => {
    try {
      setIsLoading(true);
      setLoadedImages(0);
      
      const details = await Promise.all(
        pokemonsToLoad.map(pokemon => fetchPokemonDetails(pokemon.id))
      );
      
      setPokemonDetails(details.filter(Boolean));
    } catch (err) {
      console.error("Error loading pokemon details:", err);
      setError({
        message: "Failed to load Pokémon details. Trying again...",
        retry: () => loadPokemonDetails(pokemonsToLoad)
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [pokemons, search, selectedType, sortOrder]);

  const applyFilters = () => {
    let filteredList = [...pokemons];

    if (search) {
      filteredList = filteredList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedType) {
      filteredList = filteredList.filter(p =>
        pokemonDetails.find(d => d?.id === p.id)?.types.includes(selectedType)
      );
    }

    filteredList.sort((a, b) => 
      sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name)
    );

    setFiltered(filteredList);
    setCurrentPage(1);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * POKEMONS_PER_PAGE;
    const endIndex = startIndex + POKEMONS_PER_PAGE;
    await loadPokemonDetails(filtered.slice(startIndex, endIndex));
  };

  const handleImageLoad = () => {
    setLoadedImages(prev => prev + 1);
  };

  const indexOfLast = currentPage * POKEMONS_PER_PAGE;
  const indexOfFirst = indexOfLast - POKEMONS_PER_PAGE;
  const currentPokemons = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / POKEMONS_PER_PAGE);

  return (
    <div className="container">
      <Header
        searchValue={search}
        onSearchChange={setSearch}
        types={types}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      
      {isLoading && <Loader />}
      
      {error ? (
        <ErrorMessage 
          message={error.message} 
          onRetry={error.retry} 
        />
      ) : (
        <>
          <div 
            className="list-wrapper"
            style={{ opacity: loadedImages >= currentPokemons.length ? 1 : 0.5 }}
          >
            {filtered.length === 0 ? (
              <div className="no-results">No Pokémon found</div>
            ) : (
              currentPokemons.map((pokemon, index) => (
                <PokemonCard 
                  key={`${pokemon.id}-${currentPage}`}
                  pokemon={pokemonDetails[index]} 
                  onImageLoad={handleImageLoad}
                />
              ))
            )}
          </div>
          
          {filtered.length > POKEMONS_PER_PAGE && (
            <Pagination
              total={filtered.length}
              perPage={POKEMONS_PER_PAGE}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;