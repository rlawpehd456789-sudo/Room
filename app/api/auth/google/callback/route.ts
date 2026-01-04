import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

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

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/auth/register?error=config_error', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userData = await userResponse.json()

    // Redirect to callback page with user data
    const callbackUrl = new URL('/auth/oauth-callback', request.url)
    callbackUrl.searchParams.set('provider', 'google')
    callbackUrl.searchParams.set('id', userData.id)
    callbackUrl.searchParams.set('email', userData.email || '')
    callbackUrl.searchParams.set('name', userData.name || userData.email?.split('@')[0] || '')
    callbackUrl.searchParams.set('avatar', userData.picture || '')

    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(
      new URL('/auth/register?error=oauth_failed', request.url)
    )
  }
}

