import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPokemonDetails, fetchPokemonSpeciesData } from '../utils/api';
import '../styles/details.css';
import '../styles/variables.css';
import useLoader from '../state/useLoader';

// Константы
const FALLBACK_COLOR = 'blue';
const FALLBACK_TEXT = "No description available.";
const MAX_STATS_VALUES = {
  hp: 255,
  attack: 190,
  defense: 230,
  'special-attack': 194,
  'special-defense': 230,
  speed: 200
};

const PokemonDetails = () => {
  const { LoaderComponent, toggleLoader } = useLoader();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
        toggleLoader(true); 
      try {
        setIsLoading(true);
        setError(null);
        
        // Параллельная загрузка данных
        const [pokemonData, speciesData] = await Promise.all([
          fetchPokemonDetails(id),
          fetchPokemonSpeciesData(id)
        ]);

        if (!pokemonData || !speciesData) {
          throw new Error('Failed to load Pokémon data');
        }
        // Объединение данных из двух источников
        const combinedData = {
          ...pokemonData,
          height: pokemonData.height || 0,
          weight: pokemonData.weight || 0,
          abilities: pokemonData.abilities.map(ability => ({
            ability: { name: ability.name },
            is_hidden: ability.is_hidden || false
          })) || [],
          // Дополнительные данные из species если нужно
          color: speciesData.color?.name || FALLBACK_COLOR,
          flavor_text_entries: speciesData.flavor_text_entries || []
        };

        setPokemon(combinedData);
        setSpecies(speciesData);
      } catch (err) {
        console.error("Failed to load Pokémon:", err);
        setError(err.message || 'Failed to load Pokémon data');
      } finally {
        setIsLoading(false);
        toggleLoader(false);
      }
    };

    loadData();
  }, [id]);

  // Функция для осветления цвета
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const clamp = (value) => Math.max(0, Math.min(255, value));
    const R = clamp((num >> 16) + amt);
    const G = clamp((num >> 8 & 0x00FF) + amt);
    const B = clamp((num & 0x0000FF) + amt);
    return `#${(R << 16 | G << 8 | B).toString(16).padStart(6, '0')}`;
  };

  // Цвета покемонов
  const getPokemonColor = (colorName) => {
    const colorMap = {
      black: '#303030',
      blue: '#429BED',
      brown: '#B1736C',
      gray: '#A0A2A0',
      green: '#64D368',
      pink: '#F85888',
      purple: '#7C538C',
      red: '#FA6555',
      white: '#a38f7e',
      yellow: '#F6C747'
    };
    return colorMap[colorName] || '#68A090';
  };

  // Получение описания
  const getFlavorText = (speciesData) => {
    const englishEntries = speciesData?.flavor_text_entries?.filter(
      entry => entry.language?.name === 'en'
    );
    if (!englishEntries?.length) return null;
    const latestEntry = englishEntries[englishEntries.length - 1];
    return latestEntry.flavor_text
      .replace(/\n/g, ' ')
      .replace(/\f/g, ' ');
  };

  if (isLoading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!pokemon) return <div className="error-message">Pokémon not found</div>;

  const mainColor = getPokemonColor(species?.color?.name || FALLBACK_COLOR);
  const darkerColor = lightenColor(mainColor, -50);
  const flavorText = getFlavorText(species) || FALLBACK_TEXT;

  // URL изображения с fallback
  const imgUrl = pokemon.sprite || 
               `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  return (
    <>
    <LoaderComponent />
    <div className="page" style={{
      background: `linear-gradient(135deg, ${mainColor} 0%, ${lightenColor(mainColor, 30)} 100%)`
    }}>
      <div className="details">
        <div className="details__header">
          <button className="details__back-button" onClick={() => navigate(-1)}>
            <img className="details__back-img" src="../src/assets/img/backArrow.svg" alt="" />
          </button>
          <h1 className="details__title darker">
            {(pokemon.name || '').charAt(0).toUpperCase() + (pokemon.name || '').slice(1)}
          </h1>
          <div className="details__id darker">
            #{String(pokemon.id).padStart(4, '0')}
          </div>
        </div>
        
        <div className="details__main">
          <div className="details__image-container">
            <img 
              className="details__image" 
              src={imgUrl} 
              alt={pokemon.name}
              onError={(e) => {
                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
              }}
            />
            <div className="details__types">
              {pokemon.types?.map((type, index) => (
                <div key={index} className={`card__type ${type}`}>
                  {type?.charAt(0).toUpperCase() + type?.slice(1)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="details__info">
            <div className="details__section">
              <h2 className="details__subtitle">General Info</h2>
              <div className="details__grid">
                <div className="details__label darker">Height:</div>
                <div className="details__value darker">
                  {pokemon.height ? `${(pokemon.height / 10).toFixed(1)} m` : "Unknown"}
                </div>
                <div className="details__label darker">Weight:</div>
                <div className="details__value darker">
                  {pokemon.weight ? `${(pokemon.weight / 10).toFixed(1)} kg` : "Unknown"}
                </div>
              </div>
            </div>

            <div className="details__section">
              <h2 className="details__subtitle">Flavor</h2>
              <div className="details__flavor-text darker">
                {flavorText}
              </div>
            </div>
            
            <div className="details__section">
              <h2 className="details__subtitle">Stats</h2>
              <div className="details__stats">
                {pokemon.stats?.map((stat, index) => {
                  const statName = stat.name;
                  const baseStat = stat.value;
                  const maxStatValue = MAX_STATS_VALUES[statName] || 100;
                  const percentage = Math.min(100, (baseStat / maxStatValue) * 100);
                  
                  return (
                    <div key={index} className="details__stat darker">
                      <div className="details__stat-name">
                        {statName?.replace('-', ' ')}
                      </div>
                      <div className="details__stat-bar-container">
                        <div 
                          className="details__stat-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: darkerColor
                          }}
                        ></div>
                        <div className="details__stat-value">{baseStat}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="details__section">
              <h2 className="details__subtitle">Abilities</h2>
              <div className="details__abilities">
                {pokemon.abilities?.map((ability, index) => (
                  <div key={index} className="details__ability darker">
                    {ability.ability?.name?.replace('-', ' ').charAt(0).toUpperCase() + 
                     ability.ability?.name?.replace('-', ' ').slice(1)}
                    {ability.is_hidden && (
                      <span className="details__ability--hidden"> (hidden)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PokemonDetails;