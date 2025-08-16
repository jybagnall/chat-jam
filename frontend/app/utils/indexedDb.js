const DB_NAME = "chatJam"; // db 이름

export function indexedDbGet(STORE, MODE_KEY) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, "readonly");
      const st = tx.objectStore(STORE);
      const req = st.get(MODE_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

// IndexedDB에 key-value 저장
export async function indexedDbSet(STORE, MODE_KEY) {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = rej;
  });
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite"); // 데이터 읽고 쓰기 모드
    tx.objectStore(STORE).put(STORE, MODE_KEY);
    tx.oncomplete = () => res();
    tx.onerror = rej;
  });
} // tx: 작업 범위 설정 (STORE라는 object store 안에서만 작업 가능)
