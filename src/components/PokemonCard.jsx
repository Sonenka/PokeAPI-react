import React from 'react';
// import './card.css';

const PokemonCard = ({ pokemon, onImageLoad, onClick }) => {
  if (!pokemon) return null;

  return (
    <div className="card" onClick={() => onClick(pokemon.id)}>
      <div className="card__id">#{pokemon.id.toString().padStart(4, '0')}</div>
      <div className="card__img">
        <img 
          src={pokemon.sprite} 
          alt={pokemon.name}
          onLoad={onImageLoad}
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