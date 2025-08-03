import { supabase } from './supabaseClient';


// Existing functions remain the same, adding new ones for property owner management

// Get properties by owner (for homeowner dashboard)
export async function getPropertiesByOwner(ownerId, filters = {}) {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:users!properties_owner_id_fkey (
            id,
            name,
            email,
            phone_number,
            verification_status
          ),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone_number,
            verification_status
          ),
          images (
            id,
            url,
            thumbnail_url,
            alt_text,
            is_primary,
            image_type
          ),
          amenities:property_amenities (
            amenity:amenities (
              id,
              name,
              category,
              icon
            )
          )
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
  
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
  
      if (filters.listing_type && filters.listing_type !== 'all') {
        query = query.eq('listing_type', filters.listing_type);
      }
  
      if (filters.property_type && filters.property_type !== 'all') {
        query = query.eq('property_type', filters.property_type);
      }
  
      const { data, error } = await query;
  
      if (error) {
        console.error('Error fetching properties by owner:', error);
        return { data: null, error };
      }
  
      // Transform the data
      const transformedData = data?.map(property => transformPropertyData(property)) || [];
  
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error in getPropertiesByOwner:', error);
      return { data: null, error };
    }
  }
  
  // Delete property (for property owners)
  export async function deleteProperty(propertyId, ownerId) {
    try {
      // First verify ownership
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();
  
      if (fetchError || !property) {
        return { error: 'Property not found' };
      }
  
      if (property.owner_id !== ownerId) {
        return { error: 'Unauthorized to delete this property' };
      }
  
      // Delete the property (cascading deletes should handle related records)
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
  
      if (deleteError) {
        console.error('Error deleting property:', deleteError);
        return { error: 'Failed to delete property' };
      }
  
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      return { data: null, error };
    }
  }
  
  // Update property status (for property owners)
  export async function updatePropertyStatus(propertyId, newStatus, ownerId) {
    try {
      // First verify ownership
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();
  
      if (fetchError || !property) {
        return { error: 'Property not found' };
      }
  
      if (property.owner_id !== ownerId) {
        return { error: 'Unauthorized to update this property' };
      }
  
      // Update the property status
      const { data, error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .select()
        .single();
  
      if (updateError) {
        console.error('Error updating property status:', updateError);
        return { error: 'Failed to update property status' };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error('Error in updatePropertyStatus:', error);
      return { data: null, error };
    }
  }
  
  // Get property analytics for owner
  export async function getPropertyAnalyticsForOwner(propertyId, ownerId) {
    try {
      // First verify ownership
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('owner_id, view_count, inquiry_count, favorite_count')
        .eq('id', propertyId)
        .single();
  
      if (fetchError || !property) {
        return { error: 'Property not found' };
      }
  
      if (property.owner_id !== ownerId) {
        return { error: 'Unauthorized to view analytics for this property' };
      }
  
      // Get additional analytics data
      const analytics = {
        view_count: property.view_count || 0,
        inquiry_count: property.inquiry_count || 0,
        favorite_count: property.favorite_count || 0
      };
  
      // Get recent views (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
      const { data: recentViews, error: viewsError } = await supabase
        .from('property_views')
        .select('viewed_at')
        .eq('property_id', propertyId)
        .gte('viewed_at', thirtyDaysAgo.toISOString())
        .order('viewed_at', { ascending: false });
  
      if (!viewsError) {
        analytics.recent_views_count = recentViews?.length || 0;
      }
  
      // Get recent messages/inquiries
      const { data: recentInquiries, error: inquiriesError } = await supabase
        .from('messages')
        .select('created_at, sender_name, message_type')
        .eq('property_id', propertyId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
  
      if (!inquiriesError) {
        analytics.recent_inquiries_count = recentInquiries?.length || 0;
        analytics.recent_inquiries = recentInquiries?.slice(0, 5) || [];
      }
  
      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error in getPropertyAnalyticsForOwner:', error);
      return { data: null, error };
    }
  }
  
  // Duplicate property (for property owners)
  export async function duplicateProperty(propertyId, ownerId) {
    try {
      // First get the original property
      const { data: originalProperty, error: fetchError } = await supabase
        .from('properties')
        .select(`
          *,
          amenities:property_amenities (
            amenity_id
          )
        `)
        .eq('id', propertyId)
        .eq('owner_id', ownerId)
        .single();
  
      if (fetchError || !originalProperty) {
        return { error: 'Property not found or unauthorized' };
      }
  
      // Prepare new property data
      const newPropertyData = {
        ...originalProperty,
        title: `${originalProperty.title} (Copy)`,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
        inquiry_count: 0,
        favorite_count: 0,
        published_at: null
      };
  
      // Remove fields that shouldn't be copied
      delete newPropertyData.id;
      delete newPropertyData.amenities;
  
      // Insert the new property
      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert(newPropertyData)
        .select()
        .single();
  
      if (insertError) {
        console.error('Error duplicating property:', insertError);
        return { error: 'Failed to duplicate property' };
      }
  
      // Copy amenities
      if (originalProperty.amenities?.length > 0) {
        const amenityInserts = originalProperty.amenities.map(amenity => ({
          property_id: newProperty.id,
          amenity_id: amenity.amenity_id
        }));
  
        await supabase
          .from('property_amenities')
          .insert(amenityInserts);
      }
  
      return { data: newProperty, error: null };
    } catch (error) {
      console.error('Error in duplicateProperty:', error);
      return { data: null, error };
    }
  }
  
  // All existing functions remain unchanged...
  // (getAllProperties, getPropertyById, getAllAmenities, etc.)
  
  // ... rest of existing functions stay the same ...
// =============================================
// PROPERTY FETCHING FUNCTIONS
// =============================================

export async function getAllProperties(filters = {}) {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:users!properties_owner_id_fkey (
          id,
          name,
          email,
          phone_number,
          avatar_url
        ),
        agent:users!properties_agent_id_fkey (
          id,
          name,
          email,
          phone_number,
          company,
          bio,
          avatar_url
        ),
        property_amenities (
          amenities (
            id,
            name,
            category
          )
        ),
        images (
          id,
          url,
          thumbnail_url,
          alt,
          image_type,
          sort_order,
          is_primary
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state_province) {
      query = query.ilike('state_province', `%${filters.state_province}%`);
    }
    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }
    if (filters.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }
    if (filters.bathrooms) {
      query = query.gte('bathrooms', filters.bathrooms);
    }
    if (filters.is_featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return { data: [], error };
    }

    return { data: data?.map(transformPropertyData) || [], error: null };
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    return { data: [], error };
  }
}

export async function getPropertyById(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:users!properties_owner_id_fkey (
          id,
          name,
          email,
          phone_number,
          avatar_url,
          verification_status
        ),
        agent:users!properties_agent_id_fkey (
          id,
          name,
          email,
          phone_number,
          company,
          bio,
          avatar_url,
          verification_status
        ),
        property_amenities (
          amenities (
            id,
            name,
            category,
            description
          )
        ),
        images (
          id,
          url,
          thumbnail_url,
          alt,
          image_type,
          sort_order,
          is_primary,
          caption
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return { data: null, error };
    }

    // Increment view count
    await incrementPropertyViewCount(id);

    return { data: transformPropertyData(data), error: null };
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    return { data: null, error };
  }
}

