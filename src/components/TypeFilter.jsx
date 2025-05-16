function TypeFilter({ types, selectedType, onChange }) {
    return (
      <div className="dropdown">
        <div className="dropdown__label">Filter by Type:</div>
        <div className="dropdown__container">
          <select
            value={selectedType}
            onChange={(e) => onChange(e.target.value)}
            className="dropdown__select"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  
  export default TypeFilter;