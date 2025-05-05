import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center mt-8 space-x-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700"
      >
        Previous
      </button>

      <span className="text-lg font-semibold">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
