import React from 'react';
// import './styles/error.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      <button 
        className="retry-button" 
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorMessage;