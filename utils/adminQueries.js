import { supabase } from './supabaseClient';

// =============================================
// ADMIN PROPERTY MANAGEMENT
// =============================================

export async function getAllPropertiesForAdmin(filters = {}) {
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
          company
        ),
        approved_by_user:users!properties_approved_by_fkey (
          id,
          name
        ),
        images (
          id,
          url,
          thumbnail_url,
          is_primary,
          sort_order
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    
    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties for admin:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getAllPropertiesForAdmin:', error);
    return { data: [], error };
  }
}

export async function updatePropertyStatus(propertyId, status, adminId, notes = '') {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      updates.approved_by = adminId;
      updates.approved_at = new Date().toISOString();
      updates.published_at = new Date().toISOString();
    }

    if (status === 'rejected') {
      updates.rejection_reason = notes;
    }

    if (notes && status !== 'rejected') {
      updates.admin_notes = notes;
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property status:', error);
      return { data: null, error };
    }

    // Update property submission tracking
    await updatePropertySubmissionStatus(propertyId, status, notes);

    return { data, error: null };
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error);
    return { data: null, error };
  }
}

export async function updatePropertySubmissionStatus(propertyId, status, notes = '') {
  try {
    // Get existing submission
    const { data: submission } = await supabase
      .from('property_submissions')
      .select('status_changes')
      .eq('property_id', propertyId)
      .single();

    const existingChanges = submission?.status_changes || [];
    const newChange = {
      status,
      timestamp: new Date().toISOString(),
      note: notes || `Property ${status} by admin`
    };

    await supabase
      .from('property_submissions')
      .update({
        status_changes: [...existingChanges, newChange],
        admin_feedback: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('property_id', propertyId);

  } catch (error) {
    console.error('Error updating property submission status:', error);
  }
}

// =============================================
// ADMIN USER MANAGEMENT
// =============================================

export async function getAllUsersForAdmin(filters = {}) {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.role) {
      if (Array.isArray(filters.role)) {
        query = query.in('role', filters.role);
      } else {
        query = query.eq('role', filters.role);
      }
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users for admin:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getAllUsersForAdmin:', error);
    return { data: [], error };
  }
}

export async function updateUserStatus(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return { data: null, error };
  }
}

// =============================================
// ADMIN ANALYTICS
// =============================================

export async function getAdminDashboardStats() {
  try {
    // Get property counts by status
    const { data: propertyStats } = await supabase
      .from('properties')
      .select('status')
      .then(({ data }) => {
        const stats = {
          total: data?.length || 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
        
        data?.forEach(property => {
          if (property.status in stats) {
            stats[property.status]++;
          }
        });
        
        return { data: stats };
      });

    // Get user counts by role
    const { data: userStats } = await supabase
      .from('users')
      .select('role, is_active')
      .then(({ data }) => {
        const stats = {
          total: data?.length || 0,
          users: 0,
          homeowners: 0,
          agents: 0,
          admins: 0,
          active: 0,
          inactive: 0
        };
        
        data?.forEach(user => {
          if (user.role in stats) {
            stats[user.role]++;
          }
          if (user.is_active) {
            stats.active++;
          } else {
            stats.inactive++;
          }
        });
        
        return { data: stats };
      });

    // Get recent activity counts
    const { data: recentActivity } = await supabase
      .from('properties')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .then(({ data }) => ({ data: { submissions_this_week: data?.length || 0 } }));

    // Get message counts
    const { data: messageStats } = await supabase
      .from('messages')
      .select('is_read')
      .then(({ data }) => {
        const stats = {
          total: data?.length || 0,
          unread: data?.filter(m => !m.is_read).length || 0
        };
        return { data: stats };
      });

    return {
      properties: propertyStats,
      users: userStats,
      activity: recentActivity,
      messages: messageStats,
      error: null
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      properties: { total: 0, pending: 0, approved: 0, rejected: 0 },
      users: { total: 0, users: 0, homeowners: 0, agents: 0, admins: 0, active: 0, inactive: 0 },
      activity: { submissions_this_week: 0 },
      messages: { total: 0, unread: 0 },
      error
    };
  }
}

// =============================================
// ADMIN MESSAGE MANAGEMENT
// =============================================

export async function getAllMessagesForAdmin(filters = {}) {
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        property:properties (
          id,
          title,
          address,
          city
        ),
        sender:users!messages_sender_id_fkey (
          id,
          name,
          email
        ),
        recipient:users!messages_recipient_id_fkey (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.property_id) {
      query = query.eq('property_id', filters.property_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages for admin:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getAllMessagesForAdmin:', error);
    return { data: [], error };
  }
}

export async function markMessageAsRead(messageId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        is_read: true,
        status: 'read'
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error marking message as read:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    return { data: null, error };
  }
}

// =============================================
// ADMIN REVIEW MANAGEMENT
// =============================================

export async function getAllReviewsForAdmin(filters = {}) {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        property:properties (
          id,
          title,
          address,
          city
        ),
        user:users!reviews_user_id_fkey (
          id,
          name,
          email
        ),
        moderated_by_user:users!reviews_moderated_by_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.property_id) {
      query = query.eq('property_id', filters.property_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews for admin:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getAllReviewsForAdmin:', error);
    return { data: [], error };
  }
}

export async function updateReviewStatus(reviewId, status, adminId, moderationNote = '') {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        status,
        moderated_by: adminId,
        moderated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateReviewStatus:', error);
    return { data: null, error };
  }
}

// =============================================
// ADMIN UTILITIES
// =============================================

export async function bulkUpdateProperties(propertyIds, updates) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', propertyIds)
      .select();

    if (error) {
      console.error('Error bulk updating properties:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in bulkUpdateProperties:', error);
    return { data: null, error };
  }
}

export async function deleteProperty(propertyId) {
  try {
    // This will cascade delete related records due to foreign key constraints
    const { data, error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting property:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    return { data: null, error };
  }
}