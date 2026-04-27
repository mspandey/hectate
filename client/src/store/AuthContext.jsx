import { useState, createContext } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('hectate_user')
    return s ? JSON.parse(s) : null
  })

  const login = (userData) => {
    const u = {
      ...userData,
      verified_woman: true,
      verificationSteps: userData.verificationSteps || { genderPassed: true, aadhaarPassed: true },
      joined: userData.joined || new Date().toISOString(),
    }
    localStorage.setItem('hectate_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('hectate_user')
    setUser(null)
  }

  const isVerified = user?.verified_woman

  return (
    <AuthContext.Provider value={{ user, login, logout, isVerified }}>
      {children}
    </AuthContext.Provider>
  )
}
