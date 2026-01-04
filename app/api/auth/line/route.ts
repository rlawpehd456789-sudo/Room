import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.LINE_CLIENT_ID
  const redirectUri = process.env.LINE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/line/callback`
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'LINE OAuth is not configured' },
      { status: 500 }
    )
  }

  const state = Math.random().toString(36).substring(2, 15)
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: 'profile openid email',
  })

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
  
  return NextResponse.redirect(authUrl)
}

