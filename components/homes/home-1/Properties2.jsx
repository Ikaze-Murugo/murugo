"use client";
import Image from "next/image";
import Link from "next/link";
import { properties2 as dummyProperties2 } from "@/data/properties";
import { getAllProperties } from "@/utils/propertyQueries";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useEffect, useState } from "react";

export default function Properties2() {
  const [properties, setProperties] = useState(dummyProperties2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching all properties for Properties2...');
      
      const { data, error } = await getAllProperties({ limit: 8 });
      
      console.log('Properties2 response:', { data, error });
      
      if (error) {
        console.error('Error fetching properties for Properties2:', error);
        setError(error.message || 'Failed to load properties');
        // Keep using dummy data
        setProperties(dummyProperties2);
      } else if (!data || data.length === 0) {
        console.log('No properties found in database for Properties2, using dummy data');
        setProperties(dummyProperties2);
      } else {
        console.log('Properties2 loaded from database:', data.length);
        // Transform database properties to match the expected format
        const transformedProperties = data.map(property => ({
          id: property.id,
          imgSrc: property.images?.[0]?.url || "/images/home/house-1.jpg",
          alt: property.title || "Property",
          address: property.address || "Address not available",
          title: property.title || "Property",
          beds: property.bedrooms || 0,
          rooms: property.total_rooms || 0,
          baths: property.bathrooms || 0,
          sqft: property.square_feet || 0,
          tags: property.status === 'featured' ? ["Featured"] : [],
          avatar: property.owner?.avatar_url || "/images/avatar/avt-png1.png",
          agent: property.owner?.name || "Agent",
          price: property.price || 0,
          filterOptions: [property.property_type || "House"],
          type: [property.property_type || "House"],
          features: property.amenities?.map(a => a.amenity?.name) || []
        }));
        
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error('Error in fetchProperties for Properties2:', error);
      setError(error.message || 'Failed to load properties');
      // Keep using dummy data
      setProperties(dummyProperties2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flat-section">
      <div className="container">
        <div className="box-title">
          <div className="text-center wow fadeInUp">
            <div className="text-subtitle text-primary">Top Properties</div>
            <h3 className="title mt-4">Best Property Value</h3>
            {loading && (
              <div className="text-center mt-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <small className="text-muted">Loading from database...</small>
              </div>
            )}
            {error && (
              <div className="text-center mt-3">
                <small className="text-danger">Using demo data (database not available locally)</small>
              </div>
            )}
          </div>
        </div>
        <div className="swiper tf-sw-mobile non-swiper-on-767">
          <div className="tf-layout-mobile-md xl-col-3 md-col-2 swiper-wrapper">
            {properties.map((property, index) => (
              <div key={index} className="swiper-slide">
                <div className="homelengo-box">
                  <div className="archive-top">
                    <Link
                      href={`/property-details-v1/${property.id}`}
                      className="images-group"
                    >
                      <div className="images-style">
                        <Image
                          className="lazyload"
                          data-src={property.imgSrc}
                          alt={property.alt}
                          src={property.imgSrc}
                          width={615}
                          height={405}
                        />
                      </div>
                      <div className="top">
                        <ul className="d-flex gap-6">
                          {property.tags.map((tag, tagIndex) => (
                            <li key={tagIndex} className="flag-tag primary">{tag}</li>
                          ))}
                          <li className="flag-tag style-1">For Sale</li>
                        </ul>
                      </div>
                      <div className="bottom">
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M10 7C10 7.53043 9.78929 8.03914 9.41421 8.41421C9.03914 8.78929 8.53043 9 8 9C7.46957 9 6.96086 8.78929 6.58579 8.41421C6.21071 8.03914 6 7.53043 6 7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7Z"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13 7C13 11.7613 8 14.5 8 14.5C8 14.5 3 11.7613 3 7C3 5.67392 3.52678 4.40215 4.46447 3.46447C5.40215 2.52678 6.67392 2 8 2C9.32608 2 10.5979 2.52678 11.5355 3.46447C12.4732 4.40215 13 5.67392 13 7Z"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {property.address}
                      </div>
                    </Link>
                  </div>
                  <div className="archive-bottom">
                    <div className="content-top">
                      <h6 className="text-capitalize">
                        <Link
                          href={`/property-details-v1/${property.id}`}
                          className="link"
                        >
                          {property.title}
                        </Link>
                      </h6>
                      <ul className="meta-list">
                        <li className="item">
                          <i className="icon icon-bed" />
                          <span className="text-variant-1">Beds:</span>
                          <span className="fw-6">{property.beds}</span>
                        </li>
                        <li className="item">
                          <i className="icon icon-bath" />
                          <span className="text-variant-1">Baths:</span>
                          <span className="fw-6">{property.baths}</span>
                        </li>
                        <li className="item">
                          <i className="icon icon-sqft" />
                          <span className="text-variant-1">Sqft:</span>
                          <span className="fw-6">{property.sqft}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="content-bottom">
                      <div className="d-flex gap-8 align-items-center">
                        <div className="avatar avt-40 round">
                          <Image
                            alt="avt"
                            src={property.avatar}
                            width={34}
                            height={34}
                          />
                        </div>
                        <span>{property.agent}</span>
                      </div>
                      <h6 className="price">${property.price.toLocaleString()}</h6>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
