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

export const fetchPokemonList = async () => {
  try {
    // Сначала получаем общее количество покемонов
    const initialData = await fetchWithRetry(`${POKEAPI_BASE}/pokemon?limit=1`);
    const totalCount = initialData.count;
    
    // Затем загружаем все покемоны (но фильтруем только ID ≤ 2000)
    const allData = await fetchWithRetry(`${POKEAPI_BASE}/pokemon?limit=${totalCount}`);
    
    // Фильтруем только покемонов с ID ≤ 2000
    return allData.results
      .map(pokemon => {
        const id = parseInt(pokemon.url.split('/').filter(Boolean).pop());
        return {
          ...pokemon,
          id,
          types: []
        };
      })
      .filter(pokemon => pokemon.id <= 2000);
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
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
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