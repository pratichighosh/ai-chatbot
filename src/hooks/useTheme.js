import { useState, useEffect, useCallback } from 'react'

const THEME_STORAGE_KEY = 'chatbot-theme'
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY) || THEME_OPTIONS.SYSTEM
    }
    return THEME_OPTIONS.SYSTEM
  })

  const [resolvedTheme, setResolvedTheme] = useState(THEME_OPTIONS.LIGHT)

  // Function to get system theme
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_OPTIONS.DARK
        : THEME_OPTIONS.LIGHT
    }
    return THEME_OPTIONS.LIGHT
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((themeToApply) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      const isDark = themeToApply === THEME_OPTIONS.DARK
      
      root.classList.remove(THEME_OPTIONS.LIGHT, THEME_OPTIONS.DARK)
      root.classList.add(themeToApply)
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0f1419' : '#ffffff')
      }
    }
  }, [])

  // Update theme
  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      
      const actualTheme = newTheme === THEME_OPTIONS.SYSTEM 
        ? getSystemTheme() 
        : newTheme
      
      setResolvedTheme(actualTheme)
      applyTheme(actualTheme)
    }
  }, [getSystemTheme, applyTheme])

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === THEME_OPTIONS.LIGHT 
      ? THEME_OPTIONS.DARK 
      : THEME_OPTIONS.LIGHT
    updateTheme(newTheme)
  }, [resolvedTheme, updateTheme])

  // Cycle through all themes
  const cycleTheme = useCallback(() => {
    const themeOrder = [THEME_OPTIONS.LIGHT, THEME_OPTIONS.DARK, THEME_OPTIONS.SYSTEM]
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    updateTheme(themeOrder[nextIndex])
  }, [theme, updateTheme])

  // Initialize theme on mount
  useEffect(() => {
    const actualTheme = theme === THEME_OPTIONS.SYSTEM 
      ? getSystemTheme() 
      : theme
    
    setResolvedTheme(actualTheme)
    applyTheme(actualTheme)
  }, [theme, getSystemTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === THEME_OPTIONS.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e) => {
        const newSystemTheme = e.matches ? THEME_OPTIONS.DARK : THEME_OPTIONS.LIGHT
        setResolvedTheme(newSystemTheme)
        applyTheme(newSystemTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, applyTheme])

  // Check if current theme is dark
  const isDark = resolvedTheme === THEME_OPTIONS.DARK

  // Check if using system theme
  const isSystem = theme === THEME_OPTIONS.SYSTEM

  return {
    theme,
    resolvedTheme,
    isDark,
    isSystem,
    setTheme: updateTheme,
    toggleTheme,
    cycleTheme,
    systemTheme: getSystemTheme(),
    THEME_OPTIONS
  }
}

export default useTheme