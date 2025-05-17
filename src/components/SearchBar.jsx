function SearchBar({ value, onChange }) {
  const handleClear = () => {
    onChange(''); // Очищаем значение поиска
  };

  return (
    <div className="search-container">
      <input
        className="search__input"
        type="text"
        placeholder="Search Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && ( // Показываем крестик только если есть текст
        <span 
          className="search__clear" 
          onClick={handleClear}
        >
          &#10006;
        </span>
      )}
    </div>
  );
}

export default SearchBar;