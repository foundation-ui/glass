import { expect } from 'chai'
import { parseGlassAST } from './parseGlassAST'

describe.skip('parse glass AST', () => {
  it('should parse with invalid JSX', () => {
    const doc = `// Glass provides a more powerful way to work with few shots.
// We can load up our examples in code and then loop through them using a <For> block.
// This file is equivalent to the last one — but it's much easier to follow.

const examples = [
  {
    message: 'ur product never works, def want my money back',
    classification: 'NEEDS_ATTENTION',
  },
  {
    message: 'Love it! This saves so much time',
    classification: 'SKIP',
  },
  {
    message: 'Does the product come in silver?',
    classification: 'NEEDS_ATTENTION',
  },
  {
    message: "would highly recommend not buying this product, I've had so many problems",
    classification: 'NEEDS_ATTENTION',
  },
]

<System>
You are an AI community moderator. Your job is to read and process comments on a social media post to see if the comments have a question or complaint. If the comment has a question or complaint, return "NEEDS_ATTENTION". Otherwise, return "SKIP". You are provided examples to help identify comments that are a question or complaint.
</System>

<For each={examples} as="example">
<User>
\${example.message}
</User>

<Assistant>
\${example.classification}
</Assistant>
</For>

<User>
I'm not sure what's going on.
</User>

<Request model="gpt-3.5-turbo" />`

    expect(() => {
      parseGlassAST(doc, {
        workspaceFolder: '/',
        fileName: 'foo.glass',
        folderPath: '/',
        outputDirectory: '/',
      })
    }).to.not.throw()
  })
})
