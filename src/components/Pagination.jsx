const Pagination = ({ total, perPage, currentPage, onPageChange }) => {
    const pageCount = Math.ceil(total / perPage);
  
    return (
      <div className="pagination">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            className={i + 1 === currentPage ? 'active' : ''}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };
  
  export default Pagination;
  