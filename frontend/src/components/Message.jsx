import React, { useState } from 'react'
import { Copy, Check, User } from 'lucide-react'
import logoImage from '../assets/logo.png'

export default function Message( { message } ) {
    const isUser = message.role === 'user'
    const [copiedCode, setCopiedCode] = useState( null )

    const copyToClipboard = ( code, id ) => {
        navigator.clipboard.writeText( code )
        setCopiedCode( id )
        setTimeout( () => setCopiedCode( null ), 2000 )
    }

    const parseText = (text) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        return lines.map((line, i) => {
            if (line.trim() === '') return <br key={i} />;
            
            const isBullet = line.trim().startsWith('- ');
            let parsedLine = isBullet ? line.replace(/^\s*-\s*/, '') : line;
            
            const boldParts = parsedLine.split(/(\*\*.*?\*\*)/g);
            const lineContent = boldParts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                }
                const codeParts = part.split(/(`.*?`)/g);
                return codeParts.map((codePart, k) => {
                    if (codePart.startsWith('`') && codePart.endsWith('`')) {
                        return <code key={`${j}-${k}`} className="px-1.5 py-0.5 mx-0.5 bg-neutral-800 border border-neutral-700 rounded text-orange-400 text-sm font-mono">{codePart.slice(1, -1)}</code>;
                    }
                    return codePart;
                });
            });

            if (isBullet) {
                return (
                    <div key={i} className="flex gap-2 text-gray-100 my-1.5 ml-2">
                        <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                        <span>{lineContent}</span>
                    </div>
                );
            }
            return (
                <p key={i} className="text-gray-100 mb-2 leading-relaxed">
                    {lineContent}
                </p>
            );
        });
    }

    const renderContent = ( content ) => {
        if ( !content ) return null

        const parts = content.split( /```(\w+)?\n([\s\S]*?)```/g )

        return parts.map( ( part, idx ) => {
            if ( idx % 3 === 0 ) {
                return part ? <div key={idx}>{parseText(part)}</div> : null
            } else if ( idx % 3 === 1 ) {
                const language = part || 'text'
                const code = parts[idx + 1]
                const codeId = `code-${idx}`

                return (
                    <div key={idx} className="code-block my-3 bg-[#111] rounded-md border border-neutral-800/50 overflow-hidden">
                        <div className="flex items-center justify-between bg-neutral-900 px-4 py-2 border-b border-neutral-800/50">
                            <span className="text-xs text-neutral-400">{language}</span>
                            <button
                                onClick={() => copyToClipboard( code, codeId )}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                            >
                                {copiedCode === codeId ? (
                                    <><Check size={14} />Copied</>
                                ) : (
                                    <><Copy size={14} />Copy</>
                                )}
                            </button>
                        </div>
                        <pre className="text-sm text-gray-100 overflow-x-auto p-4 m-0 font-mono">
                            <code>{code}</code>
                        </pre>
                    </div>
                )
            }
            return null
        } )
    }

    return (
        <div className={`flex gap-4 w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border mt-1 overflow-hidden bg-[#111] border-orange-500/30 shadow-md shadow-orange-500/10">
                    <img src={logoImage} alt="Sara" className="w-full h-full object-cover" />
                </div>
            )}

            <div className={`flex-1 max-w-2xl min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
                <div className="flex flex-col">
                    <div
                        className={`inline-block px-5 py-3 rounded-2xl border ${
                            isUser 
                                ? 'bg-neutral-800 border-neutral-700 text-white font-sans rounded-tr-sm self-end' 
                                : 'bg-[#0A0A0A] border-transparent text-neutral-200 font-space text-[13px] leading-relaxed self-start'
                            }`}
                    >
                        {isUser ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <>
                                {message.thinking && (
                                    <div className="flex items-center gap-2 text-orange-500/80 text-sm mb-4 font-space">
                                        <div className="w-3.5 h-3.5 relative flex-shrink-0">
                                            <div className="absolute inset-0 rounded-full border border-orange-500/20 border-t-orange-500 animate-spin"></div>
                                        </div>
                                        <span className="animate-pulse">Preparing...</span>
                                    </div>
                                )}
                                {renderContent( message.content )}
                            </>
                        )}
                    </div>

                    {!isUser && message.metadata && (
                        <div className="mt-4 pt-3 border-t border-neutral-800/50 flex flex-wrap gap-2 max-w-fit">
                            <Badge label="Model" value={message.metadata.model} />
                            <Badge label="Type" value={message.metadata.task_type} />
                            <Badge label="Time" value={`${message.metadata.response_time}ms`} />
                            <Badge label="Tokens" value={message.metadata.token_count} />
                        </div>
                    )}
                </div>
            </div>
            
            {isUser && (
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border mt-1 overflow-hidden bg-neutral-800 border-neutral-700 text-neutral-400">
                    <User size={16} />
                </div>
            )}
        </div>
    )
}

function Badge( { label, value } ) {
    // Hide badge if value is empty
    if ( !value ) return null

    return (
        <span className="text-[10px] px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 uppercase tracking-wide">
            {label}: {value}
        </span>
    )
}
