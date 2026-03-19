import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatArea from './components/ChatArea'
import InputArea from './components/InputArea'
import CompareModal from './components/CompareModal'
import { getSessions, createSession, getSession, updateSession, deleteSession, addMessageToSession } from './utils/storage'

export default function App() {
  const [sessions, setSessions] = useState( [] )
  const [activeSessionId, setActiveSessionId] = useState( null )
  const [isLoading, setIsLoading] = useState( false )
  const [modelOverride, setModelOverride] = useState( 'auto' )
  const [showCompareModal, setShowCompareModal] = useState( false )

  // Initialize sessions
  useEffect( () => {
    const savedSessions = getSessions()
    setSessions( savedSessions )

    if ( savedSessions.length === 0 ) {
      const newSession = createSession()
      setSessions( [newSession] )
      setActiveSessionId( newSession.id )
    } else {
      setActiveSessionId( savedSessions[0].id )
    }
  }, [] )

  // Keyboard shortcuts
  useEffect( () => {
    const handleKeyDown = ( e ) => {
      if ( e.ctrlKey && e.key === 'k' ) {
        e.preventDefault()
        handleNewChat()
      }
      if ( e.ctrlKey && e.key === 'e' ) {
        e.preventDefault()
        if ( activeSessionId ) {
          handleExportChat( activeSessionId )
        }
      }
    }

    window.addEventListener( 'keydown', handleKeyDown )
    return () => window.removeEventListener( 'keydown', handleKeyDown )
  }, [activeSessionId] )

  const activeSession = activeSessionId ? getSession( activeSessionId ) : null

  const handleNewChat = () => {
    const newSession = createSession()
    setSessions( [newSession, ...sessions] )
    setActiveSessionId( newSession.id )
  }

  const handleSelectSession = ( sessionId ) => {
    setActiveSessionId( sessionId )
  }

  const handleDeleteSession = ( sessionId ) => {
    const remaining = deleteSession( sessionId )
    setSessions( remaining )

    if ( activeSessionId === sessionId ) {
      if ( remaining.length > 0 ) {
        setActiveSessionId( remaining[0].id )
      } else {
        const newSession = createSession()
        setSessions( [newSession] )
        setActiveSessionId( newSession.id )
      }
    }
  }

  const handleSendMessage = async ( message ) => {
    if ( !activeSessionId ) return

    // Add user and assistant placeholder messages
    const userMessage = { role: 'user', content: message }
    const assistantPlaceholder = { role: 'assistant', content: '...' }
    addMessageToSession( activeSessionId, userMessage )
    addMessageToSession( activeSessionId, assistantPlaceholder )
    setSessions( getSessions() )

    setIsLoading( true )

    try {
      const currentSession = getSession( activeSessionId )
      const previousMessages = currentSession.messages.map( m => ( {
        role: m.role,
        content: m.content
      } ) )

      const response = await fetch( '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          message,
          messages: previousMessages,
          model_override: modelOverride
        } )
      } )

      if ( !response.ok ) {
        throw new Error( `HTTP error! status: ${response.status}` )
      }

      let fullContent = ''
      let fullMetadata = null

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while ( true ) {
        const { done, value } = await reader.read()
        if ( done ) break

        const chunk = decoder.decode( value, { stream: true } )
        const lines = chunk.split( '\n' )

        for ( const line of lines ) {
          if ( line.startsWith( 'data: ' ) ) {
            const dataStr = line.substring( 6 ).trim()
            if ( !dataStr ) continue

            try {
              const data = JSON.parse( dataStr )

              if ( data.type === 'content' ) {
                fullContent += data.data
              } else if ( data.type === 'metadata' ) {
                fullMetadata = data
              }

              // Update message in real-time
              const updatedSession = getSession( activeSessionId )
              if ( updatedSession && updatedSession.messages.length > 0 ) {
                const lastMsg = updatedSession.messages[updatedSession.messages.length - 1]
                lastMsg.role = 'assistant'
                lastMsg.content = fullContent
                if ( fullMetadata ) {
                  lastMsg.metadata = fullMetadata
                }
                updateSession( activeSessionId, { messages: updatedSession.messages } )
                setSessions( getSessions() )
              }
            } catch ( e ) {
              console.error( 'Parse error:', e )
            }
          }
        }
      }

      // Final update
      const finalSession = getSession( activeSessionId )
      if ( finalSession && finalSession.messages.length > 0 ) {
        const lastMsg = finalSession.messages[finalSession.messages.length - 1]
        lastMsg.content = fullContent
        if ( fullMetadata ) {
          lastMsg.metadata = fullMetadata
        }
        updateSession( activeSessionId, { messages: finalSession.messages } )
        setSessions( getSessions() )
      }

      // Update session title
      if ( activeSession && activeSession.title === 'New Chat' && message.length > 0 ) {
        const title = message.substring( 0, 50 )
        updateSession( activeSessionId, { title } )
        setSessions( getSessions() )
      }
    } catch ( error ) {
      console.error( 'Chat error:', error )
      const updatedSession = getSession( activeSessionId )
      if ( updatedSession && updatedSession.messages.length > 0 ) {
        const lastMsg = updatedSession.messages[updatedSession.messages.length - 1]
        lastMsg.content = `Error: ${error.message}`
        updateSession( activeSessionId, { messages: updatedSession.messages } )
        setSessions( getSessions() )
      }
    }

    setIsLoading( false )
  }

  const handleExportChat = ( sessionId ) => {
    const session = getSession( sessionId )
    if ( !session ) return

    let markdown = `# ${session.title}\n\n`
    markdown += `**Date:** ${new Date( session.createdAt ).toLocaleString()}\n\n`
    markdown += `---\n\n`

    session.messages.forEach( msg => {
      if ( msg.role === 'user' ) {
        markdown += `**You:** ${msg.content}\n\n`
      } else {
        markdown += `**Sara:** ${msg.content}\n\n`
        if ( msg.metadata ) {
          markdown += `*Model: ${msg.metadata.model} | Type: ${msg.metadata.task_type} | Time: ${msg.metadata.response_time}ms | Tokens: ${msg.metadata.token_count}*\n\n`
        }
      }
    } )

    const blob = new Blob( [markdown], { type: 'text/markdown' } )
    const url = URL.createObjectURL( blob )
    const a = document.createElement( 'a' )
    a.href = url
    a.download = `${session.title.replace( /\s+/g, '_' )}_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL( url )
  }

  return (
    <div className="flex h-screen bg-dark-950">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onExport={handleExportChat}
      />

      <div className="flex-1 flex flex-col">
        <Header onCompareModels={() => setShowCompareModal( true )} />

        <ChatArea
          messages={activeSession?.messages || []}
          isLoading={isLoading}
        />

        <InputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          modelOverride={modelOverride}
          onModelChange={setModelOverride}
        />
      </div>

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal( false )}
        onCompare={() => { }}
      />
    </div>
  )
}
