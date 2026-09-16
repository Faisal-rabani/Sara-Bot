import React, { useEffect, useRef } from 'react'
import Message from './Message'
import { GeminiLogo, ChatGPTLogo } from './Logos'

export default function ChatArea( { messages, isLoading, isAuthenticated, onMockMessage } ) {
    const endRef = useRef( null )

    useEffect( () => {
        endRef.current?.scrollIntoView( { behavior: 'smooth' } )
    }, [messages] )

    return (
        <div className="flex-1 overflow-y-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
                {messages.map( ( msg, idx ) => (
                    <Message key={idx} message={msg} />
                ) )}

            <div ref={endRef} />
            </div>
        </div>
    )
}


