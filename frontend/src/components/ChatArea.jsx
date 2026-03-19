import React, { useEffect, useRef } from 'react'
import Message from './Message'

export default function ChatArea( { messages, isLoading } ) {
    const endRef = useRef( null )

    useEffect( () => {
        endRef.current?.scrollIntoView( { behavior: 'smooth' } )
    }, [messages] )

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
                <WelcomeScreen />
            ) : (
                messages.map( ( msg, idx ) => (
                    <Message key={idx} message={msg} />
                ) )
            )}

            {isLoading && (
                <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <div className="flex-1">
                        <div className="typing-indicator text-gray-400">Sara is thinking...</div>
                    </div>
                </div>
            )}

            <div ref={endRef} />
        </div>
    )
}

function WelcomeScreen() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="max-w-xl text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Sara Bot</h2>
                <p className="text-gray-400 mb-6">Your AI-powered vibe coding agent. Ask me anything!</p>

                <div className="bg-dark-800 rounded-lg p-4 mb-6">
                    <h3 className="text-xs font-semibold text-gray-300 mb-3">What We Use</h3>
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="p-2 bg-dark-700 rounded">
                            <p className="text-xs font-semibold text-blue-400">💬 Chat & Math</p>
                            <p className="text-xs text-gray-400 mt-1">Google Gemini</p>
                        </div>
                        <div className="p-2 bg-dark-700 rounded">
                            <p className="text-xs font-semibold text-yellow-400">🧮 Coding</p>
                            <p className="text-xs text-gray-400 mt-1">GPT</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <SuggestionChip text="Write a React component" />
                        <SuggestionChip text="Explain closures" />
                        <SuggestionChip text="Hello, how are you?" />
                        <SuggestionChip text="What is 15% of 240?" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function SuggestionChip( { text } ) {
    return (
        <button className="px-3 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 text-xs rounded-lg transition border border-dark-600">
            {text}
        </button>
    )
}
