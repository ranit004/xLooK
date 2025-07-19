# XLook Deployment Instructions

## ✅ Frontend Deployment (COMPLETED)

**Status**: Successfully deployed to Vercel
- **URL**: https://xlook-8yl048kgu-ranitisking-gmailcoms-projects.vercel.app
- **Dashboard**: https://vercel.com/ranitisking-gmailcoms-projects/xlook

### Environment Variables Set:
- ✅ VIRUSTOTAL_API_KEY
- ✅ MONGO_URI  
- ✅ JWT_SECRET
- ✅ JWT_EXPIRES_IN
- ✅ OPENAI_API_KEY
- ✅ GOOGLE_SAFE_BROWSING_API_KEY
- ✅ IPINFO_API_KEY

## 🔄 Backend Deployment (TO DO)

### Option 1: Manual Deployment via Render Dashboard

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign up/Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `ranit004/xLook`

3. **Configure Service**
   ```
   Name: xlook-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   ALLOWED_ORIGIN=https://xlook-8yl048kgu-ranitisking-gmailcoms-projects.vercel.app
   MONGO_URI=mongodb://localhost:27017/url-safety-checker
   VIRUSTOTAL_API_KEY=259f6c5ba111f2de0b64fd88796afed491b25e86f0954ceccd732ace927aa8ea
   GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyBlOp2IbU7wbH5P4Klaa2H3gi3qQzQuRf8
   IPINFO_API_KEY=340008b211ac42
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Option 2: Using GitHub Actions (If repository is on GitHub)

The `.github/workflows/deploy-render.yml` is already configured. You just need to:

1. **Add GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `RENDER_API_TOKEN`: Your Render API token
     - `MONGO_URI`: Your MongoDB connection string
     - `VIRUSTOTAL_API_KEY`: 259f6c5ba111f2de0b64fd88796afed491b25e86f0954ceccd732ace927aa8ea
     - `GOOGLE_SAFE_BROWSING_API_KEY`: AIzaSyBlOp2IbU7wbH5P4Klaa2H3gi3qQzQuRf8
     - `IPINFO_API_KEY`: 340008b211ac42

2. **Trigger Deployment**
   - Push changes to master branch, or
   - Manually trigger from GitHub Actions tab

### Option 3: Using PowerShell Script

1. **Set Environment Variables** (run these in PowerShell):
   ```powershell
   $env:RENDER_API_TOKEN = "your_render_api_token"
   $env:MONGO_URI = "mongodb://localhost:27017/url-safety-checker"
   $env:VIRUSTOTAL_API_KEY = "259f6c5ba111f2de0b64fd88796afed491b25e86f0954ceccd732ace927aa8ea"
   $env:GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyBlOp2IbU7wbH5P4Klaa2H3gi3qQzQuRf8"
   $env:IPINFO_API_KEY = "340008b211ac42"
   ```

2. **Run Deployment Script**:
   ```powershell
   .\deploy-render.ps1
   ```

## 🔗 After Backend Deployment

Once your backend is deployed to Render, you'll get a URL like:
`https://xlook-backend-xxxx.onrender.com`

### Update Frontend Configuration
You'll need to update your frontend to point to the backend URL. Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
```

## 🧪 Testing the Deployment

### Frontend Test
- Visit: https://xlook-8yl048kgu-ranitisking-gmailcoms-projects.vercel.app
- Try creating an account and logging in
- Test URL checking functionality

### Backend Test
Once deployed, test the health endpoint:
```bash
curl https://your-render-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-07-19T03:58:45.000Z",
  "uptime": 1234.567
}
```

## 🎯 Production Recommendations

1. **Database**: Replace local MongoDB with MongoDB Atlas for production
2. **Domain**: Set up custom domain for both frontend and backend
3. **SSL**: Ensure HTTPS is enabled (Render provides this automatically)
4. **Monitoring**: Set up uptime monitoring for your services
5. **API Keys**: Rotate API keys and use environment variables securely

## 📞 Support

If you encounter issues:
1. Check deployment logs in Render dashboard
2. Verify all environment variables are set correctly
3. Ensure API keys are valid
4. Check CORS settings match your frontend domain
