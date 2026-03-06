const statusEl = document.getElementById('status');
const installBtn = document.getElementById('installBtn');
const resetBtn = document.getElementById('resetBtn');

const tabs = Array.from(document.querySelectorAll('.tab-btn'));
const panels = {
  messenger: document.getElementById('panel-messenger'),
  tasks: document.getElementById('panel-tasks'),
  calendar: document.getElementById('panel-calendar'),
  mail: document.getElementById('panel-mail')
};

const storageKey = 'teamWorkspaceMvpV2';
const nowIso = () => new Date().toISOString();

const defaultState = {
  messages: [{ id: crypto.randomUUID(), author: 'System', text: 'Добро пожаловать в Team Workspace!', createdAt: nowIso() }],
  tasks: [],
  events: [],
  mailConfig: null
};

const readState = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
};

let state = readState();
const saveState = () => localStorage.setItem(storageKey, JSON.stringify(state));

const formatDate = (iso) => new Date(iso).toLocaleString('ru-RU');

const setActiveTab = (name) => {
  tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === name));
  Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle('active', key === name));
};

tabs.forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));

const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const messageAuthor = document.getElementById('messageAuthor');
const messageText = document.getElementById('messageText');

const renderMessages = () => {
  messagesList.innerHTML = state.messages
    .slice()
    .reverse()
    .map(
      (m) => `
      <div class="item">
        <div class="item-row"><strong>${m.author}</strong><span class="item-meta">${formatDate(m.createdAt)}</span></div>
        <div>${m.text}</div>
      </div>`
    )
    .join('');
};

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.messages.push({ id: crypto.randomUUID(), author: messageAuthor.value.trim(), text: messageText.value.trim(), createdAt: nowIso() });
  messageForm.reset();
  saveState();
  renderMessages();
});

const tasksList = document.getElementById('tasksList');
const taskForm = document.getElementById('taskForm');

const renderTasks = () => {
  if (!state.tasks.length) {
    tasksList.innerHTML = '<div class="item item-meta">Пока нет задач.</div>';
    return;
  }

  tasksList.innerHTML = state.tasks
    .map(
      (t) => `
      <div class="item">
        <div class="item-row">
          <strong>${t.title}</strong>
          <div class="item-actions">
            <span class="tag ${t.priority}">${t.priority}</span>
            <span class="tag ${t.status === 'done' ? 'done' : ''}">${t.status}</span>
          </div>
        </div>
        <div class="item-meta">Ответственный: ${t.assignee || '—'} | Дедлайн: ${t.due || '—'}</div>
        <div class="item-actions" style="margin-top:8px;">
          <button data-action="toggle" data-id="${t.id}">${t.status === 'done' ? 'Вернуть в работу' : 'Выполнено'}</button>
          <button data-action="delete" data-id="${t.id}">Удалить</button>
        </div>
      </div>`
    )
    .join('');
};

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.tasks.push({
    id: crypto.randomUUID(),
    title: document.getElementById('taskTitle').value.trim(),
    assignee: document.getElementById('taskAssignee').value.trim(),
    due: document.getElementById('taskDue').value,
    priority: document.getElementById('taskPriority').value,
    status: 'todo',
    createdAt: nowIso()
  });
  taskForm.reset();
  saveState();
  renderTasks();
});

tasksList.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;
  const { action, id } = button.dataset;
  const idx = state.tasks.findIndex((t) => t.id === id);
  if (idx < 0) return;

  if (action === 'toggle') {
    state.tasks[idx].status = state.tasks[idx].status === 'done' ? 'in_progress' : 'done';
  }
  if (action === 'delete') {
    state.tasks.splice(idx, 1);
  }

  saveState();
  renderTasks();
});

const eventsList = document.getElementById('eventsList');
const eventForm = document.getElementById('eventForm');

