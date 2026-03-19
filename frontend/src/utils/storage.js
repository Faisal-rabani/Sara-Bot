const STORAGE_KEY = 'sara_bot_sessions'

export const getSessions = () => {
    const data = localStorage.getItem( STORAGE_KEY )
    return data ? JSON.parse( data ) : []
}

export const saveSessions = ( sessions ) => {
    localStorage.setItem( STORAGE_KEY, JSON.stringify( sessions ) )
}

export const createSession = ( title = 'New Chat' ) => {
    const sessions = getSessions()
    const newSession = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: new Date().toISOString()
    }
    sessions.unshift( newSession )
    saveSessions( sessions )
    return newSession
}

export const getSession = ( id ) => {
    const sessions = getSessions()
    return sessions.find( s => s.id === id )
}

export const updateSession = ( id, updates ) => {
    const sessions = getSessions()
    const index = sessions.findIndex( s => s.id === id )
    if ( index !== -1 ) {
        sessions[index] = { ...sessions[index], ...updates }
        saveSessions( sessions )
        return sessions[index]
    }
    return null
}

export const deleteSession = ( id ) => {
    const sessions = getSessions()
    const filtered = sessions.filter( s => s.id !== id )
    saveSessions( filtered )
    return filtered
}

export const addMessageToSession = ( sessionId, message ) => {
    const session = getSession( sessionId )
    if ( session ) {
        session.messages.push( message )
        updateSession( sessionId, { messages: session.messages } )
    }
}

export const updateSessionTitle = ( id, title ) => {
    return updateSession( id, { title } )
}
