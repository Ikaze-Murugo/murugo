// Script to add test properties to the database
// Run this in your Supabase SQL Editor

const testProperties = [
  {
    title: "Modern Downtown Apartment",
    description: "Beautiful 2-bedroom apartment in the heart of downtown",
    property_type: "apartment",
    listing_type: "sale",
    status: "approved",
    is_featured: true,
    address: "123 Main St, Downtown",
    city: "New York",
    state_province: "NY",
    zip_postal_code: "10001",
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    year_built: 2020,
    owner_id: "00000000-0000-0000-0000-000000000001" // You'll need to replace this with a real user ID
  },
  {
    title: "Luxury Villa with Pool",
    description: "Stunning 4-bedroom villa with private pool and garden",
    property_type: "villa",
    listing_type: "sale",
    status: "approved",
    is_featured: true,
    address: "456 Oak Ave, Suburbs",
    city: "Los Angeles",
    state_province: "CA",
    zip_postal_code: "90210",
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2800,
    year_built: 2018,
    owner_id: "00000000-0000-0000-0000-000000000001"
  },
  {
    title: "Cozy Studio for Rent",
    description: "Perfect studio apartment for young professionals",
    property_type: "studio",
    listing_type: "rent",
    status: "approved",
    is_featured: true,
    address: "789 Pine St, Midtown",
    city: "Chicago",
    state_province: "IL",
    zip_postal_code: "60601",
    price: 1800,
    bedrooms: 0,
    bathrooms: 1,
    sqft: 600,
    year_built: 2019,
    owner_id: "00000000-0000-0000-0000-000000000001"
  }
];

// SQL to insert test properties
const insertSQL = `
-- First, let's create a test user if it doesn't exist
INSERT INTO users (id, email, name, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'homeowner')
ON CONFLICT (id) DO NOTHING;

-- Now insert test properties
INSERT INTO properties (
  title, description, property_type, listing_type, status, is_featured,
  address, city, state_province, zip_postal_code, price, bedrooms, bathrooms, sqft, year_built, owner_id
) VALUES 
('Modern Downtown Apartment', 'Beautiful 2-bedroom apartment in the heart of downtown', 'apartment', 'sale', 'approved', true, '123 Main St, Downtown', 'New York', 'NY', '10001', 450000, 2, 2, 1200, 2020, '00000000-0000-0000-0000-000000000001'),
('Luxury Villa with Pool', 'Stunning 4-bedroom villa with private pool and garden', 'villa', 'sale', 'approved', true, '456 Oak Ave, Suburbs', 'Los Angeles', 'CA', '90210', 1200000, 4, 3.5, 2800, 2018, '00000000-0000-0000-0000-000000000001'),
('Cozy Studio for Rent', 'Perfect studio apartment for young professionals', 'studio', 'rent', 'approved', true, '789 Pine St, Midtown', 'Chicago', 'IL', '60601', 1800, 0, 1, 600, 2019, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
`;

console.log('Copy and paste this SQL into your Supabase SQL Editor:');
console.log(insertSQL); 