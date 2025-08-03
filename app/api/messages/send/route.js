import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import emailjs from '@emailjs/nodejs';

export async function POST(request) {
  try {
    const messageData = await request.json();

    // Validate required fields
    if (!messageData.sender_name || !messageData.sender_email || !messageData.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message' },
        { status: 400 }
      );
    }

    // Get property and owner information
    let propertyInfo = null;
    let ownerInfo = null;

    if (messageData.property_id) {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          owner:users!properties_owner_id_fkey (
            id,
            name,
            email,
            phone_number,
            email_notifications
          )
        `)
        .eq('id', messageData.property_id)
        .single();

      if (propertyError) {
        console.error('Error fetching property:', propertyError);
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      propertyInfo = property;
      ownerInfo = property.owner;
    }

    // Insert message into database
    const dbMessageData = {
      property_id: messageData.property_id || null,
      sender_id: messageData.sender_id || null,
      sender_name: messageData.sender_name.trim(),
      sender_email: messageData.sender_email.trim(),
      sender_phone: messageData.sender_phone || null,
      subject: messageData.subject || 'Property Inquiry',
      message: messageData.message.trim(),
      message_type: messageData.message_type || 'inquiry',
      preferred_contact_method: messageData.preferred_contact_method || 'email',
      viewing_requested: messageData.viewing_requested || false,
      viewing_date: messageData.viewing_date || null,
      viewing_time: messageData.viewing_time || null,
      status: 'new',
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert(dbMessageData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message:', saveError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Update property inquiry count
    if (messageData.property_id) {
      await supabase.rpc('increment_property_counter', {
        property_id: messageData.property_id,
        counter_type: 'inquiry'
      });
    }

    // Send email notifications
    try {
      // Email to property owner
      if (ownerInfo && ownerInfo.email && ownerInfo.email_notifications !== false) {
        const ownerEmailData = {
          to_email: ownerInfo.email,
          to_name: ownerInfo.name,
          from_name: messageData.sender_name,
          from_email: messageData.sender_email,
          from_phone: messageData.sender_phone || 'Not provided',
          property_title: propertyInfo?.title || 'General Inquiry',
          property_address: propertyInfo ? `${propertyInfo.address}, ${propertyInfo.city}` : 'N/A',
          message_type: messageData.message_type,
          subject: messageData.subject,
          message: messageData.message,
          viewing_requested: messageData.viewing_requested ? 'Yes' : 'No',
          viewing_date: messageData.viewing_date || 'Not specified',
          viewing_time: messageData.viewing_time || 'Not specified',
          preferred_contact: messageData.preferred_contact_method,
          property_url: propertyInfo ? `${process.env.NEXT_PUBLIC_SITE_URL}/property-details-v1/${propertyInfo.id}` : '',
          dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        };

        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_OWNER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
          ownerEmailData,
          {
            publicKey: process.env.EMAILJS_USER_ID,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );
      }

      // Confirmation email to sender
      const senderEmailData = {
        to_email: messageData.sender_email,
        to_name: messageData.sender_name,
        property_title: propertyInfo?.title || 'General Inquiry',
        property_address: propertyInfo ? `${propertyInfo.address}, ${propertyInfo.city}` : 'N/A',
        message_type: messageData.message_type,
        message: messageData.message,
        owner_name: ownerInfo?.name || 'Property Owner',
        property_url: propertyInfo ? `${process.env.NEXT_PUBLIC_SITE_URL}/property-details-v1/${propertyInfo.id}` : '',
        site_name: 'Real Estate Platform',
        site_url: process.env.NEXT_PUBLIC_SITE_URL
      };

      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_CONFIRMATION_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
        senderEmailData,
        {
          publicKey: process.env.EMAILJS_USER_ID,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    // Create notification for property owner
    if (ownerInfo) {
      const notificationData = {
        user_id: ownerInfo.id,
        type: 'property_inquiry',
        title: 'New Property Inquiry',
        message: `You received a new inquiry for "${propertyInfo?.title}" from ${messageData.sender_name}`,
        data: {
          property_id: messageData.property_id,
          message_id: savedMessage.id,
          sender_name: messageData.sender_name
        },
        is_read: false,
        created_at: new Date().toISOString()
      };

      await supabase
        .from('notifications')
        .insert(notificationData);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message_id: savedMessage.id,
        property_title: propertyInfo?.title,
        owner_name: ownerInfo?.name
      }
    });

  } catch (error) {
    console.error('Message sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}