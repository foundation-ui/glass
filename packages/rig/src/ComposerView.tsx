import MonacoEditor from '@monaco-editor/react'
import { VSCodeButton, VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { Resizable } from 're-resizable'
import { useEffect, useRef, useState } from 'react'

interface ComposerViewProps {
  theme: string
  runChat: (chatToRun: string, sessionToRun: string) => void
  stop: () => void
  streaming: boolean
  session: string
  chat: string
  setChat: (chat: string) => void
}

export const ComposerView = (props: ComposerViewProps) => {
  const { streaming, runChat, stop, theme, session, chat, setChat } = props

  const chatRef = useRef(chat)
  const sessionRef = useRef(session)

  useEffect(() => {
    chatRef.current = chat
    sessionRef.current = session
  }, [chat, session])

  function mapVSCodeThemeToMonaco(theme: string) {
    const themeMapping: Record<string, string> = {
      'Default Dark Modern': 'vs-dark',
      'Default Light Modern': 'vs',
      'Default Dark+': 'vs-dark',
      'Default Light+': 'vs',
      Monokai: 'monokai',
      'Solarized Dark': 'solarized-dark',
      'Solarized Light': 'solarized-light',
    }
    if (themeMapping[theme]) {
      return themeMapping[theme]
    }
    return 'vs-dark'
  }

  const [resizing, setResizing] = useState(false)
  const [height, setHeight] = useState(200)
  const [heightOnStart, setHeightOnStart] = useState(200)

  return (
    <Resizable
      enable={{
        top: true,
      }}
      minHeight={'80px'}
      maxHeight={'50vh'}
      handleComponent={{
        top: (
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: resizing ? 'blue' : 'transparent',
              cursor: 'row-resize',
            }}
          />
        ),
      }}
      size={{ width: '100%', height: `${height}px` }}
      onResizeStart={() => {
        setResizing(true)
        setHeightOnStart(height)
      }}
      onResize={(e, direction, ref, d) => {
        const newValue = heightOnStart + d.height
        setHeight(newValue)
      }}
      onResizeStop={(e, direction, ref, d) => {
        setResizing(false)
        setHeightOnStart(height)
      }}
    >
      <div style={{ width: '100%', flexShrink: 0 }}>
        <VSCodeDivider style={{ margin: 0, padding: 0 }} />
        <MonacoEditor
          width="100%"
          height={`${height}px`}
          theme={mapVSCodeThemeToMonaco(theme)}
          language={'markdown'}
          value={chat}
          onChange={value => setChat(value ?? '')}
          options={{
            minimap: {
              enabled: false,
            },
            padding: {
              top: 8,
            },
            wordWrap: 'on',
            fontSize: 12,
            lineDecorationsWidth: 0,
          }}
          onMount={(editor, monaco) => {
            editor.focus()
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              runChat(chatRef.current, sessionRef.current)
            })
          }}
        />
        {streaming ? (
          <VSCodeButton style={{ width: '100%' }} appearance="secondary" onClick={stop} disabled={false}>
            Stop
          </VSCodeButton>
        ) : (
          <VSCodeButton
            style={{ width: '100%' }}
            appearance={'primary'}
            onClick={() => runChat(chatRef.current, sessionRef.current)}
          >
            Run
          </VSCodeButton>
        )}
      </div>
    </Resizable>
  )
}
