// ===============================
// ENGINE: INDEX
// FILE: api.js
// PURPOSE: index data layer (optional navigation data)
// ===============================

// сейчас пусто — но оставляем контракт
// чтобы index engine мог расширяться без изменения архитектуры

export async function getIndexData(env) {
  return {
    ok: true,
    pages: []
  };
}
