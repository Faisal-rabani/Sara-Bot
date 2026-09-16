import React, { useState } from 'react'
import { Send, ChevronDown, RefreshCw } from 'lucide-react'
import { GeminiLogo, ChatGPTLogo } from './Logos'

export default function InputArea( { onSendMessage, isLoading, modelOverride, onModelChange, isAuthenticated } ) {
    const [input, setInput] = useState( '' )
    const [showModelMenu, setShowModelMenu] = useState( false )

    const handleSubmit = ( e ) => {
        e.preventDefault()
        if ( input.trim() && !isLoading ) {
            onSendMessage( input )
            setInput( '' )
        }
    }

    const handleKeyDown = ( e ) => {
        if ( e.key === 'Enter' && !e.shiftKey ) {
            e.preventDefault()
            handleSubmit( e )
        }
    }

    const selectModel = ( model ) => {
        onModelChange( model )
        setShowModelMenu( false )
    }

    const getModelLabel = () => {
        switch ( modelOverride ) {
            case 'auto': return <><RefreshCw size={14} className="text-blue-400" /> Auto</>
            case 'gemini': return <><GeminiLogo className="w-3.5 h-3.5 text-blue-400" /> Gemini</>
            case 'openai': return <><ChatGPTLogo className="w-3.5 h-3.5 text-green-500" /> ChatGPT</>
            default: return 'Select Model'
        }
    }

    return (
        <div className="bg-[#0A0A0A] p-4 z-10 w-full max-w-4xl mx-auto mb-2">
            <div>
                <form onSubmit={handleSubmit} className="flex bg-[#111] border border-neutral-800 rounded-full p-1 shadow-lg items-center transition-colors focus-within:border-neutral-600 focus-within:bg-[#151515]">
                    <div className="pl-2 relative">
                        <button
                            type="button"
                            onClick={() => setShowModelMenu( !showModelMenu )}
                            className="px-2 py-2 text-neutral-400 text-xs hover:text-white transition flex items-center gap-1 whitespace-nowrap bg-transparent"
                        >
                            {getModelLabel()}
                            <ChevronDown size={14} />
                        </button>
                        
                        {showModelMenu && (
                            <div className="absolute bottom-full mb-2 left-0 bg-[#111] border border-neutral-800 rounded-md shadow-2xl z-50 min-w-max overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'auto' )}
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 transition ${modelOverride === 'auto' ? 'text-white' : 'text-neutral-400'}`}
                                >
                                    <RefreshCw size={14} className="text-blue-400" /> Auto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'gemini' )}
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 transition ${modelOverride === 'gemini' ? 'text-white' : 'text-neutral-400'}`}
                                >
                                    <GeminiLogo className="w-4 h-4 text-blue-400" /> Gemini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'openai' )}
                                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 transition ${modelOverride === 'openai' ? 'text-white' : 'text-neutral-400'}`}
                                >
                                    <ChatGPTLogo className="w-4 h-4 text-green-500" /> ChatGPT
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <input
                        type="text"
                        value={input}
                        onChange={( e ) => setInput( e.target.value )}
                        onKeyDown={handleKeyDown}
                        placeholder={isAuthenticated ? "Message Sara..." : "Ask Sara..."}
                        className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 p-3 focus:outline-none text-sm h-12"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 mr-1 glass-shine bg-white hover:bg-gray-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-full transition flex items-center justify-center flex-shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-[11px] text-center text-neutral-500 mt-3">
                    💡 Select a model or use Auto Rotate for smart routing
                </p>
            </div>
        </div>
    )
}
