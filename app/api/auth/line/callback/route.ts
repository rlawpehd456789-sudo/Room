import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/register?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/register?error=no_code', request.url)
    )
  }

  const clientId = process.env.LINE_CLIENT_ID
  const clientSecret = process.env.LINE_CLIENT_SECRET
  const redirectUri = process.env.LINE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/line/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/auth/register?error=config_error', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('LINE token error:', errorText)
      throw new Error('Failed to exchange code for token')
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token
    const idToken = tokens.id_token

    // Get user profile
    let userData: any = {}
    
    // Get profile from LINE API
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (profileResponse.ok) {
      const profile = await profileResponse.json()
      userData = {
        id: profile.userId,
        name: profile.displayName,
        avatar: profile.pictureUrl || '',
        email: '', // LINE profile doesn't include email
      }
    }

    // If we have id_token, try to get email from it (requires email scope)
    if (idToken) {
      try {
        // Decode JWT to get email (simple base64 decode, in production use proper JWT library)
        const base64Url = idToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const decoded = JSON.parse(jsonPayload)
        if (decoded.email) {
          userData.email = decoded.email
        }
      } catch (e) {
        // Ignore JWT decode errors
      }
    }

    // Redirect to callback page with user data
    const callbackUrl = new URL('/auth/oauth-callback', request.url)
    callbackUrl.searchParams.set('provider', 'line')
    callbackUrl.searchParams.set('id', userData.id || '')
    callbackUrl.searchParams.set('email', userData.email || '')
    callbackUrl.searchParams.set('name', userData.name || '')
    callbackUrl.searchParams.set('avatar', userData.avatar || '')

    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error('LINE OAuth error:', error)
    return NextResponse.redirect(
      new URL('/auth/register?error=oauth_failed', request.url)
    )
  }
}

