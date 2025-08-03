# 🏠 Real Estate Platform - Complete Database Setup

## 📊 **FINAL PRODUCTION-READY SCHEMA**

Execute this SQL in your Supabase SQL Editor:

```sql
-- =============================================
-- 1. ENHANCED CORE TABLES
-- =============================================

-- Enhanced users table with comprehensive user management
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'homeowner', 'agent', 'admin')),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    zip_postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    bio TEXT,
    license_number VARCHAR(100), -- For agents
    company VARCHAR(255), -- For agents
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB, -- Store document URLs/info
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced properties table with complete property management
CREATE TABLE properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- The homeowner who submitted
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional assigned agent
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'villa', 'studio', 'office', 'land', 'commercial')),
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent', 'lease')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'sold', 'rented', 'inactive', 'draft')),
    
    -- Location details
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    zip_postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    neighborhood VARCHAR(100),
    
    -- Property specifications
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2), -- Track price changes
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    garage_spaces INTEGER,
    floors INTEGER,
    parking_spaces INTEGER,
    
    -- Additional details
    is_furnished BOOLEAN DEFAULT false,
    pets_allowed BOOLEAN DEFAULT false,
    smoking_allowed BOOLEAN DEFAULT false,
    utilities_included JSONB, -- ["electricity", "water", "gas", "internet"]
    lease_terms JSONB, -- For rentals: minimum lease, deposit info, etc.
    
    -- Homeowner contact preferences
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    available_for_viewing JSONB, -- Available days/times for showings
    
    -- Admin fields
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO and features
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP WITH TIME ZONE,
    virtual_tour_url TEXT,
    video_url TEXT,
    listing_url_slug VARCHAR(255) UNIQUE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Property images with enhanced metadata
CREATE TABLE images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT, -- Optimized small version
    alt TEXT,
    caption TEXT,
    image_type VARCHAR(50) DEFAULT 'interior' CHECK (image_type IN ('exterior', 'interior', 'bathroom', 'kitchen', 'bedroom', 'living_room', 'dining_room', 'garage', 'yard', 'amenity', 'floor_plan', 'other')),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    file_size INTEGER, -- in bytes
    width INTEGER,
    height INTEGER,
    storage_path TEXT, -- Supabase storage path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced amenities with categorization
CREATE TABLE amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'interior', 'exterior', 'appliances', 'security', 'accessibility', 'community')),
    icon VARCHAR(100), -- CSS class or icon identifier
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property amenities junction table
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    added_by UUID REFERENCES users(id), -- Track who added this amenity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (property_id, amenity_id)
);

-- Enhanced messages table for comprehensive communication
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Property owner or agent
    sender_name VARCHAR(255), -- For non-registered users
    sender_email VARCHAR(255), -- For non-registered users
    sender_phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'inquiry' CHECK (message_type IN ('inquiry', 'viewing_request', 'offer', 'general', 'admin')),
    inquiry_details JSONB, -- Store structured inquiry data
    is_read BOOLEAN DEFAULT false,
    replied_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES messages(id), -- For threaded conversations
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced favorite properties
CREATE TABLE favorite_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT, -- User's private notes about the property
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Enhanced reviews system
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(255), -- For non-registered users
    reviewer_email VARCHAR(255), -- For non-registered users
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    review_type VARCHAR(50) DEFAULT 'general' CHECK (review_type IN ('general', 'rental_experience', 'viewing_experience', 'agent_review', 'owner_review')),
    images JSONB, -- Array of image URLs
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    response_from_owner TEXT, -- Owner can respond to reviews
    response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review votes
CREATE TABLE review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Property submission workflow tracking
CREATE TABLE property_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Store original submission data
    admin_feedback TEXT,
    status_changes JSONB, -- Track status change history
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved searches for users
CREATE TABLE saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_criteria JSONB NOT NULL, -- Store search parameters
    email_alerts BOOLEAN DEFAULT false,
    last_notification_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property views analytics
CREATE TABLE property_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous views
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('property_approved', 'property_rejected', 'new_message', 'new_review', 'new_inquiry', 'system_update')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Property indexes
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state_province ON properties(state_province);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX idx_properties_sqft ON properties(sqft);
CREATE INDEX idx_properties_location ON properties USING GIST(point(longitude, latitude));
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_published_at ON properties(published_at);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);

-- Image indexes
CREATE INDEX idx_images_property_id ON images(property_id);
CREATE INDEX idx_images_sort_order ON images(sort_order);
CREATE INDEX idx_images_is_primary ON images(is_primary);

-- Message indexes
CREATE INDEX idx_messages_property_id ON messages(property_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_parent_id ON messages(parent_message_id);

-- Analytics indexes
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view verified agents" ON users FOR SELECT USING (role = 'agent' AND verification_status = 'verified');
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Properties policies
CREATE POLICY "Anyone can view approved properties" ON properties FOR SELECT USING (status = 'approved');
CREATE POLICY "Property owners can view their own properties" ON properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Property owners can insert their own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Property owners can update their own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all properties" ON properties FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Images policies
CREATE POLICY "Anyone can view images of approved properties" ON images FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND status = 'approved')
);
CREATE POLICY "Property owners can manage their property images" ON images FOR ALL USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all images" ON images FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Amenities policies
CREATE POLICY "Anyone can view active amenities" ON amenities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage amenities" ON amenities FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Property amenities policies
CREATE POLICY "Anyone can view property amenities" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Property owners can manage their property amenities" ON property_amenities FOR ALL USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id OR
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Recipients can update message read status" ON messages FOR UPDATE USING (
    auth.uid() = recipient_id OR
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all messages" ON messages FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Favorites policies
CREATE POLICY "Users can manage their own favorites" ON favorite_properties FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can submit reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Review votes policies
CREATE POLICY "Users can manage their own votes" ON review_votes FOR ALL USING (auth.uid() = user_id);

-- Property submissions policies
CREATE POLICY "Users can view their own submissions" ON property_submissions FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Users can create submissions" ON property_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can view all submissions" ON property_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Saved searches policies
CREATE POLICY "Users can manage their own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Property views policies  
CREATE POLICY "Anyone can create property views" ON property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own property views" ON property_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Property owners can view views of their properties" ON property_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all property views" ON property_views FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- 4. TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_submissions_updated_at BEFORE UPDATE ON property_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update property counters
CREATE OR REPLACE FUNCTION update_property_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Update favorite count
    IF TG_TABLE_NAME = 'favorite_properties' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE properties SET favorite_count = favorite_count + 1 WHERE id = NEW.property_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE properties SET favorite_count = favorite_count - 1 WHERE id = OLD.property_id;
        END IF;
    END IF;
    
    -- Update inquiry count
    IF TG_TABLE_NAME = 'messages' AND NEW.message_type = 'inquiry' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE properties SET inquiry_count = inquiry_count + 1 WHERE id = NEW.property_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply counter triggers
CREATE TRIGGER update_favorite_count AFTER INSERT OR DELETE ON favorite_properties FOR EACH ROW EXECUTE FUNCTION update_property_counters();
CREATE TRIGGER update_inquiry_count AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_property_counters();

-- =============================================
-- 5. INITIAL AMENITIES DATA
-- =============================================

INSERT INTO amenities (name, category, description, sort_order) VALUES
-- Interior amenities
('Air Conditioning', 'interior', 'Central or window unit air conditioning', 1),
('Heating', 'interior', 'Central heating system', 2),
('Hardwood Floors', 'interior', 'Beautiful hardwood flooring throughout', 3),
('Carpet', 'interior', 'Carpeted floors in bedrooms and living areas', 4),
('Tile Flooring', 'interior', 'Tile floors in kitchen and bathrooms', 5),
('Walk-in Closet', 'interior', 'Spacious walk-in closet in master bedroom', 6),
('Fireplace', 'interior', 'Wood-burning or gas fireplace', 7),
('High Ceilings', 'interior', 'Vaulted or high ceilings', 8),
('Basement', 'interior', 'Finished or unfinished basement space', 9),
('Attic', 'interior', 'Accessible attic storage space', 10),

-- Appliances
('Dishwasher', 'appliances', 'Built-in dishwasher', 11),
('Washer/Dryer', 'appliances', 'In-unit washer and dryer', 12),
('Refrigerator', 'appliances', 'Full-size refrigerator included', 13),
('Stove/Oven', 'appliances', 'Electric or gas stove and oven', 14),
('Microwave', 'appliances', 'Built-in or countertop microwave', 15),
('Garbage Disposal', 'appliances', 'Kitchen garbage disposal unit', 16),

-- Exterior amenities
('Balcony', 'exterior', 'Private balcony or patio', 17),
('Patio', 'exterior', 'Outdoor patio space', 18),
('Yard', 'exterior', 'Private front or back yard', 19),
('Garden', 'exterior', 'Landscaped garden area', 20),
('Pool', 'exterior', 'Swimming pool on property', 21),
('Hot Tub', 'exterior', 'Outdoor hot tub or spa', 22),
('Deck', 'exterior', 'Wooden deck for outdoor entertaining', 23),
('Fence', 'exterior', 'Fenced yard for privacy', 24),
('Garage', 'exterior', 'Attached or detached garage', 25),
('Carport', 'exterior', 'Covered parking space', 26),
('Driveway', 'exterior', 'Private driveway', 27),

-- Security
('Security System', 'security', 'Home security system installed', 28),
('Gated Community', 'security', 'Property in gated community', 29),
('Doorman', 'security', '24-hour doorman service', 30),
('Intercom', 'security', 'Intercom system for building access', 31),

-- Community amenities
('Gym/Fitness Center', 'community', 'On-site fitness facilities', 32),
('Playground', 'community', 'Children''s playground on property', 33),
('Tennis Court', 'community', 'Tennis court access', 34),
('Basketball Court', 'community', 'Basketball court on property', 35),
('Clubhouse', 'community', 'Community clubhouse', 36),
('Business Center', 'community', 'Business center with computers and printers', 37),

-- Accessibility
('Wheelchair Accessible', 'accessibility', 'Wheelchair accessible entrances and bathrooms', 38),
('Elevator', 'accessibility', 'Elevator access to upper floors', 39),
('Ramp Access', 'accessibility', 'Ramp access to entrance', 40),

-- General
('Pet Friendly', 'general', 'Pets allowed with restrictions', 41),
('Furnished', 'general', 'Fully furnished unit', 42),
('Utilities Included', 'general', 'Some or all utilities included in rent', 43),
('Internet Included', 'general', 'High-speed internet included', 44),
('Cable TV', 'general', 'Cable TV service included', 45),
('Storage Unit', 'general', 'Additional storage space available', 46),
('Concierge', 'general', 'Concierge service available', 47),
('Parking Space', 'general', 'Designated parking space included', 48);
