# 🏠 Real Estate Platform MVP

A comprehensive real estate platform built with Next.js, Supabase, and modern web technologies. This platform allows users to browse properties, homeowners to list properties, and admins to manage the entire system.

## 🌟 Features

### For Property Browsers (Users)
- Browse and search properties with advanced filters
- Save favorite properties
- Contact property owners directly
- Schedule property viewings
- User authentication and profile management

### For Property Owners (Homeowners)
- Submit properties for listing
- Manage property listings (`/my-properties`)
- Edit property details and amenities
- Track property analytics (views, inquiries, favorites)
- Receive inquiry notifications

### For Administrators
- Complete admin dashboard (`/admin`)
- Approve/reject property submissions
- Manage users and roles
- Message and inquiry management
- Review moderation system
- Platform analytics and insights

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Bootstrap 5, SCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: EmailJS
- **Maps**: Google Maps API
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before getting started, ensure you have:

- Node.js 18+ installed
- A Supabase account
- A Google Cloud account (for Maps API)
- An EmailJS account
- Git installed

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd real-estate-platform
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_OWNER_TEMPLATE_ID=your_emailjs_owner_template_id
EMAILJS_CONFIRMATION_TEMPLATE_ID=your_emailjs_confirmation_template_id
EMAILJS_USER_ID=your_emailjs_user_id
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
DEFAULT_AGENT_EMAIL=admin@yoursite.com

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@yoursite.com
```

### 3. Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the SQL schema** from `SUPABASE_SETUP.md`:
   - Copy the entire SQL schema
   - Go to Supabase Dashboard → SQL Editor
   - Paste and execute the schema

3. **Enable Row Level Security (RLS)**:
   - The schema includes all necessary RLS policies
   - Verify they're enabled in Authentication → Policies

4. **Configure Storage** (if using image uploads):
   - Go to Storage → Create bucket named `property-images`
   - Set appropriate policies for public access

### 4. EmailJS Setup

1. **Create EmailJS account** at [emailjs.com](https://emailjs.com)

2. **Create email templates**:
   - Owner Notification Template: For notifying property owners of new inquiries
   - Confirmation Template: For confirming message sent to users
   - General Template: For other notifications

3. **Get your credentials**:
   - Service ID
   - Template IDs
   - User ID (Public Key)
   - Private Key

### 5. Google Maps Setup

1. **Enable Google Maps JavaScript API**:
   - Go to Google Cloud Console
   - Enable Maps JavaScript API
   - Create API key
   - Restrict API key to your domains

### 6. Create Admin User

After setting up the database:

1. Register a normal user through the app
2. Update their role to admin in Supabase:

```sql
UPDATE users 
SET role = 'admin', verification_status = 'verified' 
WHERE email = 'admin@yoursite.com';
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Visit `http://localhost:3000` to see the application.

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
real-estate-platform/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin-only pages
│   │   └── admin/
│   │       ├── page.jsx          # Admin dashboard
│   │       ├── properties/       # Property management
│   │       ├── users/            # User management
│   │       ├── messages/         # Message management
│   │       └── reviews/          # Review moderation
│   ├── (dashboard)/              # User dashboard pages
│   │   ├── dashboard/
│   │   └── my-properties/        # Homeowner property management
│   ├── (submit)/                 # Property submission
│   ├── api/                      # API routes
│   │   ├── properties/           # Property-related APIs
│   │   └── messages/             # Message-related APIs
│   ├── property-details-v1/      # Property detail pages
│   └── layout.js                 # Root layout
├── components/                   # Reusable components
│   ├── common/                   # Common components
│   ├── forms/                    # Form components
│   ├── headers/                  # Header components
│   ├── footer/                   # Footer components
│   ├── modals/                   # Modal components
│   └── property/                 # Property-specific components
├── context/                      # React Context
│   └── AuthContext.js            # Authentication context
├── utils/                        # Utility functions
│   ├── supabaseClient.js         # Supabase client
│   ├── propertyQueries.js        # Property-related queries
│   └── adminQueries.js           # Admin-related queries
├── styles/                       # Global styles
├── public/                       # Static assets
├── SUPABASE_SETUP.md            # Database schema and setup
└── README.md                    # This file
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub/GitLab**

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Update environment variables**:
   - Update `NEXT_PUBLIC_SITE_URL` to your production URL
   - Ensure all other environment variables are set

