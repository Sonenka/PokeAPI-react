import SearchBar from './SearchBar';
import TypeFilter from './TypeFilter';
import SortControl from './SortControl';

function Header({
  searchValue,
  onSearchChange,
  types,
  selectedType,
  onTypeChange,
  sortOrder,
  onSortChange
}) {
  return (
    <header className="search">
      <div className="search-container">
        <SearchBar 
          value={searchValue} 
          onChange={onSearchChange} 
        />
      </div>
      
      
      <TypeFilter
        types={types}
        selectedType={selectedType}
        onChange={onTypeChange}
      />
      
      <SortControl
        sortOrder={sortOrder}
        onChange={onSortChange}
      />
      
    </header>
  );
}

export default Header;