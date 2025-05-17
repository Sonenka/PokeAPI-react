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
const MAX_POKEMONS = 2000; // Максимальное количество покемонов

const App = () => {
  const [pokemons, setPokemons] = useState([]); // Все покемоны (первые 2000)
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [types, setTypes] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [currentPagePokemons, setCurrentPagePokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState(0);
  const [typeFilterReady, setTypeFilterReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Загружаем первые 2000 покемонов
        const allPokemons = await fetchPokemonList();
        const allTypes = await fetchPokemonTypes();
        
        // Загружаем детали для всех покемонов (пачками)
        const pokemonDetails = {};
        const batchSize = 50;
        
        for (let i = 0; i < allPokemons.length; i += batchSize) {
          const batch = allPokemons.slice(i, i + batchSize);
          const details = await Promise.all(
            batch.map(p => fetchPokemonDetails(p.id))
          );
          
          details.forEach(detail => {
            if (detail) pokemonDetails[detail.id] = detail;
          });
        }
        
        setPokemons(allPokemons);
        setPokemonDetails(pokemonDetails);
        setTypes(allTypes);
        setFilteredPokemons(allPokemons);
        setTypeFilterReady(true);
        
        // Отображаем первую страницу
        setCurrentPagePokemons(allPokemons.slice(0, POKEMONS_PER_PAGE));
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
      
      const newDetails = {};
      const detailsToLoad = [];
      
      // Проверяем, какие покемоны еще не загружены
      pokemonsToLoad.forEach(p => {
        if (!pokemonDetails[p.id]) {
          detailsToLoad.push(fetchPokemonDetails(p.id));
        }
      });
      
      // Загружаем только недостающие детали
      if (detailsToLoad.length > 0) {
        const loadedDetails = await Promise.all(detailsToLoad);
        loadedDetails.forEach(detail => {
          if (detail) newDetails[detail.id] = detail;
        });
      }
      
      // Обновляем состояние
      if (Object.keys(newDetails).length > 0) {
        setPokemonDetails(prev => ({ ...prev, ...newDetails }));
      }
      
      setCurrentPagePokemons(pokemonsToLoad);
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
    if (typeFilterReady) {
      applyFilters();
    }
  }, [pokemons, search, selectedType, sortOrder, typeFilterReady]);

  const applyFilters = () => {
    let filteredList = [...pokemons];
  
    // Поиск по имени или ID
    if (search) {
      const searchTerm = search.toLowerCase().trim();
      const searchAsNumber = parseInt(searchTerm);
      const isNumericSearch = !isNaN(searchAsNumber);
      
      filteredList = filteredList.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm);
        const idMatch = isNumericSearch && p.id === searchAsNumber;
        return nameMatch || idMatch;
      });
    }
  
    // Фильтрация по типу
    if (selectedType) {
      filteredList = filteredList.filter(p => {
        const details = pokemonDetails[p.id];
        return details?.types?.includes(selectedType);
      });
    }
  
    // Сортировка
    filteredList.sort((a, b) => {
      switch (sortOrder) {
        case 'id-asc': return a.id - b.id;
        case 'id-desc': return b.id - a.id;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return a.id - b.id;
      }
    });
  
    setFilteredPokemons(filteredList);
    setCurrentPage(1);
    
    // Обновляем отображаемые покемоны
    setCurrentPagePokemons(filteredList.slice(0, POKEMONS_PER_PAGE));
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * POKEMONS_PER_PAGE;
    const endIndex = startIndex + POKEMONS_PER_PAGE;
    await loadPokemonDetails(filteredPokemons.slice(startIndex, endIndex));
  };

  const handleImageLoad = () => {
    setLoadedImages(prev => prev + 1);
  };

  const totalPages = Math.ceil(filteredPokemons.length / POKEMONS_PER_PAGE);

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
            style={{ opacity: loadedImages >= currentPagePokemons.length ? 1 : 0.5 }}
          >
            {filteredPokemons.length === 0 ? (
              <div className="no-results">No Pokémon found</div>
            ) : (
              currentPagePokemons.map((pokemon) => (
                <PokemonCard 
                  key={`${pokemon.id}-${currentPage}`}
                  pokemon={pokemonDetails[pokemon.id]} 
                  onImageLoad={handleImageLoad}
                />
              ))
            )}
          </div>
          
          {filteredPokemons.length > POKEMONS_PER_PAGE && (
            <Pagination
              total={filteredPokemons.length}
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