// hooks/usePagination.js
import { useState, useMemo, useCallback } from 'react';

export function usePagination({
  data = [],
  initialPage = 1,
  initialItemsPerPage = 10,
  onPageChange = () => {},
  onItemsPerPageChange = () => {}
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Page change handler
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Items per page change handler
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newCurrentPage);
    onItemsPerPageChange(newItemsPerPage);
    
    if (newCurrentPage !== currentPage) {
      onPageChange(newCurrentPage);
    }
  }, [currentPage, totalItems, onItemsPerPageChange, onPageChange]);

  // Reset pagination when data changes
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    onPageChange(1);
  }, [onPageChange]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    handlePageChange(page);
  }, [handlePageChange]);

  // Navigate functions
  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [handlePageChange, currentPage]);

  const goToPreviousPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [handlePageChange, currentPage]);

  // Pagination info
  const paginationInfo = useMemo(() => ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, totalItems),
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  }), [currentPage, totalPages, itemsPerPage, totalItems, startIndex, endIndex]);

  return {
    // Current state
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    currentData,
    
    // Handlers
    handlePageChange,
    handleItemsPerPageChange,
    
    // Navigation functions
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    
    // Pagination info
    paginationInfo,
    
    // Convenience properties
    hasNextPage: paginationInfo.hasNextPage,
    hasPreviousPage: paginationInfo.hasPreviousPage,
    isFirstPage: paginationInfo.isFirstPage,
    isLastPage: paginationInfo.isLastPage
  };
}

// Hook for server-side pagination
export function useServerPagination({
  initialPage = 1,
  initialItemsPerPage = 10,
  totalItems = 0,
  onPageChange = () => {},
  onItemsPerPageChange = () => {}
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(newCurrentPage);
    onItemsPerPageChange(newItemsPerPage);
    
    if (newCurrentPage !== currentPage) {
      onPageChange(newCurrentPage);
    }
  }, [currentPage, totalItems, onItemsPerPageChange, onPageChange]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    onPageChange(1);
  }, [onPageChange]);

  const paginationInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [currentPage, totalPages, itemsPerPage, totalItems]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    paginationInfo,
    hasNextPage: paginationInfo.hasNextPage,
    hasPreviousPage: paginationInfo.hasPreviousPage,
    isFirstPage: paginationInfo.isFirstPage,
    isLastPage: paginationInfo.isLastPage
  };
}

// Hook for infinite scroll pagination
export function useInfiniteScroll({
  data = [],
  itemsPerPage = 10,
  onLoadMore = () => {},
  hasMore = true,
  loading = false
}) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);

  const currentData = data.slice(0, displayCount);
  const canLoadMore = hasMore && displayCount < data.length;

  const loadMore = useCallback(() => {
    if (!loading && canLoadMore) {
      setDisplayCount(prev => prev + itemsPerPage);
      onLoadMore();
    }
  }, [loading, canLoadMore, itemsPerPage, onLoadMore]);

  const reset = useCallback(() => {
    setDisplayCount(itemsPerPage);
  }, [itemsPerPage]);

  return {
    currentData,
    displayCount,
    canLoadMore,
    loadMore,
    reset,
    hasMore: canLoadMore || hasMore
  };
}
