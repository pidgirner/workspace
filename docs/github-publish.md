# Публикация Team Workspace в GitHub

Ниже — готовый чеклист, чтобы загрузить текущий проект в GitHub.

## 1) Создать репозиторий в GitHub

1. Откройте GitHub → **New repository**.
2. Название, например: `team-workspace`.
3. Выберите `Private` или `Public`.
4. **Не добавляйте** README/.gitignore/license (они уже есть локально).
5. Нажмите **Create repository**.

## 2) Подключить удалённый origin

В корне проекта выполните:

```bash
git remote add origin https://github.com/<YOUR_ORG_OR_USER>/team-workspace.git
```

Если `origin` уже есть и нужно заменить URL:

```bash
git remote set-url origin https://github.com/<YOUR_ORG_OR_USER>/team-workspace.git
```

Проверка:

```bash
git remote -v
```

## 3) Отправить код в GitHub

```bash
git push -u origin work
```

> Если ваша основная ветка на GitHub называется `main`, можно сделать:
>
> ```bash
> git push -u origin work:main
> ```

## 4) Проверить что всё загрузилось

- В репозитории должны появиться:
  - PWA-файлы (`index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `styles.css`),
  - документация в `docs/`,
  - SQL для Supabase в `supabase/schema.sql`.

## 5) Рекомендуемая настройка после публикации

- Добавить branch protection для `main`.
- Включить Issues/Projects.
- Добавить GitHub Secrets для будущих интеграций (если будет CI/CD):
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 6) Быстрый вариант через GitHub CLI (опционально)

Если установлен `gh` и вы авторизованы:

```bash
gh repo create <YOUR_ORG_OR_USER>/team-workspace --private --source=. --remote=origin --push
```

Эта команда создаст репозиторий, добавит `origin` и сразу отправит код.
