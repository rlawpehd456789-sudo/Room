import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレス形式ではありません' },
        { status: 400 }
      )
    }

    // 실제로는 데이터베이스에서 확인해야 하지만,
    // 현재는 localStorage를 사용하므로 클라이언트에서 처리하도록 안내
    // 프로덕션에서는 여기서 데이터베이스 쿼리를 수행합니다:
    // const existingUser = await db.user.findUnique({ where: { email } })
    // return NextResponse.json({ available: !existingUser })

    return NextResponse.json({
      available: true,
      message: 'サーバーサイドの検証が完了しました。クライアント側での追加確認が必要です。',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

