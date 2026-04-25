# Wiki Project — Cloudflare (Workers / Functions + Static Frontend)

## 📌 Общее описание

Это минимальная wiki-система:

- Markdown редактор страниц
- просмотр страниц в HTML
- API для сохранения и получения данных
- хранение данных в Cloudflare KV
- статический фронтенд из папки `/public`

---

## 🧱 Текущая архитектура

Проект работает в гибридном режиме:

### Frontend (static)

Папка `/public`:

- `index.html` — список страниц (главная)
- `editor.html` — редактор Markdown
- `view.html` — просмотр страницы
- `styles.css` — стили
- `js/app.js` — логика списка страниц
- `js/bootstrap.js` — общая инициализация
- `js/core/schema.js` — будущая модель данных

---

### Backend API (Cloudflare Functions)

Папка `/functions/api`:

- `GET /api/pages` — список всех страниц
- `GET /api/page/:slug` — получить страницу
- `POST /api/page/:slug` — сохранить страницу

---

### Хранилище

Cloudflare KV Namespace:

- `WIKI_DB`
- ID: `5e40f830ea514bb18008eaa72672b77e`

Используется для:
- хранения страниц
- чтения/записи Markdown и HTML

---

## 📦 Модель данных

```json
{
  "slug": "string",
  "title": "string",
  "content": "markdown",
  "html": "generated html"
}
