function SearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <input
        className="search__input"
        type="text"
        placeholder="Search Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)
        }
      />
      <span className="search__clear" id="search__clear">&#10006;</span>
    </div>
  );
}

export default SearchBar;