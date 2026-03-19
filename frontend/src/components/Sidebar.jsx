import React from 'react'
import { Plus, Trash2, Download } from 'lucide-react'

export default function Sidebar( { sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, onExport } ) {
    return (
        <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-dark-700">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No chat sessions yet
                    </div>
                ) : (
                    <div className="p-2">
                        {sessions.map( session => (
                            <div
                                key={session.id}
                                className={`group p-3 rounded-lg mb-2 cursor-pointer transition ${activeSessionId === session.id
                                        ? 'bg-dark-700 text-white'
                                        : 'hover:bg-dark-800 text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        onClick={() => onSelectSession( session.id )}
                                        className="flex-1 truncate"
                                    >
                                        <p className="text-sm font-medium truncate">{session.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {session.messages.length} messages
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={( e ) => {
                                                e.stopPropagation()
                                                onExport( session.id )
                                            }}
                                            className="p-1 hover:bg-dark-600 rounded transition"
                                            title="Export chat"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={( e ) => {
                                                e.stopPropagation()
                                                onDeleteSession( session.id )
                                            }}
                                            className="p-1 hover:bg-red-600 rounded transition"
                                            title="Delete chat"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700 text-xs text-gray-500">
                <p>Sara Bot v1.0</p>
                <p>Vibe Coding Agent</p>
            </div>
        </div>
    )
}
