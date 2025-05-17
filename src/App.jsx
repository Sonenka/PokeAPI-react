import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonTypes, fetchPokemonDetails } from './utils/api';
import PokemonCard from './components/PokemonCard';
import Pagination from './components/Pagination';
import Header from './components/Header';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import PokemonDetails from './components/PokemonDetails';

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
  const [pokemons, setPokemons] = useState([]);
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
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allPokemons = await fetchPokemonList(MAX_POKEMONS);
        const allTypes = await fetchPokemonTypes();
        
        setPokemons(allPokemons);
        setTypes(allTypes);
        setFilteredPokemons(allPokemons);
        
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
      
      const newDetails = {};
      const detailsToLoad = [];
      
      pokemonsToLoad.forEach(p => {
        if (!pokemonDetails[p.id]) {
          detailsToLoad.push(fetchPokemonDetails(p.id));
        }
      });
      
      if (detailsToLoad.length > 0) {
        const loadedDetails = await Promise.all(detailsToLoad);
        loadedDetails.forEach(detail => {
          if (detail) newDetails[detail.id] = detail;
        });
      }
      
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
    applyFilters();
  }, [pokemons, search, selectedType, sortOrder]);

  const applyFilters = () => {
    let filteredList = [...pokemons];

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

    if (selectedType) {
      filteredList = filteredList.filter(p => {
        const details = pokemonDetails[p.id];
        return details?.types?.includes(selectedType);
      });
    }

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
    
    if (filteredList.length > 0) {
      loadPokemonDetails(filteredList.slice(0, POKEMONS_PER_PAGE));
    } else {
      setCurrentPagePokemons([]);
    }
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

  const handlePokemonClick = (pokemonId) => {
    localStorage.setItem('pokedexState', JSON.stringify({
      search,
      selectedType,
      sortOrder,
      currentPage
    }));
    navigate(`/pokemon/${pokemonId}`);
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
              totalPages={totalPages}
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
    <Router basename="/PokeAPI-react">
      <Routes>
        <Route path="/" element={<PokedexPage />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;