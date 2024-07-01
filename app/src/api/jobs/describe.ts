import pusher from '@/lib/pusher'
import { Analysis } from '@/types/Analysis'
import Anthropic from '@anthropic-ai/sdk'
import { ContentBlock, Message, TextBlock } from '@anthropic-ai/sdk/resources/messages.mjs'
import { sql } from '@vercel/postgres'

const anthropic = new Anthropic()

interface BracketResult {
  [key: string]: string
}

function parseBracketedContent(input: string, keys: string[]): BracketResult {
  const result: BracketResult = {}

  keys.forEach((key) => {
    const regex = new RegExp(`<${key}>([\\s\\S]*?)</${key}>`, 'g')
    const matches = input.match(regex)

    if (matches) {
      const value = matches.map((match) => {
        const contentRegex = new RegExp(`<${key}>([\\s\\S]*?)</${key}>`)

        // @ts-expect-error match is not null
        return match.match(contentRegex)[1].trim()
      })

      if (value.length === 1) {
        result[key] = value[0]
      }
    }
  })

  return result
}

async function describe(jobId: string, screenshotId: string, screenshotData: Buffer) {
  try {
    const message: Message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: screenshotData.toString('base64'),
              },
            },
            {
              type: 'text',
              text: `Do the following:
            
            1. Summarize the content of the screenshot of the product. (In <summary> tags.)
            2. Provide a title for what the screen is about. (In <title> tags.)
            3. Provide a description for the product this screenshot is of. (In <description> tags.)
            4. Provide a list of keywords for what is seen in the screenshot. (In <keywords> tags.)
            5. Use everything you know already to create a vision for the product's future, something also in regards to current trends for the industry this product is in, write at least 2 paragraphs with 50-100 words each. (In <vision> tags.)
            6. create a list of things to improve, typo corrections or recommendations to achieve the vision for this product screen. Up to 5 concise bullet points, counting up by numbers (1, 2, 3, etc...), they will be used to create todo items (In <todos> tags.)
            `,
            },
          ],
        },
      ],
    })

    const contents: ContentBlock[] = message.content
    const content: ContentBlock = contents[0] as TextBlock

    const { title, keywords, description, vision, todos, summary } = parseBracketedContent(content.text, [
      'title',
      'keywords',
      'description',
      'vision',
      'todos',
      'summary',
    ])

    const analysis: Analysis = {
      title,
      keywords: keywords.split(',').map((keyword: string) => keyword.trim()),
      description,
      vision,
      todos: todos.split('\n'),
      summary,
    }

    await sql`UPDATE screenshots SET analysis = ${JSON.stringify(analysis)}, status = 3 WHERE id = ${screenshotId}`

    await pusher.trigger(jobId, 'screenshot:patch', {
      id: screenshotId,
      analysis: analysis,
      status: 3,
    })
  } catch (err) {
    await sql`UPDATE screenshots SET status = 4 WHERE id = ${screenshotId}`
    await pusher.trigger(jobId, 'screenshot:patch', {
      id: screenshotId,
      status: 4,
    })
    console.error(err)
  }
}

export default describe
