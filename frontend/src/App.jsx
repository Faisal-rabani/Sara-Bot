import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatArea from './components/ChatArea'
import InputArea from './components/InputArea'
import Message from './components/Message'
import CompareModal from './components/CompareModal'
import AboutModal from './components/AboutModal'
import LoginModal from './components/LoginModal'
import LoadingAnimation from './components/LoadingAnimation'
import { getSessions, createSession, getSession, updateSession, deleteSession, addMessageToSession } from './utils/storage'
import { Ripple } from '@/components/ui/ripple'
import { AlertCircle, X, Check } from 'lucide-react'
import logoImage from './assets/logo.png'
import { GeminiLogo, ChatGPTLogo } from './components/Logos'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sara_authenticated') === 'true'
  })
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sara_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [showAnimation, setShowAnimation] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalView, setLoginModalView] = useState('login')
  const [isBackendConnected, setIsBackendConnected] = useState(true)
  const [showBackendError, setShowBackendError] = useState(false)
  
  const [sessions, setSessions] = useState( [] )
  const [activeSessionId, setActiveSessionId] = useState( null )
  const [isLoading, setIsLoading] = useState( false )
  const [modelOverride, setModelOverride] = useState( 'auto' )
  const [showCompareModal, setShowCompareModal] = useState( false )
  const [showAboutModal, setShowAboutModal] = useState( false )
  const [isSidebarOpen, setIsSidebarOpen] = useState( () => window.innerWidth > 768 )
  const [ephemeralMessages, setEphemeralMessages] = useState( [] )

  // Initialize sessions and first-visit animation
  useEffect( () => {
    // Show loading animation on mount
    setShowAnimation(true)

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

  // Backend connection check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/health')
        if (response.ok) {
          setIsBackendConnected(true)
          setShowBackendError(false)
        } else {
          setIsBackendConnected(false)
          setShowBackendError(true)
        }
      } catch (error) {
        setIsBackendConnected(false)
        setShowBackendError(true)
      }
    }
    
    checkBackend()
    // Could also set an interval here if needed, but a single check on load is fine
  }, [])

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
    setEphemeralMessages( [] )
  }

  const handleSelectSession = ( sessionId ) => {
    setActiveSessionId( sessionId )
    setEphemeralMessages( [] )
  }

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem('sara_authenticated', 'true')
    localStorage.setItem('sara_user', JSON.stringify(userData))
  }

  const handleAnimationComplete = () => {
    setShowAnimation(false)
    localStorage.setItem('sara_has_seen_animation', 'true')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('sara_authenticated')
    localStorage.removeItem('sara_user')
    // Resetting animation to replay next time they login for testing purposes
    localStorage.removeItem('sara_has_seen_animation')
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
    if (!isAuthenticated) {
      setLoginModalView('login')
      setShowLoginModal(true)
      return
    }
    if ( !activeSessionId ) return

    // Clear any ephemeral messages when starting a real conversation
    setEphemeralMessages( [] )

    // Add user and assistant placeholder messages
    const userMessage = { role: 'user', content: message }
    const assistantPlaceholder = { role: 'assistant', content: '', thinking: true }
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
                delete lastMsg.thinking // Remove thinking state once content starts
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
        delete lastMsg.thinking
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
        delete lastMsg.thinking
        updateSession( activeSessionId, { messages: updatedSession.messages } )
        setSessions( getSessions() )
      }
    }

    setIsLoading( false )
  }

  const handleMockMessage = () => {
    // Show a beautiful capabilities message from the README without saving it to history
    setEphemeralMessages([
      {
        role: 'user',
        content: 'What can you do?'
      },
      { 
        role: 'assistant', 
        content: '⚡ **I am Sara Bot, a high-performance AI assistant!**\n\nHere is a breakdown of my core capabilities:\n\n- **🤖 Smart Multi-Model Routing**: I analyze your prompts in real-time. If you ask for code, I inject syntax formatters. If you ask a general question, I use Gemini 2.5 Flash for conversational flow.\n- **⚖️ Side-by-Side Model Arena**: You can run prompts against two models concurrently (Gemini vs ChatGPT) to compare their responses in real-time!\n- **⚡ Zero-Latency Math Calculator**: I calculate complex mathematical expressions (like `sqrt(144) * 12`) locally in Python with absolutely zero network delay.\n- **📦 Privacy & Persistence**: Your chat history is stored completely locally in your browser. Nothing goes to an external database.\n- **📋 Developer Ready**: I output perfectly formatted code blocks with language indicators and one-click copy.\n\n*How can I help you today?*',
        metadata: { model: 'Sara Core', task_type: 'capabilities', response_time: 2, token_count: 185 }
      }
    ])
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

  const openLogin = () => {
    setLoginModalView('login')
    setShowLoginModal(true)
  }

  const openSignup = () => {
    setLoginModalView('signup')
    setShowLoginModal(true)
  }

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLogin} 
        initialView={loginModalView}
      />
      {showBackendError && !showAnimation && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm glass-shine bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] pointer-events-none" />
            
            <button 
              onClick={() => setShowBackendError(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-20"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Service Unavailable</h3>
              <p className="text-sm text-neutral-400 mb-6">
                The server is not working right now. Please check your internet connection or try again later.
              </p>
              
              <button 
                onClick={() => setShowBackendError(false)}
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 font-medium py-2.5 rounded-lg transition-colors"
              >
                <Check size={18} /> OK, I understand
              </button>
            </div>
          </div>
        </div>
      )}
      {showAnimation && <LoadingAnimation onComplete={handleAnimationComplete} user={user} />}
      <div className="relative flex h-screen bg-[#0A0A0A] text-neutral-200 overflow-hidden w-full font-sans">
        
        <div className="z-10 flex h-full w-full relative">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="absolute inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen( false )}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onExport={handleExportChat}
            onOpenAbout={() => setShowAboutModal( true )}
            user={user}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            onOpenLogin={openLogin}
          />

        <div className="flex-1 flex flex-col z-10">
          <Header 
            onCompareModels={() => setShowCompareModal( true )} 
            onToggleSidebar={() => setIsSidebarOpen( !isSidebarOpen )}
            isAuthenticated={isAuthenticated}
            onOpenLogin={openLogin}
            onOpenSignup={openSignup}
          />

          {((!isAuthenticated || (activeSession?.messages || []).length === 0) && ephemeralMessages.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 h-full overflow-y-auto">
              <div className="max-w-3xl w-full flex flex-col items-center">
                {!isAuthenticated ? (
                  <h1 className="text-3xl font-semibold text-white mb-8 text-center">Where should we begin?</h1>
                ) : (
                  <div className="mb-8 flex flex-col items-center">
                    <img src={logoImage} alt="Sara Bot" className="w-20 h-20 rounded-2xl shadow-xl shadow-orange-500/20 border border-orange-500/30 object-cover mb-8" />
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm">
                        <GeminiLogo className="w-5 h-5 text-blue-400" />
                        <div className="text-left">
                          <p className="text-xs font-medium text-white">Gemini</p>
                          <p className="text-[10px] text-neutral-500">Fast Chat</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm">
                        <ChatGPTLogo className="w-5 h-5 text-green-500" />
                        <div className="text-left">
                          <p className="text-xs font-medium text-white">ChatGPT</p>
                          <p className="text-[10px] text-neutral-500">Advanced Coding</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="w-full">
                  <InputArea
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    modelOverride={modelOverride}
                    onModelChange={setModelOverride}
                    isAuthenticated={isAuthenticated}
                  />
                </div>

                <div className="mt-4">
                  <button 
                    onClick={handleMockMessage}
                    className="glass-shine px-6 py-2 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500 rounded-full text-xs font-medium transition-all text-neutral-300"
                  >
                    What can you do?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ChatArea
                messages={[...(activeSession?.messages || []), ...ephemeralMessages]}
                isLoading={isLoading}
                isAuthenticated={isAuthenticated}
                onMockMessage={handleMockMessage}
              />

              <InputArea
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                modelOverride={modelOverride}
                onModelChange={setModelOverride}
                isAuthenticated={isAuthenticated}
              />
            </>
          )}
        </div>
      </div>

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal( false )}
        onCompare={() => { }}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal( false )}
      />
    </div>
    </>
  )
}
