import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, type } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Add GOOGLE_AI_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    // Different prompts for fridge vs receipt
    const prompt = type === 'receipt'
      ? `Analyze this receipt image and extract all food/grocery items. For each item, provide:
         - name: the item name (clean, no prices)
         - quantity: estimated quantity or "1" if unclear
         Return ONLY a JSON array of objects with "name" and "quantity" fields. Example:
         [{"name": "Milk", "quantity": "1 gallon"}, {"name": "Eggs", "quantity": "1 dozen"}]
         If you cannot read the receipt clearly, return what you can identify.
         Return ONLY the JSON array, no other text.`
      : `Analyze this fridge/food image and identify all visible food items. For each item, provide:
         - name: the food item name
         - quantity: estimated quantity (e.g., "2 bottles", "1 carton", "~5 eggs")
         - confidence: your confidence level 1-100
         Return ONLY a JSON array of objects. Example:
         [{"name": "Milk", "quantity": "1 gallon", "confidence": 95}]
         Be thorough - identify everything you can see including items partially visible.
         Return ONLY the JSON array, no other text.`

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1]
    const mimeType = image.split(';')[0].split(':')[1]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google AI API error:', error)
      return NextResponse.json(
        { error: error.error?.message || 'Failed to analyze image. Please check your API key.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    // Parse the JSON response
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7)
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3)
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3)
      }
      cleanContent = cleanContent.trim()

      const items = JSON.parse(cleanContent)
      return NextResponse.json({ items })
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse detected items', raw: content },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
