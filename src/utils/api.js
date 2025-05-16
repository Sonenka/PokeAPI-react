const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

export const fetchPokemonList = async (limit = 10000) => {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE}/pokemon?limit=${limit}`);
    return data.results.map(pokemon => ({
      ...pokemon,
      id: parseInt(pokemon.url.split('/').filter(Boolean).pop()),
      types: []
    }));
  } catch (error) {
    console.error('Error fetching pokemon list:', error);
    throw error;
  }
};

export const fetchPokemonTypes = async () => {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE}/type`);
    return data.results.map(type => type.name);
  } catch (error) {
    console.error('Error fetching pokemon types:', error);
    return [];
  }
};

export const fetchPokemonDetails = async (id) => {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE}/pokemon/${id}`);
    return {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.other['official-artwork'].front_default,
      stats: data.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat
      }))
    };
  } catch (error) {
    console.error(`Error fetching details for pokemon ${id}:`, error);
    return null;
  }
};