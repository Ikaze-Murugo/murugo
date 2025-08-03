// components/common/StarRating.jsx
"use client";

import { useState } from "react";

export default function StarRating({ 
  rating = 0, 
  onRatingChange = () => {}, 
  readonly = false,
  size = "medium",
  showValue = false,
  className = ""
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    small: "star-rating-small",
    medium: "star-rating-medium", 
    large: "star-rating-large"
  };

  const handleStarClick = (value) => {
    if (!readonly) {
      onRatingChange(value);
    }
  };

  const handleStarHover = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div 
      className={`star-rating ${sizeClasses[size]} ${readonly ? 'readonly' : 'interactive'} ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= displayRating ? 'filled' : 'empty'}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 1.6665L12.575 6.8915L18.3333 7.7249L14.1667 11.7832L15.15 17.5165L10 14.8082L4.85 17.5165L5.83333 11.7832L1.66667 7.7249L7.425 6.8915L10 1.6665Z"
                fill={star <= displayRating ? "#FFD700" : "#E5E7EB"}
                stroke={star <= displayRating ? "#FFD700" : "#D1D5DB"}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      {showValue && (
        <span className="rating-value ms-2">
          {rating > 0 ? `${rating}/5` : 'No rating'}
        </span>
      )}
      
      <style jsx>{`
        .star-rating {
          display: inline-flex;
          align-items: center;
        }
        
        .stars-container {
          display: flex;
          gap: 2px;
        }
        
        .star {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          transition: transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .star:hover {
          transform: scale(1.1);
        }
        
        .star:disabled {
          cursor: default;
        }
        
        .star:disabled:hover {
          transform: none;
        }
        
        .readonly .star {
          cursor: default;
        }
        
        .readonly .star:hover {
          transform: none;
        }
        
        .star-rating-small .star svg {
          width: 16px;
          height: 16px;
        }
        
        .star-rating-medium .star svg {
          width: 20px;
          height: 20px;
        }
        
        .star-rating-large .star svg {
          width: 24px;
          height: 24px;
        }
        
        .rating-value {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
        }
        
        .star.filled svg path {
          fill: #FFD700;
          stroke: #FFD700;
        }
        
        .star.empty svg path {
          fill: #E5E7EB;
          stroke: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
