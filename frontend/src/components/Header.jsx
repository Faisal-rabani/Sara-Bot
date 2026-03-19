import React from 'react'
import { Zap } from 'lucide-react'

export default function Header( { onCompareModels } ) {
    return (
        <div className="bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Sara Bot</h1>
                    <p className="text-xs text-gray-400">Vibe Coding Agent</p>
                </div>
            </div>

            <button
                onClick={onCompareModels}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
            >
                Compare Models
            </button>
        </div>
    )
}