4. **Update Supabase settings**:
   - Add your production URL to Supabase auth settings
   - Update redirect URLs if needed

### Other Deployment Options

- **Netlify**: Similar process to Vercel
- **Railway**: Direct deployment from GitHub
- **DigitalOcean App Platform**: Container-based deployment
- **AWS Amplify**: AWS-based deployment

## 🔐 Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **API Keys**: Restrict Google Maps API key to your domains
- **Supabase RLS**: Ensure Row Level Security policies are properly configured
- **User Roles**: Verify admin access controls are working
- **Input Validation**: All forms include proper validation

## 🧪 Testing

### Manual Testing Checklist

#### User Registration & Authentication:
- [ ] User can register with different roles
- [ ] Login/logout functionality works
- [ ] Password reset works
- [ ] Profile updates work

#### Property Browsing:
- [ ] Property listings display correctly
- [ ] Search and filters work
- [ ] Property details page loads
- [ ] Contact forms work

#### Property Management (Homeowners):
- [ ] Property submission works
- [ ] My Properties dashboard loads
- [ ] Property editing works
- [ ] Property analytics display

#### Admin Functions:
- [ ] Admin dashboard loads
- [ ] Property approval/rejection works
- [ ] User management works
- [ ] Message management works
- [ ] Review moderation works

#### Email Notifications:
- [ ] Property inquiry emails sent
- [ ] Confirmation emails sent
- [ ] Admin notifications work

## 🐛 Troubleshooting

### Common Issues

#### Supabase Connection Issues:
- Verify environment variables
- Check Supabase project URL and keys
- Ensure RLS policies are configured

#### Email Not Sending:
- Verify EmailJS credentials
- Check template IDs
- Ensure service is active

#### Google Maps Not Loading:
- Verify API key is correct
- Check if Maps JavaScript API is enabled
- Ensure API key restrictions are set correctly

#### Build Errors:
- Clear `.next` folder and rebuild
- Check for missing dependencies
- Verify environment variables in production

### Getting Help
- Check browser console for errors
- Review Supabase logs
- Check Vercel function logs (if deployed on Vercel)
- Verify all environment variables are set

## 📝 Database Schema

The complete database schema is available in `SUPABASE_SETUP.md`, including:

- **Users table**: User profiles and roles
- **Properties table**: Property listings
- **Messages table**: Inquiries and communications
- **Reviews table**: Property and user reviews
- **Amenities table**: Property features
- **Property submissions**: Approval workflow
- **Notifications**: User notifications
- **Analytics tables**: View tracking and favorites

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

#### Database Maintenance:
- Monitor database usage
- Clean up old notifications
- Archive old messages

#### Security Updates:
- Keep dependencies updated
- Monitor for security vulnerabilities
- Review and update RLS policies

#### Performance Monitoring:
- Monitor page load times
- Check database query performance
- Monitor email delivery rates

### Adding New Features

The platform is designed to be easily extensible:

- **New Property Types**: Add to the `property_type` enum
- **Additional Amenities**: Insert into `amenities` table
- **New User Roles**: Update `role` enum and add appropriate permissions
- **Custom Fields**: Add columns to `properties` table with migrations

## 📊 Analytics & Monitoring

The platform includes built-in analytics:

- Property view tracking
- Inquiry counting
- User engagement metrics
- Admin dashboard statistics

For advanced analytics, consider integrating:
- Google Analytics
- Mixpanel
- PostHog
- Custom analytics dashboard

## 🤝 Contributing

When contributing to this project:

- Follow the existing code structure
- Add appropriate comments and documentation
- Test all functionality before submitting
- Update this README if adding new features
- Ensure all environment variables are documented

## 📄 License

This project is provided as-is for educational and commercial use. Please ensure you comply with all third-party service terms of use (Supabase, EmailJS, Google Maps, etc.).