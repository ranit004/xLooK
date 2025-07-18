import { URL } from 'url'

export interface ValidationResult {
  isValid: boolean
  error?: string
  parsedUrl?: URL
}

export const validateUrl = (urlString: string): ValidationResult => {
  try {
    // Check if URL string is provided
    if (!urlString || typeof urlString !== 'string') {
      return {
        isValid: false,
        error: 'URL is required and must be a string'
      }
    }

    // Remove any whitespace
    const trimmedUrl = urlString.trim()

    if (!trimmedUrl) {
      return {
        isValid: false,
        error: 'URL cannot be empty'
      }
    }

    // Parse the URL
    const parsedUrl = new URL(trimmedUrl)

    // Check if protocol is valid
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      }
    }

    // Check if hostname is valid
    if (!parsedUrl.hostname) {
      return {
        isValid: false,
        error: 'URL must have a valid hostname'
      }
    }

    // Check for localhost or private IP addresses in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase()
      
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return {
          isValid: false,
          error: 'Private IP addresses and localhost are not allowed'
        }
      }
    }

    return {
      isValid: true,
      parsedUrl
    }

  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    }
  }
}

export const sanitizeUrl = (urlString: string): string => {
  return urlString.trim().toLowerCase()
}
