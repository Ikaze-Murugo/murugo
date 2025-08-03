// components/common/FavoriteButton.jsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/utils/favoritesQueries';

export default function FavoriteButton({ 
  propertyId, 
  size = "medium", 
  showTooltip = true,
  className = "",
  onFavoriteChange = () => {}
}) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if property is favorited when component mounts or user changes
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (user && propertyId) {
        const { isFavorite: favStatus } = await isFavorite(user.id, propertyId);
        setIsFav(favStatus);
      } else {
        setIsFav(false);
      }
    }

    checkFavoriteStatus();
  }, [user, propertyId]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If user is not logged in, show login prompt
    if (!user) {
      setShowLoginPrompt(true);
      // Trigger login modal
      const loginButton = document.querySelector('[data-bs-target="#modalLogin"]');
      if (loginButton) {
        loginButton.click();
      }
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isFav) {
        // Remove from favorites
        result = await removeFromFavorites(user.id, propertyId);
        if (!result.error) {
          setIsFav(false);
          onFavoriteChange(false);
        }
      } else {
        // Add to favorites
        result = await addToFavorites(user.id, propertyId);
        if (!result.error) {
          setIsFav(true);
          onFavoriteChange(true);
        }
      }

      if (result.error) {
        console.error('Error toggling favorite:', result.error);
        // Could show toast notification here
      }
    } catch (error) {
      console.error('Error in handleFavoriteClick:', error);
    } finally {
      setLoading(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      buttonClass: "btn-favorite-sm",
      iconSize: 16,
      loadingSize: "spinner-border-sm"
    },
    medium: {
      buttonClass: "btn-favorite-md",
      iconSize: 20,
      loadingSize: "spinner-border-sm"
    },
    large: {
      buttonClass: "btn-favorite-lg",
      iconSize: 24,
      loadingSize: ""
    }
  };

  const config = sizeConfig[size];

  return (
    <button
      type="button"
      className={`btn btn-favorite ${config.buttonClass} ${isFav ? 'favorited' : ''} ${className}`}
      onClick={handleFavoriteClick}
      disabled={loading}
      title={showTooltip ? (isFav ? 'Remove from favorites' : 'Add to favorites') : ''}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <div className={`spinner-border ${config.loadingSize}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <svg
          width={config.iconSize}
          height={config.iconSize}
          viewBox="0 0 24 24"
          fill={isFav ? "#ff4757" : "none"}
          stroke={isFav ? "#ff4757" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}
