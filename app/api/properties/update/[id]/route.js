import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.json();

    // Validate required fields
    if (!formData.title || !formData.description || !formData.price || !formData.property_type || 
        !formData.listing_type || !formData.address || !formData.city || !formData.state_province) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the property exists and belongs to the user
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.owner_id !== formData.owner_id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this property' },
        { status: 403 }
      );
    }

    // Prepare property data
    const propertyData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      property_type: formData.property_type,
      listing_type: formData.listing_type,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
      square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
      lot_size: formData.lot_size || null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state_province: formData.state_province.trim(),
      postal_code: formData.postal_code || null,
      country: formData.country || 'Canada',
      neighborhood: formData.neighborhood || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      contact_phone: formData.contact_phone || null,
      contact_email: formData.contact_email || null,
      preferred_contact_method: formData.preferred_contact_method || 'email',
      available_for_viewing: formData.available_for_viewing || false,
      smoking_allowed: formData.smoking_allowed || false,
      pets_allowed: formData.pets_allowed || false,
      utilities_included: formData.utilities_included || false,
      furnished: formData.furnished || false,
      lease_terms: formData.lease_terms || null,
      virtual_tour_url: formData.virtual_tour_url || null,
      video_url: formData.video_url || null,
      status: formData.status || 'draft',
      updated_at: new Date().toISOString()
    };

    // Start a transaction-like operation
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Property update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      );
    }

    // Update property amenities if provided
    if (formData.amenity_ids && Array.isArray(formData.amenity_ids)) {
      // Delete existing amenity associations
      const { error: deleteAmenitiesError } = await supabase
        .from('property_amenities')
        .delete()
        .eq('property_id', id);

      if (deleteAmenitiesError) {
        console.error('Error deleting existing amenities:', deleteAmenitiesError);
      }

      // Insert new amenity associations
      if (formData.amenity_ids.length > 0) {
        const amenityInserts = formData.amenity_ids.map(amenityId => ({
          property_id: id,
          amenity_id: amenityId
        }));

        const { error: insertAmenitiesError } = await supabase
          .from('property_amenities')
          .insert(amenityInserts);

        if (insertAmenitiesError) {
          console.error('Error inserting amenities:', insertAmenitiesError);
          // Don't fail the whole operation for amenity errors
        }
      }
    }

    // If status changed to 'pending', create/update submission record
    if (formData.status === 'pending') {
      const submissionData = {
        property_id: id,
        submitted_by: formData.owner_id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        notes: 'Property updated and resubmitted for review'
      };

      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from('property_submissions')
        .select('id')
        .eq('property_id', id)
        .single();

      if (existingSubmission) {
        // Update existing submission
        await supabase
          .from('property_submissions')
          .update(submissionData)
          .eq('property_id', id);
      } else {
        // Create new submission
        await supabase
          .from('property_submissions')
          .insert(submissionData);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });

  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
