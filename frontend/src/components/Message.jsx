import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function Message( { message } ) {
    const isUser = message.role === 'user'
    const [copiedCode, setCopiedCode] = useState( null )

    const copyToClipboard = ( code, id ) => {
        navigator.clipboard.writeText( code )
        setCopiedCode( id )
        setTimeout( () => setCopiedCode( null ), 2000 )
    }

    const renderContent = ( content ) => {
        if ( !content ) return <p className="text-gray-100">No content</p>

        const parts = content.split( /```(\w+)?\n([\s\S]*?)```/g )

        return parts.map( ( part, idx ) => {
            if ( idx % 3 === 0 ) {
                // Text content
                return part ? (
                    <p key={idx} className="text-gray-100 whitespace-pre-wrap mb-2">
                        {part}
                    </p>
                ) : null
            } else if ( idx % 3 === 1 ) {
                // Language
                const language = part || 'text'
                const code = parts[idx + 1]
                const codeId = `code-${idx}`

                return (
                    <div key={idx} className="code-block my-3">
                        <div className="flex items-center justify-between bg-dark-800 px-4 py-2 border-b border-dark-700">
                            <span className="text-xs text-gray-400">{language}</span>
                            <button
                                onClick={() => copyToClipboard( code, codeId )}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                            >
                                {copiedCode === codeId ? (
                                    <>
                                        <Check size={14} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="text-sm text-gray-100 overflow-x-auto p-4">
                            <code>{code}</code>
                        </pre>
                    </div>
                )
            }
            return null
        } )
    }

    return (
        <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">S</span>
                </div>
            )}

            <div
                className={`max-w-2xl rounded-lg p-4 ${isUser ? 'bg-purple-600 text-white' : 'bg-dark-800 text-gray-100'
                    }`}
            >
                <div>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <>
                            {message.thinking && (
                                <div className="thinking-indicator text-blue-400 text-sm mb-3 italic">
                                    🤔 Sara thinking....
                                </div>
                            )}
                            {renderContent( message.content )}
                        </>
                    )}
                </div>

                {!isUser && message.metadata && (
                    <div className="mt-3 pt-3 border-t border-dark-700 flex flex-wrap gap-2">
                        <Badge label="Model" value={message.metadata.model} color="blue" />
                        <Badge label="Type" value={message.metadata.task_type} color="green" />
                        <Badge
                            label="Time"
                            value={`${message.metadata.response_time}ms`}
                            color="purple"
                        />
                        <Badge label="Tokens" value={message.metadata.token_count} color="yellow" />
                    </div>
                )}
            </div>
        </div>
    )
}

function Badge( { label, value, color } ) {
    const colorMap = {
        blue: 'bg-blue-900 text-blue-200',
        green: 'bg-green-900 text-green-200',
        purple: 'bg-purple-900 text-purple-200',
        yellow: 'bg-yellow-900 text-yellow-200'
    }

    // Hide badge if value is empty
    if ( !value ) return null

    return (
        <span className={`text-xs px-2 py-1 rounded ${colorMap[color]}`}>
            {label}: {value}
        </span>
    )
}
