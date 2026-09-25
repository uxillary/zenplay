import type { GameStatistics } from './types.ts'

export const DATABASE_NAME = 'zenplay-local'
export const DATABASE_VERSION = 1

export interface PersistenceDatabase {
  getSave(gameId: string): Promise<unknown>
  putSave(save: unknown): Promise<void>
  deleteSave(gameId: string): Promise<void>
  getStatistics(gameId: string): Promise<unknown>
  putStatistics(statistics: GameStatistics): Promise<void>
  updateStatistics(gameId: string, update: (current: unknown) => GameStatistics): Promise<GameStatistics>
}

let databasePromise: Promise<IDBDatabase> | undefined

const openDatabase = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable'))
  if (databasePromise) return databasePromise

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('gameSaves')) database.createObjectStore('gameSaves', { keyPath: 'gameId' })
      if (!database.objectStoreNames.contains('statistics')) database.createObjectStore('statistics', { keyPath: 'gameId' })
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = undefined
      }
      resolve(database)
    }
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage'))
    request.onblocked = () => reject(new Error('Local storage upgrade is blocked'))
  }).catch((error: unknown) => {
    databasePromise = undefined
    throw error
  })

  return databasePromise!
}

const withStore = async <T,>(storeName: 'gameSaves' | 'statistics', mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, mode)
  return new Promise((resolve, reject) => {
    let result: T
    let requestComplete = false
    let transactionComplete = false
    const request = operation(transaction.objectStore(storeName))
    request.onsuccess = () => {
      result = request.result
      requestComplete = true
      if (transactionComplete) resolve(result)
    }
    request.onerror = () => reject(request.error ?? new Error('Local storage request failed'))
    transaction.oncomplete = () => {
      transactionComplete = true
      if (requestComplete) resolve(result)
    }
    transaction.onabort = () => reject(transaction.error ?? new Error('Local storage transaction failed'))
  })
}

const mutateStatistics = async (
  gameId: string,
  update: (current: unknown) => GameStatistics,
): Promise<GameStatistics> => {
  const database = await openDatabase()
  const transaction = database.transaction('statistics', 'readwrite')
  const store = transaction.objectStore('statistics')
  const request = store.get(gameId)
  let result: GameStatistics
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      try {
        result = update(request.result)
        store.put(result)
      } catch (error) {
        transaction.abort()
        reject(error)
      }
    }
    request.onerror = () => reject(request.error ?? new Error('Local statistics request failed'))
    transaction.oncomplete = () => resolve(result)
    transaction.onabort = () => reject(transaction.error ?? new Error('Local statistics transaction failed'))
  })
}

export const localDatabase: PersistenceDatabase = {
  getSave: (gameId) => withStore('gameSaves', 'readonly', (store) => store.get(gameId)),
  putSave: async (save) => { await withStore('gameSaves', 'readwrite', (store) => store.put(save)) },
  deleteSave: (gameId) => withStore('gameSaves', 'readwrite', (store) => store.delete(gameId)),
  getStatistics: (gameId) => withStore('statistics', 'readonly', (store) => store.get(gameId)),
  putStatistics: async (statistics) => { await withStore('statistics', 'readwrite', (store) => store.put(statistics)) },
  updateStatistics: (gameId, update) => mutateStatistics(gameId, update),
}
