const PokemonCard = ({ pokemon }) => {
    return (
      <div className="card" data-id={pokemon.id}>
        <div className="card__id">#{String(pokemon.id).padStart(4, '0')}</div>
        <div className="card__img">
          <img src={pokemon.image} alt={pokemon.name}/>
        </div>
        <div className="card__name">{pokemon.name}</div>
        <div className="card__types">
          {pokemon.types.map((type) => (
            <div key={type} className={`card__type ${type}`}>
              {/* <img src={getTypeIcon(type)} alt={type} title={type} /> */}
              <div>{type}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default PokemonCard;
  