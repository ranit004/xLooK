# XLook Deployment Guide

This guide provides step-by-step instructions for deploying the XLook URL Safety Checker application.

## 🚀 Deployment Status

### Frontend (Vercel)
- **Status**: ✅ Deployed
- **URL**: https://xlook-orm7keo62-ranitisking-gmailcoms-projects.vercel.app
- **Platform**: Vercel
- **Framework**: Next.js 15.3.5

### Backend (Render)
- **Status**: ⏳ Ready for deployment
- **Platform**: Render
- **Framework**: Node.js with Express

## 📋 Prerequisites

Before deploying, ensure you have:

1. **API Keys**:
   - VirusTotal API key
   - Google Safe Browsing API key (optional)
   - IPInfo API key (optional)
   - OpenAI API key (for AI analysis)

2. **Database**:
   - MongoDB connection string (Atlas or self-hosted)

3. **Accounts**:
   - Vercel account (for frontend) ✅
   - Render account (for backend)

## 🎯 Frontend Deployment (Vercel) - COMPLETED

The frontend has been successfully deployed to Vercel with the following configuration:

### Environment Variables (Already Set)
- `VIRUSTOTAL_API_KEY`: ✅ Configured
- `MONGO_URI`: ✅ Configured
- `JWT_SECRET`: ✅ Configured
- `JWT_EXPIRES_IN`: ✅ Configured
- `OPENAI_API_KEY`: ✅ Configured

### Access the Application
🔗 **Live Frontend**: https://xlook-orm7keo62-ranitisking-gmailcoms-projects.vercel.app

## 🔧 Backend Deployment (Render) - NEXT STEPS

### Option 1: Manual Deployment (Recommended)

1. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Sign up or log in to your account

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `ranit004/xLooK`

3. **Configure the Service**:
   ```
   Name: xlook-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   ALLOWED_ORIGIN=https://xlook-orm7keo62-ranitisking-gmailcoms-projects.vercel.app
   MONGO_URI=your_mongodb_connection_string
   VIRUSTOTAL_API_KEY=your_virustotal_api_key
   GOOGLE_SAFE_BROWSING_API_KEY=your_google_safe_browsing_api_key
   IPINFO_API_KEY=your_ipinfo_api_key
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete

### Option 2: Automated Deployment (GitHub Actions)

1. **Set up GitHub Secrets**:
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add the following secrets:
     - `RENDER_API_TOKEN`: Your Render API token
     - `MONGO_URI`: Your MongoDB connection string
     - `VIRUSTOTAL_API_KEY`: Your VirusTotal API key
     - `GOOGLE_SAFE_BROWSING_API_KEY`: Your Google Safe Browsing API key
     - `IPINFO_API_KEY`: Your IPInfo API key

2. **Trigger Deployment**:
   - Push changes to the `master` branch
   - Or manually trigger the workflow from GitHub Actions tab

### Option 3: PowerShell Script

1. **Set Environment Variables**:
   ```powershell
   $env:RENDER_API_TOKEN = "your_render_api_token"
   $env:MONGO_URI = "your_mongodb_connection_string"
   $env:VIRUSTOTAL_API_KEY = "your_virustotal_api_key"
   $env:GOOGLE_SAFE_BROWSING_API_KEY = "your_google_safe_browsing_api_key"
   $env:IPINFO_API_KEY = "your_ipinfo_api_key"
   ```

2. **Run the Deployment Script**:
   ```powershell
   .\deploy-render.ps1
   ```

## 🔗 API Keys Setup

### VirusTotal API Key
1. Go to https://www.virustotal.com/gui/join-us
2. Create a free account
3. Get your API key from the API section

### Google Safe Browsing API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the Safe Browsing API
4. Create credentials (API Key)

### IPInfo API Key
1. Go to https://ipinfo.io/signup
2. Create a free account
3. Get your API key from the dashboard

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Create an account
3. Get your API key from the API section

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com/
2. Create a free cluster
3. Create a database user
4. Get the connection string
5. Replace `<password>` with your database user password

### Local MongoDB
- Use: `mongodb://localhost:27017/urlSafety`

## 🔍 Health Check

Once deployed, you can verify the backend is running:

```bash
curl https://your-render-app.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-07-18T18:00:00.000Z",
  "uptime": 1234.567
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are listed in `package.json`
   - Ensure TypeScript compiles without errors

2. **Environment Variables Not Set**:
   - Verify all required environment variables are configured
   - Check for typos in variable names

3. **Database Connection Issues**:
   - Verify MongoDB connection string is correct
   - Check database user permissions
   - Ensure IP address is whitelisted (for Atlas)

4. **API Rate Limits**:
   - VirusTotal: 4 requests per minute (free tier)
   - Implement caching to reduce API calls

### Logs

- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check logs in Render dashboard under "Logs" tab

## 📈 Monitoring

### Vercel Analytics
- Built-in analytics available in Vercel dashboard
- Real-time performance metrics

### Render Metrics
- Monitor CPU and memory usage
- Track deployment history
- Set up alerts for downtime

## 🔄 Updates

### Frontend Updates
1. Make changes to the code
2. Push to GitHub
3. Vercel automatically deploys

### Backend Updates
1. Make changes to the backend code
2. Push to GitHub
3. Render automatically deploys (if auto-deploy is enabled)

## 🎉 Success!

Once both deployments are complete:

1. ✅ Frontend: https://xlook-orm7keo62-ranitisking-gmailcoms-projects.vercel.app
2. ⏳ Backend: https://your-render-app.onrender.com (after deployment)

The application will be fully functional and ready for use!

---

## 📞 Support

If you encounter any issues during deployment:

1. Check the logs in the respective platforms
2. Verify all environment variables are set correctly
3. Ensure API keys are valid and have proper permissions
4. Check database connectivity

For further assistance, consult the documentation:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
