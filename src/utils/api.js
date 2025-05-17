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
    console.log('Raw abilities data:', data.abilities); // Первый лог
    
    // Безопасная обработка способностей
    const processedAbilities = (data.abilities || []).map(ability => {
      // Проверяем всю цепочку вложенности
      const abilityName = ability?.ability?.name;
      console.log('2 Processing ability:', ability); // Второй лог
      
      if (!abilityName) {
        console.warn('Invalid ability structure:', ability);
        return {
          name: 'unknown-ability',
          is_hidden: ability?.is_hidden || false,
          _debug: ability
        };
      }

      return {
        name: abilityName,
        is_hidden: ability.is_hidden || false,
        _original: ability
      };
    });

    console.log('3 Processed abilities:', processedAbilities); // Третий лог
    
    return {
      id: data.id,
      name: data.name,
      types: data.types?.map(t => t?.type?.name) || [],
      height: data.height || 0,
      weight: data.weight || 0,
      sprite: data.sprites?.other?.home?.front_default || 
             `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
      stats: data.stats?.map(stat => ({
        name: stat?.stat?.name || 'unknown-stat',
        value: stat?.base_stat || 0
      })) || [],
      abilities: processedAbilities,
      _originalData: data // Сохраняем оригинальные данные для отладки
    };
  } catch (error) {
    console.error(`Error fetching details for pokemon ${id}:`, error);
    return null;
  }
};

export const fetchPokemonSpeciesData = async (id) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch Pokemon species data for ID ${id}:`, error);
    return { color: { name: 'blue' } }; // Fallback color
  }
};