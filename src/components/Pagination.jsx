import React, { useState } from 'react';
// import './pagination.css';

const Pagination = ({ 
  total, 
  perPage, 
  currentPage, 
  totalPages,
  onPageChange 
}) => {
  const [inputPage, setInputPage] = useState(currentPage);

  const handleFirst = () => onPageChange(1);
  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLast = () => onPageChange(totalPages);
  
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    setInputPage(isNaN(value) ? '' : Math.max(1, Math.min(totalPages, value)));
  };

  const handleGoToPage = () => {
    if (inputPage >= 1 && inputPage <= totalPages) {
      onPageChange(inputPage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  return (
    <div className="pagination">
      {/* Desktop buttons - left side */}
      <div className="pagination__buttons-left">
        <button 
          className={`pagination__button button firstButton ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handleFirst}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button 
          className={`pagination__button button prevButton ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </div>

      {/* Mobile buttons */}
      <div className="pagination__buttons-mobile">
        <button 
          className={`pagination__button button button-mobile firstButton ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handleFirst}
          disabled={currentPage === 1}
        >
          &lt;&lt;
        </button>
        <button 
          className={`pagination__button button button-mobile prevButton ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <button 
          className={`pagination__button button button-mobile nextButton ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
        <button 
          className={`pagination__button button button-mobile lastButton ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleLast}
          disabled={currentPage === totalPages}
        >
          &gt;&gt;
        </button>
      </div>
      
      {/* Middle section with page info and input */}
      <div className="pagination__middle">
        <div className="pagination__counter">
          Page {currentPage} of {totalPages}
        </div>

        <div className="pagination__input">
          <input 
            type="number" 
            min="1" 
            max={totalPages}
            value={inputPage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="pagination__button button pagination__button--go"
            onClick={handleGoToPage}
          >
            Go
          </button>
        </div>
      </div>
      
      {/* Desktop buttons - right side */}
      <div className="pagination__buttons pagination__buttons-right">
        <button 
          className={`pagination__button button nextButton ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button 
          className={`pagination__button button lastButton ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleLast}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;