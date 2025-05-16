import React from 'react';
// import './styles/loader.css';

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader__spinner"></div>
      <div className="loader__text">Loading...</div>
    </div>
  );
};

export default Loader;