// utils/reviewQueries.js
import { supabase } from './supabaseClient'

// Get all reviews for a property
export async function getPropertyReviews(propertyId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users!reviews_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('property_id', propertyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return { reviews: [], error: error.message };
    }

    return { reviews: data || [], error: null };
  } catch (err) {
    console.error('Error in getPropertyReviews:', err);
    return { reviews: [], error: 'Failed to fetch reviews' };
  }
}

// Add a new review
export async function addReview(reviewData) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        created_at: new Date().toISOString(),
        status: 'pending', // Reviews start as pending for moderation
        helpful_count: 0,
        not_helpful_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding review:', error);
      return { review: null, error: error.message };
    }

    return { review: data, error: null };
  } catch (err) {
    console.error('Error in addReview:', err);
    return { review: null, error: 'Failed to add review' };
  }
}

// Get review statistics for a property
export async function getReviewStats(propertyId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('property_id', propertyId)
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching review stats:', error);
      return { stats: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { 
        stats: { 
          averageRating: 0, 
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }, 
        error: null 
      };
    }

    const totalReviews = data.length;
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return { 
      stats: { 
        averageRating: Math.round(averageRating * 10) / 10, 
        totalReviews,
        ratingDistribution
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Error in getReviewStats:', err);
    return { stats: null, error: 'Failed to fetch review statistics' };
  }
}

// Mark review as helpful or not helpful
export async function markReviewHelpful(reviewId, userId, isHelpful) {
  try {
    // First check if user has already voted on this review
    const { data: existingVote, error: voteError } = await supabase
      .from('review_votes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (voteError && voteError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing vote:', voteError);
      return { success: false, error: voteError.message };
    }

    if (existingVote) {
      // User has already voted, update their vote if different
      if (existingVote.is_helpful !== isHelpful) {
        const { error: updateError } = await supabase
          .from('review_votes')
          .update({ is_helpful: isHelpful, created_at: new Date().toISOString() })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return { success: false, error: updateError.message };
        }
      }
    } else {
      // New vote
      const { error: insertError } = await supabase
        .from('review_votes')
        .insert([{
          review_id: reviewId,
          user_id: userId,
          is_helpful: isHelpful,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error inserting vote:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    // Update the review counts
    await updateReviewHelpfulCounts(reviewId);

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in markReviewHelpful:', err);
    return { success: false, error: 'Failed to record vote' };
  }
}

// Update helpful counts for a review (internal function)
async function updateReviewHelpfulCounts(reviewId) {
  try {
    const { data: votes, error } = await supabase
      .from('review_votes')
      .select('is_helpful')
      .eq('review_id', reviewId);

    if (error) {
      console.error('Error fetching votes for count update:', error);
      return;
    }

    const helpfulCount = votes.filter(vote => vote.is_helpful).length;
    const notHelpfulCount = votes.filter(vote => !vote.is_helpful).length;

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        helpful_count: helpfulCount,
        not_helpful_count: notHelpfulCount
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review counts:', updateError);
    }
  } catch (err) {
    console.error('Error in updateReviewHelpfulCounts:', err);
  }
}

// Check if user has already reviewed a property
export async function hasUserReviewedProperty(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking user review:', error);
      return { hasReviewed: false, error: error.message };
    }

    return { hasReviewed: !!data, error: null };
  } catch (err) {
    console.error('Error in hasUserReviewedProperty:', err);
    return { hasReviewed: false, error: 'Failed to check review status' };
  }
}

// Get user's vote on a specific review
export async function getUserVoteOnReview(userId, reviewId) {
  try {
    const { data, error } = await supabase
      .from('review_votes')
      .select('is_helpful')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user vote:', error);
      return { vote: null, error: error.message };
    }

    return { vote: data?.is_helpful ?? null, error: null };
  } catch (err) {
    console.error('Error in getUserVoteOnReview:', err);
    return { vote: null, error: 'Failed to fetch vote' };
  }
}
