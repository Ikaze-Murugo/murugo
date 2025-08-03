import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import emailjs from '@emailjs/nodejs';

export async function POST(request) {
  try {
    const propertyData = await request.json();

    // Basic validation
    if (!propertyData.title || !propertyData.description || !propertyData.price || 
        !propertyData.address || !propertyData.city || !propertyData.state_province || 
        !propertyData.zip_postal_code || !propertyData.owner_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (propertyData.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate contact information
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(propertyData.contact_email)) {
      return NextResponse.json(
        { error: 'Invalid contact email address' },
        { status: 400 }
      );
    }

    // Prepare property data for database insertion
    const {
      owner_id,
      title,
      description,
      property_type,
      listing_type,
      address,
      city,
      state_province,
      zip_postal_code,
      country = 'United States',
      price,
      bedrooms,
      bathrooms,
      sqft,
      lot_size,
      year_built,
      garage_spaces,
      floors,
      is_furnished = false,
      pets_allowed = false,
      smoking_allowed = false,
      utilities_included = [],
      contact_phone,
      contact_email,
      preferred_contact_method = 'email',
      virtual_tour_url,
      video_url,
      available_for_viewing = {},
      lease_terms = {},
      amenities = []
    } = propertyData;

    // Insert property into database
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert([{
        owner_id,
        title,
        description,
        property_type,
        listing_type,
        status: 'pending', // Always start as pending for review
        address,
        city,
        state_province,
        zip_postal_code: zip_postal_code,
        country,
        price,
        bedrooms,
        bathrooms,
        sqft,
        lot_size,
        year_built,
        garage_spaces,
        floors,
        is_furnished,
        pets_allowed,
        smoking_allowed,
        utilities_included,
        contact_phone,
        contact_email,
        preferred_contact_method,
        available_for_viewing,
        lease_terms: listing_type === 'rent' ? lease_terms : null,
        virtual_tour_url,
        video_url
      }])
      .select()
      .single();

    if (propertyError) {
      console.error('Property insertion error:', propertyError);
      return NextResponse.json(
        { error: 'Failed to submit property. Please try again.' },
        { status: 500 }
      );
    }

    // Add selected amenities to property_amenities table
    if (amenities.length > 0) {
      const amenityInserts = amenities.map(amenityId => ({
        property_id: property.id,
        amenity_id: amenityId,
        added_by: owner_id
      }));

      const { error: amenityError } = await supabase
        .from('property_amenities')
        .insert(amenityInserts);

      if (amenityError) {
        console.error('Amenity insertion error:', amenityError);
        // Don't fail the entire request, just log the error
      }
    }

    // Create property submission record for tracking
    const { error: submissionError } = await supabase
      .from('property_submissions')
      .insert([{
        property_id: property.id,
        submitted_by: owner_id,
        submission_data: propertyData,
        status_changes: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Property submitted for review'
        }]
      }]);

    if (submissionError) {
      console.error('Submission tracking error:', submissionError);
      // Don't fail the request, just log the error
    }

    // Get user information for email notifications
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', owner_id)
      .single();

    // Send notification email to user (confirmation)
    try {
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_USER_ID) {
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID,
          {
            to_email: contact_email,
            to_name: user?.name || 'Property Owner',
            from_name: 'Real Estate Platform',
            from_email: 'noreply@yoursite.com',
            subject: `Property Submission Confirmation - ${title}`,
            message: `Thank you for submitting your property "${title}" to our platform!

Your property has been received and is now pending review by our admin team. Here are the details:

Property: ${title}
Type: ${property_type.charAt(0).toUpperCase() + property_type.slice(1)}
Listing: ${listing_type === 'sale' ? 'For Sale' : listing_type === 'rent' ? 'For Rent' : 'For Lease'}
Price: $${price.toLocaleString()}
Location: ${address}, ${city}, ${state_province} ${zip_postal_code}

What happens next:
1. Our admin team will review your submission within 24-48 hours
2. You'll receive an email notification once your property is approved
3. Your property will then be visible to potential buyers/renters on our platform

If you have any questions, please contact us at ${process.env.DEFAULT_AGENT_EMAIL || 'support@yoursite.com'}.

Thank you for choosing our platform!

Best regards,
The Real Estate Platform Team`,
            property_title: title,
            property_id: property.id
          },
          {
            publicKey: process.env.EMAILJS_USER_ID,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );
      }
    } catch (emailError) {
      console.error('User confirmation email failed:', emailError);
    }

    // Send notification email to admin
    try {
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_USER_ID) {
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID,
          {
            to_email: process.env.ADMIN_EMAIL || process.env.DEFAULT_AGENT_EMAIL || 'admin@yoursite.com',
            to_name: 'Admin',
            from_name: 'Real Estate Platform',
            from_email: 'noreply@yoursite.com',
            subject: `New Property Submission Pending Review - ${title}`,
            message: `A new property has been submitted and requires admin review.

Property Details:
- Title: ${title}
- Type: ${property_type.charAt(0).toUpperCase() + property_type.slice(1)}
- Listing: ${listing_type === 'sale' ? 'For Sale' : listing_type === 'rent' ? 'For Rent' : 'For Lease'}
- Price: $${price.toLocaleString()}
- Location: ${address}, ${city}, ${state_province} ${zip_postal_code}
- Bedrooms: ${bedrooms || 'Not specified'}
- Bathrooms: ${bathrooms || 'Not specified'}
- Square Feet: ${sqft || 'Not specified'}

Owner Information:
- Name: ${user?.name || 'Not provided'}
- Email: ${contact_email}
- Phone: ${contact_phone || 'Not provided'}
- Preferred Contact: ${preferred_contact_method}

Property ID: ${property.id}
Submitted: ${new Date().toLocaleString()}

Please review and approve/reject this property submission in the admin dashboard.

Admin Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/properties`,
            property_title: title,
            property_id: property.id,
            owner_name: user?.name || 'Unknown',
            owner_email: contact_email
          },
          {
            publicKey: process.env.EMAILJS_USER_ID,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );
      } else {
        // Fallback: log admin notification for development
        console.log('=== NEW PROPERTY SUBMISSION NOTIFICATION ===');
        console.log('Property:', title);
        console.log('Type:', property_type);
        console.log('Price:', `$${price.toLocaleString()}`);
        console.log('Location:', `${address}, ${city}, ${state_province}`);
        console.log('Owner:', user?.name || 'Unknown', '(' + contact_email + ')');
        console.log('Property ID:', property.id);
        console.log('Status: Pending admin review');
        console.log('===========================================');
      }
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Property submitted successfully! You will receive an email confirmation shortly.',
        propertyId: property.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Property submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit property. Please try again later.' },
      { status: 500 }
    );
  }
}
