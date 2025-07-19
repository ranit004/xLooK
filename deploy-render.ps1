# Render Deployment Script for XLook Backend
# This script automates the deployment of the backend to Render

Write-Host "🚀 XLook Backend Deployment Script" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Check if required environment variables are set
$requiredVars = @(
    "RENDER_API_TOKEN",
    "MONGO_URI",
    "VIRUSTOTAL_API_KEY",
    "GOOGLE_SAFE_BROWSING_API_KEY",
    "IPINFO_API_KEY"
)

Write-Host "📋 Checking required environment variables..." -ForegroundColor Yellow

foreach ($var in $requiredVars) {
    if (-not (Get-Variable -Name $var -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $var is not set" -ForegroundColor Red
        Write-Host "Please set this variable and try again." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ $var is set" -ForegroundColor Green
    }
}

# Service configuration
$serviceConfig = @{
    "name" = "xlook-backend"
    "repo" = "https://github.com/ranit004/xLooK.git"
    "type" = "web_service"
    "env" = "node"
    "region" = "oregon"
    "plan" = "free"
    "buildCommand" = "npm install && npm run build"
    "startCommand" = "npm start"
    "rootDir" = "backend"
    "envVars" = @(
        @{
            "key" = "NODE_ENV"
            "value" = "production"
        },
        @{
            "key" = "PORT"
            "value" = "10000"
        },
        @{
            "key" = "ALLOWED_ORIGIN"
            "value" = "https://xlook-8yl048kgu-ranitisking-gmailcoms-projects.vercel.app"
        },
        @{
            "key" = "MONGO_URI"
            "value" = $env:MONGO_URI
        },
        @{
            "key" = "VIRUSTOTAL_API_KEY"
            "value" = $env:VIRUSTOTAL_API_KEY
        },
        @{
            "key" = "GOOGLE_SAFE_BROWSING_API_KEY"
            "value" = $env:GOOGLE_SAFE_BROWSING_API_KEY
        },
        @{
            "key" = "IPINFO_API_KEY"
            "value" = $env:IPINFO_API_KEY
        }
    )
}

Write-Host "🔧 Creating service configuration..." -ForegroundColor Yellow

# Convert to JSON
$jsonConfig = $serviceConfig | ConvertTo-Json -Depth 3

# Make API call to create service
$headers = @{
    "Authorization" = "Bearer $env:RENDER_API_TOKEN"
    "Content-Type" = "application/json"
}

try {
    Write-Host "🌐 Deploying to Render..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $jsonConfig
    
    Write-Host "✅ Service created successfully!" -ForegroundColor Green
    Write-Host "📦 Service ID: $($response.service.id)" -ForegroundColor Cyan
    Write-Host "🔗 Service URL: $($response.service.serviceDetails.url)" -ForegroundColor Cyan
    Write-Host "🎯 Dashboard: https://dashboard.render.com/web/$($response.service.id)" -ForegroundColor Cyan
    
    Write-Host "🔄 Deployment in progress..." -ForegroundColor Yellow
    Write-Host "You can monitor the deployment progress at the dashboard URL above." -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your API token and try again." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
