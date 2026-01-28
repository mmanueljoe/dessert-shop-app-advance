import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue))
  const [error, setError] = useState(null)

  useEffect(() => {
    const save = () => {
      try {
        saveToStorage(key, value)
        setError(null)
      } catch (error) {
        setError(error)
      }
    }

    save()
    return () => {
      save()
    }
  }, [key, value])

  const setStoredValue = useCallback(newValueOrUpdater => {
    setValue(prev => (typeof newValueOrUpdater === 'function' ? newValueOrUpdater(prev) : newValueOrUpdater))
  }, [])

  return [value, setStoredValue, { error }]
}

export function loadFromStorage(key, initialValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return initialValue
    return JSON.parse(raw)
  } catch (error) {
    if (typeof console?.warn === 'function') {
      console.warn('[useLocalStorage] load("${key}"):', error?.message ?? error)
    }

    return initialValue
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { success: true, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    if (typeof console?.warn === 'function') {
      console.warn('[useLocalStorage] save("${key}"):', err.message)
    }
    return { success: false, error: err }
  }
}
