import React, { useState } from 'react';

const PokemonCard = ({ pokemon, onImageLoad }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!pokemon) return null;

  const handleLoad = () => {
    setImageLoaded(true);
    onImageLoad();
  };

  return (
    <div className="card">
      <div className="card__id">#{pokemon.id.toString().padStart(4, '0')}</div>
      <div className="card__img">
        {!imageLoaded && <div className="card__img-placeholder"></div>}
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          onLoad={handleLoad}
          onError={handleLoad} // В случае ошибки тоже считаем загрузку завершенной
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>
      <div className="card__name">
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </div>
      <div className="card__types">
        {pokemon.types.map(type => (
          <div key={type} className={`card__type ${type}`}>
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonCard;