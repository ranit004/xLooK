# API Integration Documentation

## Overview

The URL Safety Checker backend integrates with VirusTotal and Google Safe Browsing APIs to provide comprehensive URL security analysis.

## API Keys Setup

### VirusTotal API
1. Sign up at [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Get your API key from the profile page
3. Add to `.env`: `VIRUSTOTAL_API_KEY=your_actual_api_key`

### Google Safe Browsing API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Safe Browsing API
3. Create credentials (API key)
4. Add to `.env`: `GOOGLE_SAFE_BROWSING_API_KEY=your_actual_api_key`

## API Response Structure

### Enhanced Response Format

```json
{
  "success": true,
  "url": "https://example.com",
  "results": [
    {
      "id": "overall",
      "title": "Overall Safety",
      "description": "URL appears to be safe based on security scans",
      "status": "safe",
      "value": "SAFE",
      "category": "security",
      "details": "Risk Score: 0/100 • Confidence: 50%"
    },
    {
      "id": "virustotal",
      "title": "VirusTotal Scan",
      "description": "Clean - 0/67 security vendors flagged this URL",
      "status": "safe",
      "value": "0/67",
      "category": "security",
      "details": "Scanned by 67 engines • https://www.virustotal.com/gui/url/..."
    },
    {
      "id": "safebrowsing",
      "title": "Google Safe Browsing",
      "description": "No threats detected",
      "status": "safe",
      "value": "Clean",
      "category": "security",
      "details": "No malware or phishing detected"
    }
  ],
  "securityAnalysis": {
    "riskAnalysis": {
      "overallRisk": "safe",
      "riskScore": 0,
      "reasons": [
        "VirusTotal: Clean (0/67)",
        "Google Safe Browsing: No threats detected",
        "Note: Using simulated data (API keys not configured)"
      ],
      "confidence": 50,
      "summary": "URL appears to be safe based on security scans"
    },
    "virusTotal": {
      "isClean": true,
      "positives": 0,
      "total": 67,
      "detectionRatio": "0/67",
      "scanDate": "2024-01-01T12:00:00.000Z",
      "permalink": "https://www.virustotal.com/gui/url/...",
      "rawData": null,
      "threats": [],
      "riskScore": 0
    },
    "safeBrowsing": {
      "isSafe": true,
      "threats": [],
      "rawData": null,
      "details": "No threats detected",
      "riskScore": 0
    },
    "checkedAt": "2024-01-01T12:00:00.000Z"
  },
  "checkedAt": "2024-01-01T12:00:00.000Z"
}
```

## Risk Scoring Algorithm

### VirusTotal Risk Score
- 0 detections: 0 points (Clean)
- 1-10% detections: 25 points (Low risk)
- 11-30% detections: 50 points (Medium risk)
- 31-60% detections: 75 points (High risk)
- 60%+ detections: 100 points (Very high risk)

### Google Safe Browsing Risk Score
- No threats: 0 points
- Any threats detected: 50 points

### Combined Risk Score
- VirusTotal weight: 60%
- Google Safe Browsing weight: 40%
- Final score: (VT_score * 0.6) + (GSB_score * 0.4)

### Risk Levels
- 0 points: "safe"
- 1-24 points: "warning" (low risk)
- 25-59 points: "warning" (moderate risk)
- 60+ points: "unsafe" (high risk)

## Mock Data

When API keys are not configured, the system uses realistic mock data:
- 90% chance of clean results
- Random threat generation for testing
- Proper data structure maintained
- Confidence score reduced to 50%

## Error Handling

- API timeouts: 10 seconds
- Network errors: Fall back to mock data
- Invalid API keys: Use mock data with warning
- Rate limiting: Handled gracefully

## Testing

Run the test script to verify integration:

```bash
node test-api-integration.js
```

This will test multiple URLs and display:
- Risk analysis results
- VirusTotal scan data
- Google Safe Browsing results
- Frontend-formatted results

## Environment Variables

```env
PORT=5000
ALLOWED_ORIGIN=http://localhost:3000

# API Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
GOOGLE_SAFE_BROWSING_API_KEY=your_google_safe_browsing_api_key_here

# API URLs (optional)
VIRUSTOTAL_API_URL=https://www.virustotal.com/vtapi/v2
GOOGLE_SAFE_BROWSING_API_URL=https://safebrowsing.googleapis.com/v4
```

## Production Deployment

1. Set real API keys in environment variables
2. Enable HTTPS
3. Set up proper logging
4. Configure rate limiting
5. Add API key rotation
6. Monitor API quotas

## Limitations

- VirusTotal free tier: 4 requests/minute
- Google Safe Browsing: 10,000 requests/day free
- Some URLs may take time to be analyzed
- Mock data used when APIs are unavailable
