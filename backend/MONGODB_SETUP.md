# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up or log in to your account
3. Create a new cluster (free tier is fine for development)

## Step 2: Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username: `friction_user` (or any username you prefer)
5. Generate a strong password or set your own
6. Set database user privileges to **Atlas admin** or **Read and write to any database**
7. Click **Add User**

## Step 3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, you can:
   - Add your current IP (recommended)
   - Or add `0.0.0.0/0` to allow access from anywhere (less secure, only for testing)
4. Click **Confirm**

## Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **4.1 or later**
5. Copy the connection string

## Step 5: Update .env File

Replace the placeholders in your `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/url-safety-checker?retryWrites=true&w=majority&appName=friction
```

Example:
```env
MONGO_URI=mongodb+srv://friction_user:mySecurePassword123@cluster0.abc123.mongodb.net/url-safety-checker?retryWrites=true&w=majority&appName=friction
```

## Step 6: Test Connection

Run the test script:
```bash
node checkMongoDBConnection.js
```

## Troubleshooting

### Authentication Failed
- Check username and password in connection string
- Ensure user exists and has correct permissions

### Network Error
- Check if your IP is whitelisted
- Verify internet connection
- Check cluster URL is correct

### Connection Timeout
- Verify cluster is running
- Check network access settings
- Try connecting from a different network
