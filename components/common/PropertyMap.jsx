// components/common/PropertyMap.jsx
"use client";
import {
  GoogleMap,
  OverlayView,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProperties, transformPropertyData } from "@/utils/propertyQueries";
import FavoriteButton from "./FavoriteButton";

const option = {
  zoomControl: true,
  disableDefaultUI: true,
  scrollwheel: false,
  styles: [
    // ... (existing map styles)
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }],
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }],
    },
    // ... (rest of styles)
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c8d7d4" }],
    },
  ],
};

export default function PropertyMap({ 
  properties = [], 
  center = null, 
  zoom = 10,
  height = "600px",
  showControls = true 
}) {
  const [getLocation, setLocation] = useState(null);
  const [mapProperties, setMapProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "your-api-key-here",
  });

  // Load properties if not provided as props
  useEffect(() => {
    const loadProperties = async () => {
      if (properties.length > 0) {
        // Use provided properties
        setMapProperties(properties.filter(p => p.lat && p.long));
        setLoading(false);
        return;
      }

      // Fetch all properties if none provided
      try {
        setLoading(true);
        const supabaseProperties = await getAllProperties();
        const transformedProperties = supabaseProperties.map(transformPropertyData);
        const validProperties = transformedProperties.filter(p => p.lat && p.long);
        setMapProperties(validProperties);
      } catch (err) {
        console.error("Error loading properties for map:", err);
        setError("Failed to load properties for map");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [properties]);

  // Calculate center based on properties if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    
    if (mapProperties.length === 0) {
      return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    }

    if (mapProperties.length === 1) {
      return { 
        lat: parseFloat(mapProperties[0].lat), 
        lng: parseFloat(mapProperties[0].long) 
      };
    }

    // Calculate center of all properties
    const avgLat = mapProperties.reduce((sum, p) => sum + parseFloat(p.lat), 0) / mapProperties.length;
    const avgLng = mapProperties.reduce((sum, p) => sum + parseFloat(p.long), 0) / mapProperties.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [mapProperties, center]);

  const CustomMarker = ({ elm }) => {
    return (
      <div className="marker-container" onClick={() => setLocation(elm)}>
        <div className="marker-card">
          <div className="front face">
            <div className="price-tag">
              ${elm.price ? elm.price.toLocaleString() : 'N/A'}
            </div>
          </div>
          <div className="back face">
            <div className="price-tag">
              ${elm.price ? elm.price.toLocaleString() : 'N/A'}
            </div>
          </div>
          <div className="marker-arrow" />
        </div>
      </div>
    );
  };

  const closeCardHandler = () => {
    setLocation(null);
  };

  if (error) {
    return (
      <div className="map-error" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Error loading map: {error}</p>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="map-loading" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading map...</span>
        </div>
      </div>
    );
  }

  const mapContainerStyleDynamic = {
    width: "100%",
    height: height,
  };

  const mapOptions = {
    ...option,
    zoomControl: showControls,
    disableDefaultUI: !showControls,
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyleDynamic}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
      >
        {mapProperties.map((marker, i) => (
          <OverlayView
            key={marker.id || i}
            position={{
              lat: parseFloat(marker.lat),
              lng: parseFloat(marker.long),
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CustomMarker elm={marker} />
          </OverlayView>
        ))}
        {getLocation !== null && (
          <InfoWindow
            position={{
              lat: parseFloat(getLocation.lat),
              lng: parseFloat(getLocation.long),
            }}
            onCloseClick={closeCardHandler}
          >
            <div className="map-box">
              <div className="map-listing-item">
                <div className="inner-box">
                  <div className="image-box">
                    <Image
                      src={getLocation.imgSrc || "/images/home/house-1.jpg"}
                      alt={getLocation.title}
                      width={300}
                      height={200}
                    />
                    <div className="favorite-wrapper">
                      <FavoriteButton
                        propertyId={getLocation.id}
                        size="small"
                        className="map-favorite-btn"
                      />
                    </div>
                  </div>
                  <div className="content">
                    <p className="location">
                      <span className="icon icon-mapPin" />
                      <span className="text">{getLocation.address}</span>
                    </p>
                    <div className="title">
                      <Link href={`/property-details-v1/${getLocation.id}`}>
                        {getLocation.title}
                      </Link>
                    </div>
                    <ul className="list-info">
                      <li>
                        <span className="icon icon-bed" />
                        <span className="text-variant-1">Beds:</span>
                        <span className="fw-6">{getLocation.beds || 'N/A'}</span>
                      </li>
                      <li>
                        <span className="icon icon-bath" />
                        <span className="text-variant-1">Baths:</span>
                        <span className="fw-6">{getLocation.baths || 'N/A'}</span>
                      </li>
                      <li>
                        <span className="icon icon-sqft" />
                        <span className="text-variant-1">Sqft:</span>
                        <span className="fw-6">{getLocation.sqft || 'N/A'}</span>
                      </li>
                    </ul>
                    <div className="box-bottom">
                      <div className="avt-box">
                        <Image
                          src={getLocation.agent_info?.avatar_url || "/images/avatar/avt-2.jpg"}
                          width={34}
                          height={34}
                          alt="agent"
                        />
                        <span>{getLocation.agent_info?.name || 'Agent'}</span>
                      </div>
                      <div className="price">
                        ${getLocation.price ? getLocation.price.toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
}
