"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllAmenities } from "@/utils/propertyQueries";

export default function SubmitProperty() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    property_type: "house",
    listing_type: "sale",
    
    // Location
    address: "",
    city: "",
    state_province: "",
    zip_postal_code: "",
    country: "United States",
    
    // Property Details
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    lot_size: "",
    year_built: "",
    garage_spaces: "",
    floors: "",
    
    // Features
    is_furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    utilities_included: [],
    amenities: [],
    
    // Contact Information
    contact_phone: "",
    contact_email: "",
    preferred_contact_method: "email",
    
    // Additional Information
    virtual_tour_url: "",
    video_url: "",
    available_for_viewing: {
      days: [],
      times: [],
      notes: ""
    },
    
    // Rental specific (if listing_type is rent)
    lease_terms: {
      minimum_lease: "",
      security_deposit: "",
      rent_includes: [],
      pet_deposit: "",
      application_fee: ""
    }
  });

  // Load amenities on component mount
  useEffect(() => {
    async function loadAmenities() {
      try {
        const amenitiesData = await getAllAmenities();
        setAmenities(amenitiesData);
      } catch (error) {
        console.error("Error loading amenities:", error);
      }
    }
    loadAmenities();
  }, []);

  // Pre-fill contact info with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contact_email: user.email || "",
        contact_phone: user.user_metadata?.phone_number || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleAmenityChange = (amenityId, checked) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/properties/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          owner_id: user.id,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms) || null,
          bathrooms: parseFloat(formData.bathrooms) || null,
          sqft: parseInt(formData.sqft) || null,
          lot_size: parseInt(formData.lot_size) || null,
          year_built: parseInt(formData.year_built) || null,
          garage_spaces: parseInt(formData.garage_spaces) || null,
          floors: parseInt(formData.floors) || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Property submitted successfully! Your listing is now pending review by our admin team. You'll receive an email notification once it's approved.");
        // Reset form
        setFormData({
          title: "",
          description: "",
          property_type: "house",
          listing_type: "sale",
          address: "",
          city: "",
          state_province: "",
          zip_postal_code: "",
          country: "United States",
          price: "",
          bedrooms: "",
          bathrooms: "",
          sqft: "",
          lot_size: "",
          year_built: "",
          garage_spaces: "",
          floors: "",
          is_furnished: false,
          pets_allowed: false,
          smoking_allowed: false,
          utilities_included: [],
          amenities: [],
          contact_phone: user?.user_metadata?.phone_number || "",
          contact_email: user?.email || "",
          preferred_contact_method: "email",
          virtual_tour_url: "",
          video_url: "",
          available_for_viewing: { days: [], times: [], notes: "" },
          lease_terms: {
            minimum_lease: "",
            security_deposit: "",
            rent_includes: [],
            pet_deposit: "",
            application_fee: ""
          }
        });
      } else {
        setError(result.error || "Failed to submit property");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to submit property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const utilityOptions = [
    "electricity", "water", "gas", "internet", "cable_tv", 
    "trash", "sewer", "heating", "cooling"
  ];

  const dayOptions = [
    "monday", "tuesday", "wednesday", "thursday", 
    "friday", "saturday", "sunday"
  ];

  const timeOptions = [
    "morning", "afternoon", "evening", "weekends_only", "by_appointment"
  ];

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Submit Your Property</h3>
              <p className="mb-0">Fill out the form below to list your property on our platform</p>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Basic Information</h4>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Property Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="e.g., Beautiful 3-bedroom house with garden"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Price *</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          name="price"
                          className="form-control"
                          placeholder="750000"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Property Type *</label>
                      <select
                        name="property_type"
                        className="form-control"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="office">Office</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Listing Type *</label>
                      <select
                        name="listing_type"
                        className="form-control"
                        value={formData.listing_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      placeholder="Describe your property, its features, neighborhood, and what makes it special..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Location</h4>
                  <div className="mb-3">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        placeholder="Los Angeles"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State/Province *</label>
                      <input
                        type="text"
                        name="state_province"
                        className="form-control"
                        placeholder="California"
                        value={formData.state_province}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP/Postal Code *</label>
                      <input
                        type="text"
                        name="zip_postal_code"
                        className="form-control"
                        placeholder="90210"
                        value={formData.zip_postal_code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Property Details</h4>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bedrooms</label>
                      <input
                        type="number"
                        name="bedrooms"
                        className="form-control"
                        placeholder="3"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        name="bathrooms"
                        className="form-control"
                        placeholder="2.5"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Square Feet</label>
                      <input
                        type="number"
                        name="sqft"
                        className="form-control"
                        placeholder="1500"
                        value={formData.sqft}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Year Built</label>
                      <input
                        type="number"
                        name="year_built"
                        className="form-control"
                        placeholder="2020"
                        value={formData.year_built}
                        onChange={handleInputChange}
                        min="1800"
                        max="2024"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Lot Size (sq ft)</label>
                      <input
                        type="number"
                        name="lot_size"
                        className="form-control"
                        placeholder="7200"
                        value={formData.lot_size}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Garage Spaces</label>
                      <input
                        type="number"
                        name="garage_spaces"
                        className="form-control"
                        placeholder="2"
                        value={formData.garage_spaces}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Number of Floors</label>
                      <input
                        type="number"
                        name="floors"
                        className="form-control"
                        placeholder="2"
                        value={formData.floors}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Features */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Property Features</h4>
                  
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="is_furnished"
                          className="form-check-input"
                          checked={formData.is_furnished}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Furnished</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="pets_allowed"
                          className="form-check-input"
                          checked={formData.pets_allowed}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Pets Allowed</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="smoking_allowed"
                          className="form-check-input"
                          checked={formData.smoking_allowed}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Smoking Allowed</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Utilities Included</label>
                    <div className="row">
                      {utilityOptions.map(utility => (
                        <div key={utility} className="col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={formData.utilities_included.includes(utility)}
                              onChange={(e) => handleArrayInputChange('utilities_included', utility, e.target.checked)}
                            />
                            <label className="form-check-label">
                              {utility.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Amenities</label>
                    <div className="row">
                      {amenities.map(amenity => (
                        <div key={amenity.id} className="col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={formData.amenities.includes(amenity.id)}
                              onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                            />
                            <label className="form-check-label" title={amenity.description}>
                              {amenity.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Contact Information</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Email *</label>
                      <input
                        type="email"
                        name="contact_email"
                        className="form-control"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        name="contact_phone"
                        className="form-control"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preferred Contact Method</label>
                    <select
                      name="preferred_contact_method"
                      className="form-control"
                      value={formData.preferred_contact_method}
                      onChange={handleInputChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                {/* Viewing Availability */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Viewing Availability</h4>
                  <div className="mb-3">
                    <label className="form-label">Available Days</label>
                    <div className="row">
                      {dayOptions.map(day => (
                        <div key={day} className="col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={formData.available_for_viewing.days.includes(day)}
                              onChange={(e) => {
                                const newDays = e.target.checked 
                                  ? [...formData.available_for_viewing.days, day]
                                  : formData.available_for_viewing.days.filter(d => d !== day);
                                handleNestedInputChange('available_for_viewing', 'days', newDays);
                              }}
                            />
                            <label className="form-check-label">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Preferred Times</label>
                    <div className="row">
                      {timeOptions.map(time => (
                        <div key={time} className="col-md-4 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={formData.available_for_viewing.times.includes(time)}
                              onChange={(e) => {
                                const newTimes = e.target.checked 
                                  ? [...formData.available_for_viewing.times, time]
                                  : formData.available_for_viewing.times.filter(t => t !== time);
                                handleNestedInputChange('available_for_viewing', 'times', newTimes);
                              }}
                            />
                            <label className="form-check-label">
                              {time.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Additional Viewing Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Any special instructions for property viewings..."
                      value={formData.available_for_viewing.notes}
                      onChange={(e) => handleNestedInputChange('available_for_viewing', 'notes', e.target.value)}
                    />
                  </div>
                </div>

                {/* Rental Terms (only show if listing_type is rent) */}
                {formData.listing_type === 'rent' && (
                  <div className="section mb-4">
                    <h4 className="section-title mb-3">Rental Terms</h4>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Minimum Lease (months)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="12"
                          value={formData.lease_terms.minimum_lease}
                          onChange={(e) => handleNestedInputChange('lease_terms', 'minimum_lease', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Security Deposit ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="2000"
                          value={formData.lease_terms.security_deposit}
                          onChange={(e) => handleNestedInputChange('lease_terms', 'security_deposit', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Pet Deposit ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="500"
                          value={formData.lease_terms.pet_deposit}
                          onChange={(e) => handleNestedInputChange('lease_terms', 'pet_deposit', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Application Fee ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="50"
                          value={formData.lease_terms.application_fee}
                          onChange={(e) => handleNestedInputChange('lease_terms', 'application_fee', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="section mb-4">
                  <h4 className="section-title mb-3">Additional Information (Optional)</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Virtual Tour URL</label>
                      <input
                        type="url"
                        name="virtual_tour_url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.virtual_tour_url}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Video URL</label>
                      <input
                        type="url"
                        name="video_url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.video_url}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="tf-btn primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting Property..." : "Submit Property for Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-title {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
        }
        .card {
          border: none;
          border-radius: 15px;
        }
        .card-header {
          border-radius: 15px 15px 0 0 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        .form-check-input:checked {
          background-color: #3498db;
          border-color: #3498db;
        }
        .form-control:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
        }
      `}</style>
    </div>
  );
}
