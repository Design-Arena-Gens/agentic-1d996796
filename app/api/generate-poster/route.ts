import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-demo',
})

export async function POST(request: NextRequest) {
  try {
    const { productName, productDescription, template } = await request.json()

    // Generate AI-powered ad copy
    let headline = ''
    let tagline = ''
    let cta = ''

    try {
      const prompt = `Create compelling ad copy for a product poster:
Product: ${productName}
${productDescription ? `Description: ${productDescription}` : ''}
Template style: ${template}

Generate:
1. A catchy headline (max 8 words)
2. A compelling tagline (max 12 words)
3. A call-to-action button text (max 3 words)

Format your response as JSON:
{
  "headline": "...",
  "tagline": "...",
  "cta": "..."
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter specializing in advertising and marketing. Create persuasive, concise ad copy.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
      })

      const response = completion.choices[0].message.content
      if (response) {
        const parsed = JSON.parse(response)
        headline = parsed.headline
        tagline = parsed.tagline
        cta = parsed.cta
      }
    } catch (error) {
      console.error('AI generation error:', error)
      // Fallback to template-based copy
      headline = productName || 'Discover Amazing Products'
      tagline = productDescription || 'Quality you can trust'
      cta = 'Shop Now'
    }

    // If AI failed, use fallbacks
    if (!headline) {
      headline = productName || 'Discover Amazing Products'
    }
    if (!tagline) {
      tagline = productDescription || 'Quality you can trust'
    }
    if (!cta) {
      cta = 'Shop Now'
    }

    return NextResponse.json({
      headline,
      tagline,
      cta,
      template,
    })
  } catch (error) {
    console.error('Error generating poster:', error)
    return NextResponse.json(
      {
        headline: 'Amazing Product',
        tagline: 'Get yours today!',
        cta: 'Shop Now',
      },
      { status: 200 }
    )
  }
}
