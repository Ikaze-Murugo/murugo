// utils/favoritesQueries.js
import { supabase } from './supabaseClient'

// Add a property to user's favorites
export async function addToFavorites(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .insert([{
        user_id: userId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding to favorites:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in addToFavorites:', error)
    return { data: null, error }
  }
}

// Remove a property from user's favorites
export async function removeFromFavorites(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .select()

    if (error) {
      console.error('Error removing from favorites:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in removeFromFavorites:', error)
    return { data: null, error }
  }
}

// Check if a property is in user's favorites
export async function isFavorite(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking favorite status:', error)
      return { isFavorite: false, error }
    }

    return { isFavorite: !!data, error: null }
  } catch (error) {
    console.error('Error in isFavorite:', error)
    return { isFavorite: false, error }
  }
}

// Get all favorite properties for a user
export async function getUserFavorites(userId) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .select(`
        *,
        properties (
          *,
          agents (
            id,
            name,
            email,
            phone_number,
            company,
            position,
            bio,
            avatar_url
          ),
          property_amenities (
            amenities (
              id,
              name
            )
          ),
          property_images (
            sort_order,
            images (
              id,
              url,
              alt
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user favorites:', error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error in getUserFavorites:', error)
    return { data: [], error }
  }
}

// Get favorite count for a property (how many users favorited it)
export async function getFavoriteCount(propertyId) {
  try {
    const { count, error } = await supabase
      .from('favorite_properties')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)

    if (error) {
      console.error('Error getting favorite count:', error)
      return { count: 0, error }
    }

    return { count: count || 0, error: null }
  } catch (error) {
    console.error('Error in getFavoriteCount:', error)
    return { count: 0, error }
  }
}

// Get user's favorite property IDs (for quick lookups)
export async function getUserFavoriteIds(userId) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .select('property_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user favorite IDs:', error)
      return { data: [], error }
    }

    const favoriteIds = data?.map(item => item.property_id) || []
    return { data: favoriteIds, error: null }
  } catch (error) {
    console.error('Error in getUserFavoriteIds:', error)
    return { data: [], error }
  }
}

// Toggle favorite status (add if not favorite, remove if favorite)
export async function toggleFavorite(userId, propertyId) {
  try {
    const { isFavorite: favStatus } = await isFavorite(userId, propertyId)
    
    if (favStatus) {
      return await removeFromFavorites(userId, propertyId)
    } else {
      return await addToFavorites(userId, propertyId)
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error)
    return { data: null, error }
  }
}
