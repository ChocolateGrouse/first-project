import { NextRequest, NextResponse } from 'next/server'
import { searchYouTubeVideos } from '@/lib/youtube'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    const videos = await searchYouTubeVideos(query)
    return NextResponse.json({ videos })
  } catch (error) {
    console.error('YouTube search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search videos' },
      { status: 500 }
    )
  }
}