const renderEvents = () => {
  if (!state.events.length) {
    eventsList.innerHTML = '<div class="item item-meta">Пока нет событий.</div>';
    return;
  }

  eventsList.innerHTML = state.events
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start))
    .map(
      (ev) => `
      <div class="item">
        <div class="item-row"><strong>${ev.title}</strong><span class="item-meta">${ev.location || 'Без локации'}</span></div>
        <div class="item-meta">${formatDate(ev.start)} — ${formatDate(ev.end)}</div>
      </div>`
    )
    .join('');
};

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const start = document.getElementById('eventStart').value;
  const end = document.getElementById('eventEnd').value;
  if (new Date(end) <= new Date(start)) {
    statusEl.textContent = 'Ошибка: окончание события должно быть позже начала.';
    return;
  }

  state.events.push({
    id: crypto.randomUUID(),
    title: document.getElementById('eventTitle').value.trim(),
    start,
    end,
    location: document.getElementById('eventLocation').value.trim()
  });
  eventForm.reset();
  saveState();
  renderEvents();
  statusEl.textContent = 'Событие добавлено.';
});

const mailForm = document.getElementById('mailForm');
const mailSummary = document.getElementById('mailSummary');

const renderMailSummary = () => {
  if (!state.mailConfig) {
    mailSummary.textContent = 'Настройки почты ещё не сохранены.';
    return;
  }

  const cfg = state.mailConfig;
  mailSummary.innerHTML = `
    <strong>Сохранено:</strong> ${cfg.email}<br>
    IMAP: ${cfg.imapHost}:${cfg.imapPort} (${cfg.imapSecurity})<br>
    SMTP: ${cfg.smtpHost}:${cfg.smtpPort} (${cfg.smtpSecurity})<br>
    <span class="muted">Пароль хранится только локально в localStorage для MVP-демо.</span>
  `;
};

mailForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.mailConfig = {
    email: document.getElementById('mailEmail').value.trim(),
    login: document.getElementById('mailLogin').value.trim(),
    password: document.getElementById('mailPassword').value,
    imapHost: document.getElementById('imapHost').value.trim(),
    imapPort: Number(document.getElementById('imapPort').value),
    imapSecurity: document.getElementById('imapSecurity').value,
    smtpHost: document.getElementById('smtpHost').value.trim(),
    smtpPort: Number(document.getElementById('smtpPort').value),
    smtpSecurity: document.getElementById('smtpSecurity').value,
    updatedAt: nowIso()
  };
  saveState();
  renderMailSummary();
  statusEl.textContent = 'Почтовые настройки сохранены.';
});

const fillMailFormIfAny = () => {
  if (!state.mailConfig) return;
  const cfg = state.mailConfig;
  document.getElementById('mailEmail').value = cfg.email || '';
  document.getElementById('mailLogin').value = cfg.login || '';
  document.getElementById('mailPassword').value = cfg.password || '';
  document.getElementById('imapHost').value = cfg.imapHost || 'imap.beget.com';
  document.getElementById('imapPort').value = cfg.imapPort || 993;
  document.getElementById('imapSecurity').value = cfg.imapSecurity || 'ssl';
  document.getElementById('smtpHost').value = cfg.smtpHost || 'smtp.beget.com';
  document.getElementById('smtpPort').value = cfg.smtpPort || 465;
  document.getElementById('smtpSecurity').value = cfg.smtpSecurity || 'ssl';
};

resetBtn.addEventListener('click', () => {
  localStorage.removeItem(storageKey);
  state = structuredClone(defaultState);
  renderMessages();
  renderTasks();
  renderEvents();
  renderMailSummary();
  mailForm.reset();
  statusEl.textContent = 'Данные очищены.';
});

let deferredPrompt;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      statusEl.textContent = 'Готово: приложение работает как PWA.';
    } catch (error) {
      statusEl.textContent = `Ошибка service worker: ${error}`;
    }
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.hidden = true;
  deferredPrompt = null;
});

renderMessages();
renderTasks();
renderEvents();
fillMailFormIfAny();
renderMailSummary();