export async function getFeaturedProperties(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:users!properties_owner_id_fkey (
          id,
          name,
          email,
          phone_number,
          avatar_url
        ),
        images (
          id,
          url,
          thumbnail_url,
          alt,
          is_primary,
          sort_order
        ),
        property_amenities (
          amenities (
            id,
            name
          )
        )
      `)
      .eq('status', 'approved')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured properties:', error);
      return { data: [], error };
    }

    return { data: data?.map(transformPropertyData) || [], error: null };
  } catch (error) {
    console.error('Error in getFeaturedProperties:', error);
    return { data: [], error };
  }
}

// =============================================
// AMENITIES FUNCTIONS
// =============================================

export async function getAllAmenities() {
  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching amenities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAmenities:', error);
    return [];
  }
}

export async function getAmenitiesByCategory() {
  try {
    const amenities = await getAllAmenities();
    
    const categorized = amenities.reduce((acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    }, {});

    return categorized;
  } catch (error) {
    console.error('Error in getAmenitiesByCategory:', error);
    return {};
  }
}

// =============================================
// PROPERTY ANALYTICS
// =============================================

export async function incrementPropertyViewCount(propertyId, userId = null) {
  try {
    // Record the view
    await supabase
      .from('property_views')
      .insert({
        property_id: propertyId,
        user_id: userId,
        viewed_at: new Date().toISOString()
      });

    // Update the counter in properties table
    await supabase
      .from('properties')
      .update({ 
        view_count: supabase.raw('view_count + 1') 
      })
      .eq('id', propertyId);

  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

export async function getPropertyAnalytics(propertyId) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('view_count, inquiry_count, favorite_count')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('Error fetching property analytics:', error);
      return { view_count: 0, inquiry_count: 0, favorite_count: 0 };
    }

    return data;
  } catch (error) {
    console.error('Error in getPropertyAnalytics:', error);
    return { view_count: 0, inquiry_count: 0, favorite_count: 0 };
  }
}

// =============================================
// SEARCH FUNCTIONS
// =============================================

export async function searchProperties(searchTerm, filters = {}) {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:users!properties_owner_id_fkey (
          id,
          name,
          email,
          phone_number,
          avatar_url
        ),
        images (
          id,
          url,
          thumbnail_url,
          alt,
          is_primary,
          sort_order
        ),
        property_amenities (
          amenities (
            id,
            name
          )
        )
      `)
      .eq('status', 'approved');

    // Text search across multiple fields
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state_province.ilike.%${searchTerm}%,neighborhood.ilike.%${searchTerm}%`
      );
    }

    // Apply filters (same as getAllProperties)
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }
    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }
    if (filters.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }
    if (filters.bathrooms) {
      query = query.gte('bathrooms', filters.bathrooms);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching properties:', error);
      return { data: [], error };
    }

    return { data: data?.map(transformPropertyData) || [], error: null };
  } catch (error) {
    console.error('Error in searchProperties:', error);
    return { data: [], error };
  }
}

// =============================================
// DATA TRANSFORMATION
// =============================================

export function transformPropertyData(supabaseProperty) {
  if (!supabaseProperty) return null;

  // Get images sorted by sort_order, primary first
  const images = supabaseProperty.images || [];
  const sortedImages = images.sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  
  const firstImage = sortedImages[0];

  // Get amenities list
  const amenities = supabaseProperty.property_amenities
    ?.map(pa => pa.amenities?.name)
    .filter(Boolean) || [];

  // Determine the listing type display
  const listingTypeDisplay = supabaseProperty.listing_type === 'sale' ? 'For Sale' : 
                             supabaseProperty.listing_type === 'rent' ? 'For Rent' : 'For Lease';

  // Get contact person (agent or owner)
  const contactPerson = supabaseProperty.agent || supabaseProperty.owner;

  // Transform to match existing component props
  return {
    id: supabaseProperty.id,
    imgSrc: firstImage?.url || '/images/home/house-1.jpg',
    thumbnailSrc: firstImage?.thumbnail_url || firstImage?.url || '/images/home/house-1.jpg',
    alt: firstImage?.alt || `${supabaseProperty.title} - Property Image`,
    address: `${supabaseProperty.address || ''}, ${supabaseProperty.city || ''}, ${supabaseProperty.state_province || ''}`,
    fullAddress: {
      street: supabaseProperty.address,
      city: supabaseProperty.city,
      state: supabaseProperty.state_province,
      zip: supabaseProperty.zip_postal_code,
      country: supabaseProperty.country
    },
    title: supabaseProperty.title,
    beds: supabaseProperty.bedrooms,
    baths: supabaseProperty.bathrooms,
    sqft: supabaseProperty.sqft,
    lotSize: supabaseProperty.lot_size,
    price: supabaseProperty.price,
    originalPrice: supabaseProperty.original_price,
    listing_type: listingTypeDisplay,
    property_type: supabaseProperty.property_type,
    status: supabaseProperty.status,
    is_featured: supabaseProperty.is_featured,
    tags: [
      ...(supabaseProperty.is_featured ? ['Featured'] : []),
      listingTypeDisplay,
      ...(supabaseProperty.is_furnished ? ['Furnished'] : []),
      ...(supabaseProperty.pets_allowed ? ['Pet Friendly'] : [])
    ].filter(Boolean),
    avatar: contactPerson?.avatar_url || '/images/avatar/avt-png1.png',
    agent: contactPerson?.name || 'Property Owner',
    lat: parseFloat(supabaseProperty.latitude) || 40.7279707552121,
    lng: parseFloat(supabaseProperty.longitude) || -74.07152705896405,
    latitude: parseFloat(supabaseProperty.latitude) || 40.7279707552121,
    longitude: parseFloat(supabaseProperty.longitude) || -74.07152705896405,
    features: amenities,
    amenities: amenities,
    
    // Enhanced property details
    description: supabaseProperty.description,
    year_built: supabaseProperty.year_built,
    garage_spaces: supabaseProperty.garage_spaces,
    floors: supabaseProperty.floors,
    parking_spaces: supabaseProperty.parking_spaces,
    neighborhood: supabaseProperty.neighborhood,
    
    // Contact information
    contact_phone: supabaseProperty.contact_phone,
    contact_email: supabaseProperty.contact_email,
    preferred_contact_method: supabaseProperty.preferred_contact_method,
    available_for_viewing: supabaseProperty.available_for_viewing,
    
    // Owner/Agent info
    owner_info: supabaseProperty.owner,
    agent_info: supabaseProperty.agent,
    contact_person: contactPerson,
    
    // Property features
    pets_allowed: supabaseProperty.pets_allowed,
    is_furnished: supabaseProperty.is_furnished,
    smoking_allowed: supabaseProperty.smoking_allowed,
    utilities_included: supabaseProperty.utilities_included || [],
    lease_terms: supabaseProperty.lease_terms,
    
    // Media
    all_images: sortedImages,
    virtual_tour_url: supabaseProperty.virtual_tour_url,
    video_url: supabaseProperty.video_url,
    
    // Analytics
    view_count: supabaseProperty.view_count || 0,
    inquiry_count: supabaseProperty.inquiry_count || 0,
    favorite_count: supabaseProperty.favorite_count || 0,
    
    // Timestamps
    created_at: supabaseProperty.created_at,
    updated_at: supabaseProperty.updated_at,
    published_at: supabaseProperty.published_at,
    
    // Legacy compatibility
    filterOptions: [supabaseProperty.property_type].filter(Boolean)
  };
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export function formatPrice(price) {
  if (!price) return 'Price on request';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPropertyType(type) {
  if (!type) return '';
  
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function generatePropertySlug(title, id) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return `${slug}-${id.slice(-8)}`;
}