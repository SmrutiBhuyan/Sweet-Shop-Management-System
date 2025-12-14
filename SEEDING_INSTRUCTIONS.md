# Database Seeding Instructions

## Quick Start

To seed the database with sample sweets, run:

```bash
cd backend
npm run seed
```

This will:
1. Create an admin user (if one doesn't exist)
2. Clear existing sweets
3. Add 12 sample sweets to the database

## Admin Credentials

After seeding, you can login with:
- **Email**: `admin@sweetshop.com`
- **Password**: `admin123`
- **Role**: Admin

## What Gets Seeded

The seed script creates:
- 12 different sweets across various categories
- An admin user to manage the shop
- Sample data with realistic prices and quantities

## Adding More Sweets

After seeding, you can:
1. Login as admin
2. Go to "Add Sweet" from the navbar
3. Fill in the form and add more sweets
4. All sweets will appear on the homepage

## Resetting the Database

To clear and reseed the database:

```bash
cd backend
npm run seed
```

This will delete all existing sweets and create fresh sample data.

## Manual Seeding

If you prefer to seed manually:

1. Start the backend server: `npm run dev`
2. Login as admin
3. Navigate to Admin Panel
4. Click "Add New Sweet"
5. Fill in the form for each sweet you want to add

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `.env` file has the correct `MONGODB_URI`

### Seeding Fails
- Check that MongoDB is accessible
- Verify the database connection string
- Make sure you have write permissions

### No Sweets Appearing
- Check browser console for errors
- Verify backend is running on port 5000
- Check that API calls are successful in Network tab

