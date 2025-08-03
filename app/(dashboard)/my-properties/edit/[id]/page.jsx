"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPropertyById } from "@/utils/propertyQueries";
import { getAllAmenities } from "@/utils/propertyQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Check if user is homeowner
  if (user?.user_metadata?.role !== 'homeowner') {
    return (
      <>
        <Header1 />
        <div className="container my-5">
          <div className="alert alert-warning">
            <h4>Homeowner Access Required</h4>
            <p>You need to be registered as a homeowner to edit properties.</p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  useEffect(() => {
    fetchPropertyData();
    fetchAmenities();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const { data, error } = await getPropertyById(id);
      if (error) {
        console.error('Error fetching property:', error);
        alert('Property not found or access denied');
        router.push('/my-properties');
        return;
      }

      // Check if user owns this property
      if (data.owner_id !== user.id) {
        alert('You can only edit your own properties');
        router.push('/my-properties');
        return;
      }

      setProperty(data);
      
      // Initialize form data with property data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        original_price: data.original_price || '',
        property_type: data.property_type || 'house',
        listing_type: data.listing_type || 'sale',
        bedrooms: data.bedrooms || '',
        bathrooms: data.bathrooms || '',
        square_footage: data.square_footage || '',
        lot_size: data.lot_size || '',
        year_built: data.year_built || '',
        parking_spaces: data.parking_spaces || '',
        address: data.address || '',
        city: data.city || '',
        state_province: data.state_province || '',
        postal_code: data.postal_code || '',
        country: data.country || 'Canada',
        neighborhood: data.neighborhood || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        preferred_contact_method: data.preferred_contact_method || 'email',
        available_for_viewing: data.available_for_viewing || false,
        smoking_allowed: data.smoking_allowed || false,
        pets_allowed: data.pets_allowed || false,
        utilities_included: data.utilities_included || false,
        furnished: data.furnished || false,
        lease_terms: data.lease_terms || '',
        virtual_tour_url: data.virtual_tour_url || '',
        video_url: data.video_url || '',
        status: data.status || 'draft',
        amenity_ids: data.amenities?.map(a => a.id) || []
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Error loading property data');
      router.push('/my-properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      const { data, error } = await getAllAmenities();
      if (error) {
        console.error('Error fetching amenities:', error);
      } else {
        setAmenities(data);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter(id => id !== amenityId)
        : [...prev.amenity_ids, amenityId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/properties/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          owner_id: user.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Property updated successfully!');
        router.push('/my-properties');
      } else {
        alert(`Error updating property: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header1 />
        <div className="container my-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header1 />
        <div className="container my-5">
          <div className="alert alert-danger">
            <h4>Property Not Found</h4>
            <p>The property you're trying to edit could not be found.</p>
            <Link href="/my-properties" className="btn btn-primary">
              Back to My Properties
            </Link>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  return (
    <>
      <Header1 />
      <div className="container my-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Edit Property</h2>
            <p className="text-muted">Update your property listing information</p>
          </div>
          <div className="d-flex gap-2">
            <Link 
              href={`/property-details-v1/${property.id}`} 
              className="btn btn-outline-secondary"
              target="_blank"
            >
              <i className="icon icon-eye me-1"></i>
              Preview
            </Link>
            <Link href="/my-properties" className="btn btn-outline-primary">
              ← Back to My Properties
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Basic Information */}
            <div className="col-lg-8">
              {/* Property Information */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Property Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Property Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Beautiful 3BR Family Home in Downtown"
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe your property in detail..."
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Property Type *</label>
                      <select
                        name="property_type"
                        className="form-select"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="villa">Villa</option>
                        <option value="loft">Loft</option>
                        <option value="studio">Studio</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Listing Type *</label>
                      <select
                        name="listing_type"
                        className="form-select"
                        value={formData.listing_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Submit for Review</option>
                        <option value="active">Active (if approved)</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price *</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          name="price"
                          className="form-control"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="100"
                        />
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Original Price</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          name="original_price"
                          className="form-control"
                          value={formData.original_price}
                          onChange={handleInputChange}
                          min="0"
                          step="100"
                          placeholder="If different from current price"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Property Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bedrooms</label>
                      <input
                        type="number"
                        name="bedrooms"
                        className="form-control"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Bathrooms</label>
                      <input
                        type="number"
                        name="bathrooms"
                        className="form-control"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        step="0.5"
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Square Footage</label>
                      <input
                        type="number"
                        name="square_footage"
                        className="form-control"
                        value={formData.square_footage}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="sq ft"
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Parking Spaces</label>
                      <input
                        type="number"
                        name="parking_spaces"
                        className="form-control"
                        value={formData.parking_spaces}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Lot Size</label>
                      <input
                        type="text"
                        name="lot_size"
                        className="form-control"
                        value={formData.lot_size}
                        onChange={handleInputChange}
                        placeholder="e.g., 0.25 acres, 5000 sq ft"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Year Built</label>
                      <input
                        type="number"
                        name="year_built"
                        className="form-control"
                        value={formData.year_built}
                        onChange={handleInputChange}
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Neighborhood</label>
                      <input
                        type="text"
                        name="neighborhood"
                        className="form-control"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="e.g., Downtown, Westside, Oak Bay"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Location</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Vancouver"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Province/State *</label>
                      <input
                        type="text"
                        name="state_province"
                        className="form-control"
                        value={formData.state_province}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., BC"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        className="form-control"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="e.g., V6B 1A1"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Country</label>
                      <select
                        name="country"
                        className="form-select"
                        value={formData.country}
                        onChange={handleInputChange}
                      >
                        <option value="Canada">Canada</option>
                        <option value="United States">United States</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Options */}
            <div className="col-lg-4">
              {/* Property Features */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Property Features</h5>
                </div>
                <div className="card-body">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      name="pets_allowed"
                      className="form-check-input"
                      checked={formData.pets_allowed}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Pets Allowed</label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      name="smoking_allowed"
                      className="form-check-input"
                      checked={formData.smoking_allowed}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Smoking Allowed</label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      name="furnished"
                      className="form-check-input"
                      checked={formData.furnished}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Furnished</label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      name="utilities_included"
                      className="form-check-input"
                      checked={formData.utilities_included}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Utilities Included</label>
                  </div>

                  {formData.listing_type === 'rent' && (
                    <div className="mb-3">
                      <label className="form-label">Lease Terms</label>
                      <select
                        name="lease_terms"
                        className="form-select"
                        value={formData.lease_terms}
                        onChange={handleInputChange}
                      >
                        <option value="">Select lease terms</option>
                        <option value="monthly">Month-to-month</option>
                        <option value="6_months">6 months</option>
                        <option value="1_year">1 year</option>
                        <option value="2_years">2+ years</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Amenities</h5>
                </div>
                <div className="card-body">
                  <div className="amenities-grid" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.amenity_ids.includes(amenity.id)}
                          onChange={() => handleAmenityChange(amenity.id)}
                        />
                        <label className="form-check-label">{amenity.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Contact Information</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      className="form-control"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      className="form-control"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Preferred Contact Method</label>
                    <select
                      name="preferred_contact_method"
                      className="form-select"
                      value={formData.preferred_contact_method}
                      onChange={handleInputChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="available_for_viewing"
                      className="form-check-input"
                      checked={formData.available_for_viewing}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Available for Viewing</label>
                  </div>
                </div>
              </div>

              {/* Media URLs */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Media & Tours</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Virtual Tour URL</label>
                    <input
                      type="url"
                      name="virtual_tour_url"
                      className="form-control"
                      value={formData.virtual_tour_url}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Video Tour URL</label>
                    <input
                      type="url"
                      name="video_url"
                      className="form-control"
                      value={formData.video_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="card">
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="icon icon-save me-1"></i>
                          Update Property
                        </>
                      )}
                    </button>

                    <Link href="/my-properties" className="btn btn-outline-secondary">
                      Cancel Changes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer1 />

      <style jsx>{`
        .card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .card-header {
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          border-radius: 12px 12px 0 0 !important;
        }
        .amenities-grid {
          columns: 1;
        }
        @media (min-width: 768px) {
          .amenities-grid {
            columns: 2;
          }
        }
      `}</style>
    </>
  );
}