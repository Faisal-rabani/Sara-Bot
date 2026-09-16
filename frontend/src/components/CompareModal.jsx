import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { GeminiLogo, ChatGPTLogo } from './Logos'

export default function CompareModal( { isOpen, onClose, onCompare } ) {
    const [prompt, setPrompt] = useState( '' )
    const [model1, setModel1] = useState( 'gemini' )
    const [model2, setModel2] = useState( 'openai' )
    const [isLoading, setIsLoading] = useState( false )
    const [results, setResults] = useState( null )
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
                const codeId = `compare-code-${idx}`

                return (
                    <div key={idx} className="code-block my-3 bg-[#111] rounded-md border border-neutral-800/50 overflow-hidden">
                        <div className="flex items-center justify-between bg-neutral-900 px-4 py-2 border-b border-neutral-800/50">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">{language}</span>
                            <button
                                onClick={() => copyToClipboard( code, codeId )}
                                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
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
                        <pre className="text-sm text-neutral-200 overflow-x-auto p-4 bg-transparent">
                            <code className="font-mono">{code}</code>
                        </pre>
                    </div>
                )
            }
            return null
        } )
    }

    const handleCompare = async ( e ) => {
        e.preventDefault()
        if ( !prompt.trim() ) return

        setIsLoading( true )
        setResults( null )

        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch( `${API_URL}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { prompt, model1, model2 } )
            } )

            if ( !response.ok ) {
                throw new Error( `HTTP error! status: ${response.status}` )
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let model1Response = ''
            let model2Response = ''
            let currentModel = null

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

                            if ( data.type === 'model1_start' ) {
                                currentModel = 'model1'
                                console.log( '[COMPARE] Model 1 starting' )
                            } else if ( data.type === 'model2_start' ) {
                                currentModel = 'model2'
                                console.log( '[COMPARE] Model 2 starting' )
                            } else if ( data.type === 'model1_content' ) {
                                model1Response = data.data
                                console.log( '[COMPARE] Model 1 content received:', data.data.substring( 0, 50 ) )
                            } else if ( data.type === 'model2_content' ) {
                                model2Response = data.data
                                console.log( '[COMPARE] Model 2 content received:', data.data.substring( 0, 50 ) )
                            }

                            // Update results in real-time
                            setResults( { model1: model1Response, model2: model2Response } )
                        } catch ( e ) {
                            console.error( '[COMPARE] Parse error:', e, 'Line:', line )
                        }
                    }
                }
            }

            console.log( '[COMPARE] Final results:', { model1: model1Response, model2: model2Response } )
        } catch ( error ) {
            console.error( 'Compare error:', error )
            setResults( { model1: 'Error: ' + error.message, model2: 'Error: ' + error.message } )
        }
        setIsLoading( false )
    }

    if ( !isOpen ) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0A0A0A] rounded-xl w-full max-w-6xl max-h-[80vh] flex flex-col border border-neutral-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h2 className="text-lg font-orbitron font-bold text-orange-500 tracking-wider">Compare Models</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!results ? (
                        <form onSubmit={handleCompare} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wide">
                                    Your Prompt
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={( e ) => setPrompt( e.target.value )}
                                    placeholder="Enter a coding question to compare..."
                                    className="w-full bg-[#111] border border-neutral-800 text-neutral-200 rounded p-3 focus:outline-none focus:border-neutral-500 resize-none text-sm"
                                    rows="4"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wide">
                                        Model 1
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {model1 === 'gemini' ? <GeminiLogo className="w-4 h-4 text-blue-400" /> : <ChatGPTLogo className="w-4 h-4 text-green-500" />}
                                        </div>
                                        <select
                                            value={model1}
                                            onChange={( e ) => setModel1( e.target.value )}
                                            className="w-full bg-[#111] border border-neutral-800 text-neutral-200 rounded p-2.5 pl-9 focus:outline-none focus:border-neutral-500 text-sm appearance-none"
                                        >
                                            <option value="gemini">Gemini</option>
                                            <option value="openai">ChatGPT</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wide">
                                        Model 2
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {model2 === 'gemini' ? <GeminiLogo className="w-4 h-4 text-blue-400" /> : <ChatGPTLogo className="w-4 h-4 text-green-500" />}
                                        </div>
                                        <select
                                            value={model2}
                                            onChange={( e ) => setModel2( e.target.value )}
                                            className="w-full bg-[#111] border border-neutral-800 text-neutral-200 rounded p-2.5 pl-9 focus:outline-none focus:border-neutral-500 text-sm appearance-none"
                                        >
                                            <option value="gemini">Gemini</option>
                                            <option value="openai">ChatGPT</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="w-full px-4 py-3 bg-white hover:bg-gray-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black rounded font-medium transition text-sm"
                            >
                                {isLoading ? 'Comparing...' : 'Compare Models'}
                            </button>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 h-[500px]">
                            <div className="bg-[#111] rounded flex flex-col border border-neutral-800/50 overflow-hidden">
                                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
                                    <h3 className="font-medium text-white flex items-center gap-2">
                                        {model1 === 'gemini' 
                                            ? <><GeminiLogo className="w-4 h-4 text-blue-400" /> Gemini</> 
                                            : <><ChatGPTLogo className="w-4 h-4 text-green-500" /> ChatGPT</>
                                        }
                                    </h3>
                                </div>
                                <div className="p-5 overflow-y-auto flex-1 text-sm text-neutral-300">
                                    {renderContent( results.model1 )}
                                </div>
                            </div>
                            
                            <div className="bg-[#111] rounded flex flex-col border border-neutral-800/50 overflow-hidden">
                                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
                                    <h3 className="font-medium text-white flex items-center gap-2">
                                        {model2 === 'gemini' 
                                            ? <><GeminiLogo className="w-4 h-4 text-blue-400" /> Gemini</> 
                                            : <><ChatGPTLogo className="w-4 h-4 text-green-500" /> ChatGPT</>
                                        }
                                    </h3>
                                </div>
                                <div className="p-5 overflow-y-auto flex-1 text-sm text-neutral-300">
                                    {renderContent( results.model2 )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-800 p-4 flex justify-end gap-3">
                    {results && (
                        <button
                            onClick={() => setResults( null )}
                            className="px-4 py-2 bg-[#111] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded text-sm transition"
                        >
                            New Comparison
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded text-sm font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
