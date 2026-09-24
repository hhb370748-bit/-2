const DATABASE_NAME = 'mustafa-kattan-store';
const DATABASE_VERSION = 1;
const STORE_NAME = 'state';

interface DatabaseRecord<T> {
  key: string;
  value: T;
}

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح قاعدة البيانات'));
  });

export const readDatabaseValue = async <T>(key: string): Promise<T | undefined> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .get(key);
    request.onsuccess = () => {
      const record = request.result as DatabaseRecord<T> | undefined;
      resolve(record?.value);
      database.close();
    };
    request.onerror = () => {
      reject(request.error || new Error(`تعذر قراءة ${key}`));
      database.close();
    };
  });
};

export const writeDatabaseValue = async <T>(key: string, value: T): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ key, value } satisfies DatabaseRecord<T>);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error(`تعذر حفظ ${key}`));
    };
  });
};

export const clearDatabase = async (): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('تعذر تصفير قاعدة البيانات'));
    };
  });
};
