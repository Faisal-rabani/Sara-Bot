import React, { useState } from 'react'
import { Send, ChevronDown } from 'lucide-react'

export default function InputArea( { onSendMessage, isLoading, modelOverride, onModelChange } ) {
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
            case 'auto': return '🔄 Auto Rotate'
            case 'gemini': return '✨ Gemini'
            case 'openai': return '🤖 ChatGPT'
            default: return 'Select Model'
        }
    }

    return (
        <div className="bg-dark-900 border-t border-dark-700 p-4">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowModelMenu( !showModelMenu )}
                            className="px-3 py-3 bg-dark-800 border border-dark-700 text-gray-100 text-sm rounded-lg hover:bg-dark-700 transition flex items-center gap-2 whitespace-nowrap"
                        >
                            {getModelLabel()}
                            <ChevronDown size={16} />
                        </button>

                        {showModelMenu && (
                            <div className="absolute bottom-full mb-2 left-0 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50 min-w-max">
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'auto' )}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-dark-700 transition ${modelOverride === 'auto' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                                >
                                    🔄 Auto Rotate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'gemini' )}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-dark-700 transition ${modelOverride === 'gemini' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                                >
                                    ✨ Gemini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectModel( 'openai' )}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-dark-700 transition ${modelOverride === 'openai' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                                >
                                    🤖 ChatGPT
                                </button>
                            </div>
                        )}
                    </div>

                    <textarea
                        value={input}
                        onChange={( e ) => setInput( e.target.value )}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Sara anything... (Ctrl+K for new chat, Ctrl+E to export)"
                        className="flex-1 bg-dark-800 border border-dark-700 text-gray-100 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:border-blue-500 resize-none"
                        rows="2"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Select a model or use Auto Rotate for smart routing
                </p>
            </div>
        </div>
    )
}
