import { ref, watch, onMounted } from 'vue'

/**
 * Dark mode composable with persistent storage
 * Manages theme state and applies/removes dark class on document
 */
export function useDarkMode() {
  const isDarkMode = ref(false)
  const storageKey = 'markdown-editor-dark-mode'

  /**
   * Toggle dark mode on/off
   */
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  /**
   * Set dark mode state explicitly
   */
  const setDarkMode = (enabled: boolean) => {
    isDarkMode.value = enabled
  }

  /**
   * Apply dark mode class to document
   */
  const applyDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  /**
   * Save preference to localStorage
   */
  const savePreference = (enabled: boolean) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(enabled))
    } catch (error) {
      console.warn('Failed to save dark mode preference:', error)
    }
  }

  /**
   * Load preference from localStorage
   */
  const loadPreference = (): boolean => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load dark mode preference:', error)
    }

    // Default: check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Initialize dark mode on component mount
   */
  const initializeDarkMode = () => {
    const savedPreference = loadPreference()
    isDarkMode.value = savedPreference
    applyDarkMode(savedPreference)
  }

  // Watch for changes and apply them
  watch(isDarkMode, (newValue) => {
    applyDarkMode(newValue)
    savePreference(newValue)
  })

  // Initialize on mount
  onMounted(() => {
    initializeDarkMode()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      const savedPreference = localStorage.getItem(storageKey)
      if (savedPreference === null) {
        setDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  })

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  }
}
