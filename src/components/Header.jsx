import TypeFilter from './TypeFilter';
import SortControl from './SortControl';
import SearchBar from './SearchBar';

function Header({
  types,
  selectedType,
  onTypeChange,
  sortOrder,
  onSortChange
}) {
  return (
    <header className="search">
      <SearchBar /> {/* Поиск теперь управляется через контекст */}
      
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