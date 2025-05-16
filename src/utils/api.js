export const fetchPokemonList = async (limit = 150) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();

  const detailed = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      const details = await res.json();
      return {
        name: details.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${details.id}.png`,
        types: details.types.map(t => t.type.name),
        id: details.id,
      };
    })
  );

  return detailed;
};

  
  export const fetchPokemonTypes = async () => {
    const res = await fetch(`https://pokeapi.co/api/v2/type`);
    const data = await res.json();
    return data.results.map(t => t.name);
  };
  