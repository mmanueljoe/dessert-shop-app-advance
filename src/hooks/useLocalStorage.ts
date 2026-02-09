import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (newValueOrUpdater: T | ((prev: T) => T)) => void, { error: Error | null }] {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const save = () => {
      try {
        saveToStorage(key, value)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    save()
    return () => {
      save()
    }
  }, [key, value])

  const setStoredValue = useCallback((newValueOrUpdater: T | ((prev: T) => T)) => {
    setValue(prev =>
      typeof newValueOrUpdater === 'function' ? (newValueOrUpdater as (prev: T) => T)(prev) : newValueOrUpdater,
    )
  }, [])

  return [value, setStoredValue, { error }]
}

export function loadFromStorage<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return initialValue
    return JSON.parse(raw) as T
  } catch (error) {
    if (typeof console?.warn === 'function') {
      console.warn(`[useLocalStorage] load("${key}"):`, error instanceof Error ? error.message : String(error))
    }

    return initialValue
  }
}

export function saveToStorage<T>(key: string, value: T): { success: boolean; error: Error | null } {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { success: true, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    if (typeof console?.warn === 'function') {
      console.warn(`[useLocalStorage] save("${key}"):`, err.message)
    }
    return { success: false, error: err }
  }
}
