# Vercel Analytics Setup Guide

## Step 1: Enable Vercel Analytics

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Analytics** tab
4. Click **Enable Analytics** if not already enabled

## Step 2: Get API Credentials

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Navigate to **Analytics** tab
4. Click on **Settings** (gear icon) in the top right
5. Go to **API** section
6. Copy your **Project ID** (found in the URL or project settings)
7. Click **Generate Token** to create an **Analytics Token**

**Note**: If you don't see the API section, make sure:
- Your project is deployed on Vercel
- Analytics is enabled for your project
- You have the necessary permissions (owner or admin)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with:

```env
VITE_VERCEL_PROJECT_ID=your_project_id_here
VITE_VERCEL_ANALYTICS_TOKEN=your_analytics_token_here
```

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Deploy to Vercel
3. Add the environment variables in your Vercel project settings

## Step 5: Test Analytics

1. Visit your deployed app
2. Navigate to `/admin` and then `/analytics`
3. You should see real analytics data

## Troubleshooting

### If you see mock data:
- Check that environment variables are set correctly
- Verify your Vercel Analytics is enabled
- Check browser console for API errors

### If API calls fail:
- Ensure your analytics token has proper permissions
- Verify your project ID is correct
- Check that your app is deployed on Vercel

## API Endpoints Used

The analytics service uses the Vercel Analytics API:
- Base URL: `https://vercel.com/api/v1/web/analytics`
- The service fetches various analytics data including:
  - Page views and traffic statistics
  - Geographic data (countries, cities)
  - Top pages and user behavior
  - Device and browser information
  - Real-time visitor data

**Important**: The actual API endpoints may vary based on Vercel's current API structure. The service includes fallback mock data if the API endpoints are not available.

## Fallback Behavior

If Vercel Analytics is not configured or API calls fail, the dashboard will automatically fall back to mock data to ensure the UI always works.

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- The analytics token should have read-only permissions
