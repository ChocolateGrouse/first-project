export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
  viewCount?: string
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'your-youtube-api-key') {
    throw new Error('YouTube API key not configured')
  }

  // Search for videos
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query + ' recipe cooking')}&key=${apiKey}`
  )

  if (!searchResponse.ok) {
    const error = await searchResponse.json()
    console.error('YouTube search error:', error)
    throw new Error('Failed to search YouTube')
  }

  const searchData = await searchResponse.json()

  if (!searchData.items || searchData.items.length === 0) {
    return []
  }

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

  // Get video details for duration
  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
  )

  if (!detailsResponse.ok) {
    throw new Error('Failed to get video details')
  }

  const detailsData = await detailsResponse.json()

  return searchData.items.map((item: any, index: number) => {
    const details = detailsData.items?.[index]
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      duration: formatDuration(details?.contentDetails?.duration || 'PT0M0S'),
      viewCount: details?.statistics?.viewCount,
    }
  })
}

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1]?.replace('H', '') || '0')
  const minutes = parseInt(match[2]?.replace('M', '') || '0')
  const seconds = parseInt(match[3]?.replace('S', '') || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
