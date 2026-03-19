import React, { useState } from 'react'
import { X } from 'lucide-react'

export default function CompareModal( { isOpen, onClose, onCompare } ) {
    const [prompt, setPrompt] = useState( '' )
    const [model1, setModel1] = useState( 'gemini' )
    const [model2, setModel2] = useState( 'openai' )
    const [isLoading, setIsLoading] = useState( false )
    const [results, setResults] = useState( null )

    const handleCompare = async ( e ) => {
        e.preventDefault()
        if ( !prompt.trim() ) return

        setIsLoading( true )
        setResults( null )

        try {
            const response = await fetch( '/api/compare', {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-dark-900 rounded-lg w-full max-w-4xl max-h-96 flex flex-col border border-dark-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                    <h2 className="text-xl font-bold text-white">Compare Models</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!results ? (
                        <form onSubmit={handleCompare} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Prompt
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={( e ) => setPrompt( e.target.value )}
                                    placeholder="Enter a prompt to compare..."
                                    className="w-full bg-dark-800 border border-dark-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Model 1
                                    </label>
                                    <select
                                        value={model1}
                                        onChange={( e ) => setModel1( e.target.value )}
                                        className="w-full bg-dark-800 border border-dark-700 text-gray-100 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="gemini">✨ Gemini</option>
                                        <option value="openai">🤖 ChatGPT</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Model 2
                                    </label>
                                    <select
                                        value={model2}
                                        onChange={( e ) => setModel2( e.target.value )}
                                        className="w-full bg-dark-800 border border-dark-700 text-gray-100 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="gemini">✨ Gemini</option>
                                        <option value="openai">🤖 ChatGPT</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition"
                            >
                                {isLoading ? 'Comparing...' : 'Compare'}
                            </button>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-dark-800 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-400 mb-2">
                                    {model1 === 'gemini' ? '✨ Gemini' : '🤖 ChatGPT'}
                                </h3>
                                <p className="text-sm text-gray-100 whitespace-pre-wrap">{results.model1}</p>
                            </div>
                            <div className="bg-dark-800 rounded-lg p-4">
                                <h3 className="font-semibold text-purple-400 mb-2">
                                    {model2 === 'gemini' ? '✨ Gemini' : '🤖 ChatGPT'}
                                </h3>
                                <p className="text-sm text-gray-100 whitespace-pre-wrap">{results.model2}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-dark-700 p-4 flex justify-end gap-2">
                    {results && (
                        <button
                            onClick={() => setResults( null )}
                            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition"
                        >
                            New Comparison
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
