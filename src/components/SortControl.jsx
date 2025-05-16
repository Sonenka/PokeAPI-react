function SortControl({ sortOrder, onChange }) {
    return (
      <div className="dropdown">
        <div className="dropdown__label">Sort by:</div>
        <div className="dropdown__container">
          <select
            value={sortOrder}
            onChange={(e) => onChange(e.target.value)}
            className="dropdown__select"
          >
            <option className="dropdown__option" value="id-asc">ID (Ascending)</option>
            <option className="dropdown__option" value="id-desc">ID (Descending)</option>
            <option className="dropdown__option" value="name-asc">Name (A - Z)</option>
            <option className="dropdown__option" value="name-desc">Name (Z - A)</option>
          </select>
        </div>
      </div>
    );
  }
  
  export default SortControl;