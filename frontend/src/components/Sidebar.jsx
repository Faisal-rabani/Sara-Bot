import React from 'react'
import { Plus, Trash2, Download, LogOut, X } from 'lucide-react'

export default function Sidebar( { isOpen, onClose, sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, onExport, onOpenAbout, user, onLogout, isAuthenticated, onOpenLogin } ) {
    return (
        <div 
            className={`flex flex-col h-screen bg-[#0A0A0A] border-r border-neutral-800/50 transition-all duration-300 ease-in-out z-50 absolute md:relative ${
                isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden border-r-0'
            }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800/50 flex items-center justify-between gap-2">
                <button
                    onClick={onNewChat}
                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 py-2 px-4 rounded transition text-sm font-medium"
                >
                    <Plus size={16} />
                    New Chat
                </button>
                <button 
                    onClick={onClose}
                    className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
                {!isAuthenticated ? (
                    <div className="p-4 text-center flex flex-col items-center justify-center h-full opacity-50">
                        <p className="text-xs text-neutral-500 mb-2">Sign in to save and view your chat history.</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No chat sessions yet
                    </div>
                ) : (
                    <div className="p-2">
                        {sessions.map( session => (
                            <div
                                key={session.id}
                                className={`group p-3 rounded-md mb-1 cursor-pointer transition border ${activeSessionId === session.id
                                        ? 'bg-neutral-900 border-neutral-800 text-white'
                                        : 'bg-transparent border-transparent hover:bg-neutral-900/50 text-neutral-400'
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

            {/* User Profile or Login CTA */}
            {isAuthenticated && user ? (
                <div className="p-4 border-t border-neutral-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0 overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-white truncate">{user.name}</span>
                            <span className="text-xs text-neutral-500 truncate">{user.role}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-neutral-900 flex-shrink-0"
                        title="Log out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            ) : (
                <div className="p-4 border-t border-neutral-800/50 flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-white">Get responses tailored to you</h3>
                    <p className="text-xs text-neutral-400 mb-1">
                        Log in to get answers based on saved chats, plus create images and upload files.
                    </p>
                    <button 
                        onClick={onOpenLogin}
                        className="w-full glass-shine bg-white hover:bg-neutral-200 text-black py-2 rounded-lg text-sm font-medium transition"
                    >
                        Log in
                    </button>
                </div>
            )}

            {/* Footer */}
            <div 
                onClick={onOpenAbout}
                className="p-4 border-t border-neutral-800/50 text-[10px] text-neutral-500 flex flex-col gap-1 uppercase tracking-widest font-medium cursor-pointer hover:bg-neutral-900 transition"
            >
                <p>Sara Bot v1.0</p>
                <p>Vibe Agent • About</p>
            </div>
        </div>
    )
}
