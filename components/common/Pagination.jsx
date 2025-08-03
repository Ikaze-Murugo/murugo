// components/common/Pagination.jsx
"use client";

import { useState, useEffect } from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  showItemsPerPage = true,
  itemsPerPage = 10,
  onItemsPerPageChange = () => {},
  totalItems = 0,
  showInfo = true,
  showFirstLast = true,
  maxPageNumbers = 5,
  size = "medium", // "small", "medium", "large"
  className = "",
  disabled = false
}) {
  const [currentPageLocal, setCurrentPageLocal] = useState(currentPage);

  useEffect(() => {
    setCurrentPageLocal(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page === currentPageLocal || page < 1 || page > totalPages || disabled) {
      return;
    }
    setCurrentPageLocal(page);
    onPageChange(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (disabled) return;
    onItemsPerPageChange(newItemsPerPage);
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPageLocal - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    // Adjust start if we're near the end
    if (end - start < maxPageNumbers - 1) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPageLocal - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPageLocal * itemsPerPage, totalItems);

  // Size classes
  const sizeClasses = {
    small: "pagination-sm",
    medium: "",
    large: "pagination-lg"
  };

  if (totalPages <= 1) {
    return showInfo && totalItems > 0 ? (
      <div className={`pagination-info-only ${className}`}>
        <span className="text-muted">
          Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>
    ) : null;
  }

  return (
    <div className={`pagination-wrapper ${className}`}>
      <div className="row align-items-center">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <label className="form-label me-2 mb-0" style={{ whiteSpace: 'nowrap' }}>
                Items per page:
              </label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                disabled={disabled}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}

        {/* Page info */}
        {showInfo && (
          <div className="col-md-4 mb-3 mb-md-0 text-center">
            <span className="text-muted">
              Showing {startItem}-{endItem} of {totalItems} items
            </span>
          </div>
        )}

        {/* Pagination controls */}
        <div className={`${showItemsPerPage || showInfo ? 'col-md-4' : 'col-12'} d-flex justify-content-end`}>
          <nav aria-label="Page navigation">
            <ul className={`pagination mb-0 ${sizeClasses[size]}`}>
              {/* First page */}
              {showFirstLast && currentPageLocal > 1 && (
                <li className={`page-item ${disabled ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                    disabled={disabled}
                    aria-label="First page"
                  >
                    <i className="icon icon-angles-left"></i>
                  </button>
                </li>
              )}

              {/* Previous page */}
              <li className={`page-item ${currentPageLocal === 1 || disabled ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPageLocal - 1)}
                  disabled={currentPageLocal === 1 || disabled}
                  aria-label="Previous page"
                >
                  <i className="icon icon-angle-left"></i>
                </button>
              </li>

              {/* Page numbers with ellipsis */}
              {pageNumbers[0] > 1 && (
                <>
                  <li className={`page-item ${disabled ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                      disabled={disabled}
                    >
                      1
                    </button>
                  </li>
                  {pageNumbers[0] > 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                </>
              )}

              {/* Current page range */}
              {pageNumbers.map(page => (
                <li
                  key={page}
                  className={`page-item ${
                    page === currentPageLocal ? 'active' : ''
                  } ${disabled ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                    disabled={disabled}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPageLocal ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </li>
              ))}

              {/* End ellipsis and last page */}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  <li className={`page-item ${disabled ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={disabled}
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}

              {/* Next page */}
              <li className={`page-item ${currentPageLocal === totalPages || disabled ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPageLocal + 1)}
                  disabled={currentPageLocal === totalPages || disabled}
                  aria-label="Next page"
                >
                  <i className="icon icon-angle-right"></i>
                </button>
              </li>

              {/* Last page */}
              {showFirstLast && currentPageLocal < totalPages && (
                <li className={`page-item ${disabled ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={disabled}
                    aria-label="Last page"
                  >
                    <i className="icon icon-angles-right"></i>
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Simple pagination component for basic use cases
export function SimplePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  disabled = false,
  className = ""
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`simple-pagination ${className}`} aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 || disabled ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
          >
            Previous
          </button>
        </li>
        
        <li className="page-item active">
          <span className="page-link">
            {currentPage} of {totalPages}
          </span>
        </li>

        <li className={`page-item ${currentPage === totalPages || disabled ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

// Compact pagination for mobile
export function CompactPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  disabled = false,
  className = ""
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`compact-pagination ${className}`}>
      <div className="btn-group" role="group" aria-label="Page navigation">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
        >
          <i className="icon icon-angle-left"></i>
        </button>
        
        <button type="button" className="btn btn-outline-primary active" disabled>
          {currentPage} / {totalPages}
        </button>
        
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
        >
          <i className="icon icon-angle-right"></i>
        </button>
      </div>
    </div>
  );
}
