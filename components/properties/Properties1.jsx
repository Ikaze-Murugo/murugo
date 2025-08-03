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
  // ... (existing state and effect logic)
  
  return (
    <>
      {/* Search Section */}
      <section className="flat-filter-search-v2">
        {/* ... (existing search form) */}
      </section>
      
      {/* Properties Section */}
      <section className="wrapper-layout layout-2">
        <div className="wrap-left">
          {/* ... (existing layout) */}
          
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
                          {/* ... (rest of property card) */}
                        </Link>
                      </div>
                      {/* ... (property details) */}
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
