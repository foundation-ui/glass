import { expect } from 'chai'
import { constructGlassOutputFile, transpileGlassFile } from '../transpileGlass'

describe('transpileGlass', () => {
  it('should transpile without interpolation variables', () => {
    const transpiled = transpileGlassFile('foo', {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'foo',
      language: 'typescript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt() {
  const interpolations = {}
  const kshots = {}
  const TEMPLATE = 'foo'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with get-prefixed named', () => {
    const transpiled = transpileGlassFile('foo', {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'get-foo',
      language: 'typescript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt() {
  const interpolations = {}
  const kshots = {}
  const TEMPLATE = 'foo'
  return interpolateGlass('get-foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with interpolation variables', () => {
    const transpiled = transpileGlassFile('{foo}', {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'foo',
      language: 'typescript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt(args: { foo: string }) {
  const { foo } = args
  const interpolations = {
    0: foo,
  }
  const kshots = {}
  const TEMPLATE = '{0}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile into javascript', () => {
    const transpiled = transpileGlassFile('{foo}', {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'foo',
      language: 'javascript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt(args) {
  const { foo } = args
  const interpolations = {
    0: foo,
  }
  const kshots = {}
  const TEMPLATE = '{0}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with escape sequences', () => {
    const transpiled = transpileGlassFile(`{foo} and \\{foo\\}`, {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'foo',
      language: 'typescript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt(args: { foo: string }) {
  const { foo } = args
  const interpolations = {
    0: foo,
  }
  const kshots = {}
  const TEMPLATE = '{0} and {foo}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with multiple interpolation variables', () => {
    const transpiled = transpileGlassFile('{foo} {bar}', {
      workspaceFolder: '/Users/me/glassc',
      folderPath: '/Users/me/glassc',
      fileName: 'foo',
      language: 'typescript',
      outputDirectory: '/Users/me/glassc/src',
    })

    expect(transpiled.code).to.equal(`export function getFooPrompt(args: { foo: string, bar: string }) {
  const { foo, bar } = args
  const interpolations = {
    0: foo,
    1: bar,
  }
  const kshots = {}
  const TEMPLATE = '{0} {1}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with duplicate interpolation variables', () => {
    const transpiled = transpileGlassFile(
      `{foo} {bar} {foo}
{bar}`,
      {
        workspaceFolder: '/Users/me/glassc',
        folderPath: '/Users/me/glassc',
        fileName: 'foo',
        language: 'typescript',
        outputDirectory: '/Users/me/glassc/src',
      }
    )

    expect(transpiled.code).to.equal(`export function getFooPrompt(args: { foo: string, bar: string }) {
  const { foo, bar } = args
  const interpolations = {
    0: foo,
    1: bar,
    2: foo,
    3: bar,
  }
  const kshots = {}
  const TEMPLATE = '{0} {1} {2}\\n{3}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with frontmatter', () => {
    const transpiled = transpileGlassFile(
      `---
foo: number
bar: string
---
{foo} {bar}`,
      {
        workspaceFolder: '/Users/me/glassc',
        folderPath: '/Users/me/glassc',
        fileName: 'foo',
        language: 'typescript',
        outputDirectory: '/Users/me/glassc/src',
      }
    )

    expect(transpiled.code).to.equal(`export function getFooPrompt(args: { foo: number, bar: string }) {
  const { foo, bar } = args
  const interpolations = {
    0: foo,
    1: bar,
  }
  const kshots = {}
  const TEMPLATE = '{0} {1}'
  return interpolateGlass('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should transpile with imports and code interpolations', () => {
    const transpiled = transpileGlassFile(
      `import {sayHello} from './say-hello'

      {sayHello({ name: 'chat' })}

<System>
Read a Transcript and determine how to respond about the property's {sayHello({ name: 'chat' })}. Valid responses are:

- \`NO_RESPONSE\`: use this if the transcript has nothing to do with {agentName}
- \`HELP: <reason>\`: use this if the information you have about the {agentName} is insufficient to provide an answer and you require more information
- \`<your response>\`: a useful response to the User given the property's {agentName}

{
  function generateCodeExamples() {
    const examples = []
    for (let i = 0; i < 10; i++) {
      examples.push(Math.random())
    }
    return examples.join('\\n')
  }
}
</System>

<User>
{agentName}
###
{instructions}
###

Transcript
###
{transcript}
###
</User>
`,
      {
        workspaceFolder: '/Users/me/glassc',
        folderPath: '/Users/me/glassc',
        fileName: 'foo',
        language: 'typescript',
        outputDirectory: '/Users/me/glassc/src',
      }
    )

    expect(transpiled.code).to.equal(`import { sayHello } from '../say-hello'

export function getFooPrompt(args: {
  agentName: string,
  instructions: string,
  transcript: string,
}) {
  const { agentName, instructions, transcript } = args
  const interpolations = {
    0: sayHello({ name: 'chat' }),
    1: sayHello({ name: 'chat' }),
    2: agentName,
    3: agentName,
    4: agentName,
    5: (function generateCodeExamples() {
      const examples = []
      for (let i = 0; i < 10; i++) {
        examples.push(Math.random())
      }
      return examples.join('\\n')
    })(),
    6: agentName,
    7: instructions,
    8: transcript,
  }
  const kshots = {}
  const TEMPLATE =
    "import {sayHello} from './say-hello'\\n\\n      {0}\\n\\n<System>\\nRead a Transcript and determine how to respond about the property's {1}. Valid responses are:\\n\\n- \`NO_RESPONSE\`: use this if the transcript has nothing to do with {2}\\n- \`HELP: <reason>\`: use this if the information you have about the {3} is insufficient to provide an answer and you require more information\\n- \`<your response>\`: a useful response to the User given the property's {4}\\n\\n{5}\\n</System>\\n\\n<User>\\n{6}\\n###\\n{7}\\n###\\n\\nTranscript\\n###\\n{8}\\n###\\n</User>\\n"
  return interpolateGlassChat('foo', TEMPLATE, { ...interpolations, ...kshots })
}`)
  })

  it('should construct transpiled', () => {
    const transpiled = constructGlassOutputFile([
      {
        args: [],
        code: 'export function getFoo() { return "hello world" }',
        exportName: 'getFooPrompt',
        functionName: 'getFoo',
        imports: ['import foo from "bar"'],
      },
    ])

    expect(transpiled).to.equal(`// THIS FILE WAS GENERATED BY GLASS -- DO NOT EDIT!

export function getFoo() {
  return 'hello world'
}

export const Glass = {
  getFoo: getFooPrompt,
}
`)
  })
})
