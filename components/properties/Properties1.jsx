// components/properties/Properties1.jsx
"use client";
import React, { useEffect, useReducer, useRef, useState } from "react";
import PropertyMap from "../common/PropertyMap";
import AdvanceSearch from "../common/AdvanceSearch2";
import DropdownSelect from "../common/DropdownSelect";
import Link from "next/link";
import Image from "next/image";
import DropdownSelect2 from "../common/DropdownSelect2";
import { getAllProperties, transformPropertyData } from "@/utils/propertyQueries";
import { initialState, reducer } from "@/context/propertyFilterReducer";
import FavoriteButton from "../common/FavoriteButton";

export default function Properties1() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ddContainer = useRef();

  const {
    price,
    size,
    rooms,
    bedrooms,
    bathrooms,
    type,
    features,
    filtered,
    sortingOption,
    sorted,
    currentPage,
    itemPerPage,
  } = state;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllProperties();
      if (error) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error in fetchProperties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ddContainer.current && !ddContainer.current.contains(event.target)) {
        ddContainer.current?.classList.remove("show");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearFilter = () => {
    dispatch({ type: "CLEAR_FILTER" });
  };

  useEffect(() => {
    let filteredArrays = [];

    if (features.length) {
      const filteredByFeatures = [...properties].filter((elm) =>
        elm.features?.some((feature) => features.includes(feature))
      );
      filteredArrays.push(filteredByFeatures);
    }

    if (type !== "all") {
      const filteredByType = [...properties].filter((elm) => elm.property_type === type);
      filteredArrays.push(filteredByType);
    }

    if (price !== "all") {
      const filteredByPrice = [...properties].filter((elm) => {
        const propertyPrice = elm.price;
        switch (price) {
          case "0-100000":
            return propertyPrice >= 0 && propertyPrice <= 100000;
          case "100000-200000":
            return propertyPrice >= 100000 && propertyPrice <= 200000;
          case "200000-300000":
            return propertyPrice >= 200000 && propertyPrice <= 300000;
          case "300000-400000":
            return propertyPrice >= 300000 && propertyPrice <= 400000;
          case "400000-500000":
            return propertyPrice >= 400000 && propertyPrice <= 500000;
          case "500000+":
            return propertyPrice >= 500000;
          default:
            return true;
        }
      });
      filteredArrays.push(filteredByPrice);
    }

    if (size !== "all") {
      const filteredBySize = [...properties].filter((elm) => {
        const propertySize = elm.sqft;
        switch (size) {
          case "0-500":
            return propertySize >= 0 && propertySize <= 500;
          case "500-1000":
            return propertySize >= 500 && propertySize <= 1000;
          case "1000-1500":
            return propertySize >= 1000 && propertySize <= 1500;
          case "1500-2000":
            return propertySize >= 1500 && propertySize <= 2000;
          case "2000+":
            return propertySize >= 2000;
          default:
            return true;
        }
      });
      filteredArrays.push(filteredBySize);
    }

    if (rooms !== "all") {
      const filteredByRooms = [...properties].filter((elm) => {
        const propertyRooms = elm.beds;
        switch (rooms) {
          case "1":
            return propertyRooms === 1;
          case "2":
            return propertyRooms === 2;
          case "3":
            return propertyRooms === 3;
          case "4":
            return propertyRooms === 4;
          case "5+":
            return propertyRooms >= 5;
          default:
            return true;
        }
      });
      filteredArrays.push(filteredByRooms);
    }

    if (bedrooms !== "all") {
      const filteredByBedrooms = [...properties].filter((elm) => {
        const propertyBedrooms = elm.beds;
        switch (bedrooms) {
          case "1":
            return propertyBedrooms === 1;
          case "2":
            return propertyBedrooms === 2;
          case "3":
            return propertyBedrooms === 3;
          case "4":
            return propertyBedrooms === 4;
          case "5+":
            return propertyBedrooms >= 5;
          default:
            return true;
        }
      });
      filteredArrays.push(filteredByBedrooms);
    }

    if (bathrooms !== "all") {
      const filteredByBathrooms = [...properties].filter((elm) => {
        const propertyBathrooms = elm.baths;
        switch (bathrooms) {
          case "1":
            return propertyBathrooms === 1;
          case "2":
            return propertyBathrooms === 2;
          case "3":
            return propertyBathrooms === 3;
          case "4":
            return propertyBathrooms === 4;
          case "5+":
            return propertyBathrooms >= 5;
          default:
            return true;
        }
      });
      filteredArrays.push(filteredByBathrooms);
    }

    if (filteredArrays.length > 0) {
      const commonElements = filteredArrays.reduce((acc, arr) =>
        acc.filter((item) => arr.includes(item))
      );
      dispatch({ type: "SET_FILTERED", payload: commonElements });
    } else {
      dispatch({ type: "SET_FILTERED", payload: properties });
    }
  }, [properties, features, type, price, size, rooms, bedrooms, bathrooms]);

  return (
    <>
      {/* Search Section */}
      <section className="flat-filter-search-v2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="wrap-filter-search">
                <div className="row">
                  <div className="col-lg-3 col-md-6">
                    <div className="form-group">
                      <label>Property Type</label>
                      <DropdownSelect
                        options={["All", "House", "Apartment", "Condo", "Townhouse"]}
                        value={type}
                        onChange={(value) => dispatch({ type: "SET_TYPE", payload: value })}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="form-group">
                      <label>Price Range</label>
                      <DropdownSelect
                        options={["All", "0-100000", "100000-200000", "200000-300000", "300000-400000", "400000-500000", "500000+"]}
                        value={price}
                        onChange={(value) => dispatch({ type: "SET_PRICE", payload: value })}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="form-group">
                      <label>Size</label>
                      <DropdownSelect
                        options={["All", "0-500", "500-1000", "1000-1500", "1500-2000", "2000+"]}
                        value={size}
                        onChange={(value) => dispatch({ type: "SET_SIZE", payload: value })}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="form-group">
                      <label>Bedrooms</label>
                      <DropdownSelect
                        options={["All", "1", "2", "3", "4", "5+"]}
                        value={bedrooms}
                        onChange={(value) => dispatch({ type: "SET_BEDROOMS", payload: value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <button
                      className="btn btn-primary"
                      onClick={clearFilter}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Properties Section */}
      <section className="wrapper-layout layout-2">
        <div className="wrap-left">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="wrap-filter-search">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>Sort By</label>
                        <DropdownSelect2
                          options={["Newest", "Price: Low to High", "Price: High to Low", "Size: Low to High", "Size: High to Low"]}
                          value={sortingOption}
                          onChange={(value) => dispatch({ type: "SET_SORTING_OPTION", payload: value })}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>View</label>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary active"
                            onClick={() => dispatch({ type: "SET_VIEW", payload: "grid" })}
                          >
                            Grid
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => dispatch({ type: "SET_VIEW", payload: "list" })}
                          >
                            List
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid Layout */}
          <div className="row">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="col-12 text-center py-5">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            ) : sorted.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p>No properties found matching your criteria.</p>
              </div>
            ) : (
              sorted
                .slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage)
                .map((elm, i) => (
                  <div key={i} className="col-md-6">
                    <div className="homelengo-box">
                      <div className="archive-top">
                        <Link href={`/property-details-v1/${elm.id}`} className="images-group">
                          <div className="images-style">
                            <Image
                              className="lazyload"
                              alt="img"
                              src={elm.imgSrc}
                              width={615}
                              height={405}
                            />
                          </div>
                          <div className="top">
                            <ul className="d-flex gap-6">
                              {elm.tags?.map((tag, index) => (
                                <li key={index} className={`flag-tag ${tag === 'Featured' ? 'primary' : 'style-1'}`}>
                                  {tag}
                                </li>
                              ))}
                            </ul>
                            <div className="favorite-btn-wrapper">
                              <FavoriteButton 
                                propertyId={elm.id} 
                                size="medium"
                                className="position-absolute top-0 end-0 m-2"
                              />
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="archive-content">
                        <div className="content-top">
                          <div className="content-left">
                            <h3>
                              <Link href={`/property-details-v1/${elm.id}`}>
                                {elm.title}
                              </Link>
                            </h3>
                            <p className="address">{elm.address}</p>
                          </div>
                          <div className="content-right">
                            <div className="price">${elm.price?.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="content-bottom">
                          <div className="content-left">
                            <ul className="d-flex gap-6">
                              <li>
                                <i className="icon icon-bed"></i>
                                {elm.beds} Beds
                              </li>
                              <li>
                                <i className="icon icon-bath"></i>
                                {elm.baths} Baths
                              </li>
                              <li>
                                <i className="icon icon-square"></i>
                                {elm.sqft} sqft
                              </li>
                            </ul>
                          </div>
                          <div className="content-right">
                            <Link href={`/property-details-v1/${elm.id}`} className="btn btn-primary">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          {/* Basic Pagination */}
          {sorted.length > 0 && (
            <div className="col-12">
              <div className="pagination-wrapper mt-4">
                <nav aria-label="Properties pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => dispatch({ type: "SET_CURRENT_PAGE", payload: currentPage - 1 })}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.ceil(sorted.length / itemPerPage) }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => dispatch({ type: "SET_CURRENT_PAGE", payload: page })}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === Math.ceil(sorted.length / itemPerPage) ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => dispatch({ type: "SET_CURRENT_PAGE", payload: currentPage + 1 })}
                        disabled={currentPage === Math.ceil(sorted.length / itemPerPage)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
        
        {/* Map Section */}
        <div className="wrap-right">
          <div id="map" className="top-map">
            <PropertyMap />
          </div>
        </div>
      </section>
    </>
  );
}
