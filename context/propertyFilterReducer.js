// context/propertyFilterReducer.js
export const initialState = {
  price: [1800, 5500],
  size: [800, 2200],
  rooms: "All",
  bedrooms: "All",
  bathrooms: "All",
  type: "All",
  features: [],
  filtered: [],
  sortingOption: "Sort by (Default)",
  sorted: [],
  currentPage: 1,
  itemPerPage: 6,
  loading: false,
  error: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_SIZE":
      return { ...state, size: action.payload };
    case "SET_ROOMS":
      return { ...state, rooms: action.payload };
    case "SET_BEDROOMS":
      return { ...state, bedrooms: action.payload };
    case "SET_BATHROOMS":
      return { ...state, bathrooms: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_FEATURES":
      return { ...state, features: action.payload };
    case "SET_FILTERED":
      return { ...state, filtered: [...action.payload] };
    case "SET_SORTING_OPTION":
      return { ...state, sortingOption: action.payload };
    case "SET_SORTED":
      return { ...state, sorted: [...action.payload] };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_ITEM_PER_PAGE":
      return { ...state, itemPerPage: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PROPERTIES":
      return { 
        ...state, 
        filtered: [...action.payload], 
        sorted: [...action.payload],
        loading: false,
        error: null 
      };
    case "CLEAR_FILTER":
      return {
        ...state,
        price: [1800, 5500],
        size: [800, 2200],
        rooms: "All",
        bedrooms: "All",
        bathrooms: "All",
        type: "All",
        features: [],
      };
    default:
      return state;
  }
}
