import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json()

    if (!nickname) {
      return NextResponse.json(
        { error: 'ユーザーネームが必要です' },
        { status: 400 }
      )
    }

    // 닉네임 길이 검증
    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json(
        { error: 'ユーザーネームは2文字以上20文字以下である必要があります' },
        { status: 400 }
      )
    }

    // 닉네임 형식 검증 (한글, 영문, 숫자, 언더스코어만 허용)
    const nicknameRegex = /^[가-힣a-zA-Z0-9_]+$/
    if (!nicknameRegex.test(nickname)) {
      return NextResponse.json(
        { error: 'ユーザーネームは日本語、英字、数字、アンダースコアのみ使用できます' },
        { status: 400 }
      )
    }

    // 실제로는 데이터베이스에서 확인해야 하지만,
    // 현재는 localStorage를 사용하므로 클라이언트에서 처리하도록 안내
    // 프로덕션에서는 여기서 데이터베이스 쿼리를 수행합니다:
    // const existingUser = await db.user.findUnique({ where: { nickname } })
    // return NextResponse.json({ available: !existingUser })

    return NextResponse.json({
      available: true,
      message: '서버 사이드 검증 완료. 클라이언트에서 추가 확인이 필요합니다。',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

