import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonTypes, fetchPokemonDetails } from './utils/api';
import PokemonCard from './components/PokemonCard';
import Pagination from './components/Pagination';
import Header from './components/Header';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import PokemonDetails from './components/PokemonDetails';
import { SearchProvider, useSearch } from './contexts/SearchContext';

import './styles/variables.css';
import './styles/header.css';
import './styles/card.css';
import './styles/index.css';
import './styles/pagination.css';
import './styles/details.css';
import './styles/media.css';
import './styles/loader.css';

const POKEMONS_PER_PAGE = 12;
const MAX_POKEMONS = 2000;

const PokedexPage = () => {
  const { searchTerm } = useSearch(); // Получаем searchTerm из контекста
  const [pokemons, setPokemons] = useState([]);
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [types, setTypes] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [currentPagePokemons, setCurrentPagePokemons] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [allPokemons, allTypes] = await Promise.all([
          fetchPokemonList(MAX_POKEMONS),
          fetchPokemonTypes()
        ]);
        
        setPokemons(allPokemons);
        setTypes(allTypes);
      } catch (err) {
        console.error("Initialization error:", err);
        setError({
          message: "Failed to load Pokémon data",
          retry: () => window.location.reload()
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...pokemons];

      // Фильтрация по поиску
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.id.toString().includes(searchTerm)
        );
      }

      // Фильтрация по типу
      if (selectedType) {
        result = result.filter(p => {
          const details = pokemonDetails[p.id];
          return details?.types?.includes(selectedType);
        });
      }

      // Сортировка
      result.sort((a, b) => {
        switch (sortOrder) {
          case 'id-asc': return a.id - b.id;
          case 'id-desc': return b.id - a.id;
          case 'name-asc': return a.name.localeCompare(b.name);
          case 'name-desc': return b.name.localeCompare(a.name);
          default: return a.id - b.id;
        }
      });

      setFilteredPokemons(result);
      setCurrentPage(1);
      loadPokemonDetails(result.slice(0, POKEMONS_PER_PAGE));
    };

    if (pokemons.length > 0) {
      applyFilters();
    }
  }, [pokemons, searchTerm, selectedType, sortOrder]);

  const loadPokemonDetails = async (pokemonsToLoad) => {
    try {
      setIsLoading(true);
      
      const detailsToLoad = pokemonsToLoad
        .filter(p => !pokemonDetails[p.id])
        .map(p => fetchPokemonDetails(p.id));
      
      if (detailsToLoad.length > 0) {
        const loadedDetails = await Promise.all(detailsToLoad);
        const newDetails = loadedDetails.reduce((acc, detail) => {
          if (detail) acc[detail.id] = detail;
          return acc;
        }, {});
        
        setPokemonDetails(prev => ({ ...prev, ...newDetails }));
      }
      
      setCurrentPagePokemons(pokemonsToLoad);
    } catch (err) {
      console.error("Loading error:", err);
      setError({
        message: "Failed to load details",
        retry: () => loadPokemonDetails(pokemonsToLoad)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * POKEMONS_PER_PAGE;
    const endIndex = startIndex + POKEMONS_PER_PAGE;
    loadPokemonDetails(filteredPokemons.slice(startIndex, endIndex));
  };

  const handlePokemonClick = (pokemonId) => {
    navigate(`/pokemon/${pokemonId}`);
  };

  return (
    <div className="container">
      <Header
        types={types}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      
      {isLoading && <Loader />}
      
      {error ? (
        <ErrorMessage message={error.message} onRetry={error.retry} />
      ) : (
        <>
          <div className="list-wrapper">
            {filteredPokemons.length === 0 ? (
              <div className="no-results">
                {searchTerm ? `No results for "${searchTerm}"` : "No Pokémon found"}
              </div>
            ) : (
              currentPagePokemons.map(pokemon => (
                <PokemonCard 
                  key={`${pokemon.id}-${currentPage}`}
                  pokemon={pokemonDetails[pokemon.id]}
                  onClick={() => handlePokemonClick(pokemon.id)}
                />
              ))
            )}
          </div>
          
          {filteredPokemons.length > POKEMONS_PER_PAGE && (
            <Pagination
              total={filteredPokemons.length}
              perPage={POKEMONS_PER_PAGE}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredPokemons.length / POKEMONS_PER_PAGE)}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <SearchProvider>
      <Router basename="/PokeAPI-react">
        <Routes>
          <Route path="/" element={<PokedexPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SearchProvider>
  );
};

export default App;