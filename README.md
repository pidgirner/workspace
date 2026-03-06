# Team Workspace (MVP foundation)

Начальная база для командного workspace-приложения в формате PWA с фокусом на:

- мессенджер (в стиле современных корпоративных/потребительских чатов),
- органайзер задач,
- календарь,
- интеграцию с почтой (уведомления и события),
- Supabase как основная БД,
- масштабируемую архитектуру для дальнейшего развития.

## Что уже сделано

- Подготовлен стартовый PWA-каркас (manifest + service worker).
- Добавлен интерфейс дашборда с 4 ключевыми модулями продукта.
- Описана архитектура, доменная модель и roadmap.
- Добавлена спецификация интеграции почты для Beget.
- Добавлен готовый SQL-скрипт под Supabase.

## Быстрый запуск

```bash
python3 -m http.server 4173
```

Откройте `http://localhost:4173`.

> Для корректной проверки service worker используйте localhost.

## Структура

- `index.html` — каркас интерфейса MVP.
- `styles.css` — базовый UI-стиль.
- `app.js` — минимальная интерактивность и регистрация SW.
- `sw.js` — offline-first кеширование shell.
- `manifest.webmanifest` — PWA-манифест.
- `docs/architecture.md` — архитектурные решения.
- `docs/email-integration.md` — конкретные параметры Beget + контракт событий.
- `docs/supabase-setup.md` — как поднять БД в Supabase.
- `docs/roadmap.md` — этапы развития.
- `supabase/schema.sql` — SQL-схема для Supabase.
- `docs/github-publish.md` — инструкция, как выложить проект в GitHub.

## Следующий шаг

Когда будете готовы, можно добавить backend-сервис синхронизации почты (IMAP IDLE / polling) и связать его с таблицами `mail_events` и `mail_routing_rules` в Supabase.
