# Environment Variables Setup

## Your Vercel Project ID
```
prj_SqkPK1sqn1EYX5DSK6xOUakbRLcT
```

## Step 1: Create .env file

Create a `.env` file in your project root with:

```env
VITE_VERCEL_PROJECT_ID=prj_SqkPK1sqn1EYX5DSK6xOUakbRLcT
VITE_VERCEL_ANALYTICS_TOKEN=your_analytics_token_here
```

## Step 2: Get Your Analytics Token

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Navigate to **Analytics** tab
4. Click on **Settings** (gear icon) in the top right
5. Go to **API** section
6. Click **Generate Token** to create an **Analytics Token**
7. Copy the token and replace `your_analytics_token_here` in your `.env` file

## Step 3: Test Locally

1. Start your development server: `npm run dev`
2. Navigate to `/admin` and then `/analytics`
3. Check the browser console for any API errors
4. You should see real analytics data instead of mock data

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. In your Vercel project settings, add these environment variables:
   - `VITE_VERCEL_PROJECT_ID` = `prj_SqkPK1sqn1EYX5DSK6xOUakbRLcT`
   - `VITE_VERCEL_ANALYTICS_TOKEN` = `your_actual_token`

## Troubleshooting

If you see mock data:
- Check that your `.env` file is in the project root
- Verify the token is correct
- Make sure Analytics is enabled in your Vercel project
- Check browser console for API errors

## Security Note

Never commit your `.env` file to version control. It should be in your `.gitignore` file.
