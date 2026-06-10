import React, { createContext, useContext, useState } from 'react'

const ModeContext = createContext(null)

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('tourist') // 'tourist' | 'explorer'
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
