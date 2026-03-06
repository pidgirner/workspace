# Supabase setup (БД + почта)

## 1) Как применить SQL

1. Создайте проект в Supabase.
2. Откройте SQL Editor.
3. Вставьте содержимое `supabase/schema.sql` и выполните.

## 2) Что создаёт SQL

- базовые таблицы пользователей/команд,
- мессенджер (каналы/сообщения),
- задачи и проекты,
- календарные события,
- интеграцию с почтой (`mailboxes`, `mail_events`, `mail_routing_rules`),
- уведомления,
- RLS и базовые политики доступа.

## 3) Пример добавления mailbox Beget

```sql
insert into public.mailboxes (
  team_id,
  email,
  incoming_protocol,
  incoming_host,
  incoming_port,
  incoming_security,
  outgoing_host,
  outgoing_port,
  outgoing_security,
  username,
  password_ciphertext,
  created_by
)
values (
  'TEAM_UUID',
  'team@your-domain.ru',
  'imap',
  'imap.beget.com',
  993,
  'ssl',
  'smtp.beget.com',
  465,
  'ssl',
  'team@your-domain.ru',
  'ENCRYPTED_SECRET',
  'USER_UUID'
);
```

> `password_ciphertext` должен хранить уже зашифрованный секрет (не plaintext).
