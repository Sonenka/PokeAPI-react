import { useSearch } from '../contexts/SearchContext';

function SearchBar() {
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();

  return (
    <div className="search-container">
      <input
        className="search__input"
        type="text"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <span 
          className="search__clear" 
          onClick={clearSearch}
          role="button"
          aria-label="Clear search"
        >
          &#10006;
        </span>
      )}
    </div>
  );
}

export default SearchBar;