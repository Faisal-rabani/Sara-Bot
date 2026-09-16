import React, { useState } from 'react'
import { Bot, Mail, Lock, ArrowRight, X } from 'lucide-react'

export default function LoginModal({ isOpen, onClose, onLogin, initialView = 'login' }) {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock authentication: accept any non-empty credentials for now
    if (email && password) {
      onLogin({
        name: 'Faisal Rabani',
        role: 'Creative Developer',
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faisal'
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-neutral-800 rounded-2xl relative overflow-hidden shadow-2xl">
        
        {/* Background decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center relative z-10">
          <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Bot size={28} className="text-orange-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLoginView ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-neutral-400 mb-8 text-center text-sm">
            {isLoginView ? 'Sign in to chat with Sara-Bot.' : 'Join to start chatting with Sara-Bot.'}
          </p>

          {!isLoginView ? (
            <div className="w-full flex flex-col gap-4">
              <button 
                onClick={() => setIsLoginView(true)}
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                Log in
              </button>
              <button 
                onClick={() => setIsLoginView(true)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white font-medium py-2.5 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                Sign up with Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Continue <ArrowRight size={16} />
              </button>
              
              <button 
                type="button"
                onClick={() => setIsLoginView(false)}
                className="text-neutral-500 text-xs mt-2 hover:text-white transition-colors"
              >
                Need an account? Sign up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
