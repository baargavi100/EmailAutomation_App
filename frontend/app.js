/**
 * Smart Email Automation — WENXT Technologies
 * app.js — Frontend Logic
 *
 * Developer: Baargavi Rajesh | March 2026
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Update API_BASE when deploying backend to Railway
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080/api';

// Auto-refresh interval (milliseconds)
const AUTO_REFRESH_MS = 30000;

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const bar = document.getElementById('statusBar');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  bar.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH CONTACT
// Detects @ symbol to decide email vs name search
// ─────────────────────────────────────────────────────────────────────────────
async function searchPerson() {
  const input   = document.getElementById('searchInput');
  const btn     = document.getElementById('searchBtn');
  const query   = input.value.trim();
  const results = document.getElementById('searchResults');

  if (!query) {
    showToast('Please enter a name or email to search.', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Searching...';
  results.style.display = 'none';
  results.innerHTML = '';

  try {
    const res  = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      results.style.display = 'block';
      results.innerHTML = `
        <div class="empty-state" style="padding:20px 0">
          <div class="empty-icon">🔍</div>
          <p>No contact found for "<strong>${escapeHtml(query)}</strong>".<br/>
          <small style="color:var(--text-muted)">You can still fill the form below and send — they'll be auto-added.</small></p>
        </div>`;
      // Pre-fill email if query looks like an email
      if (query.includes('@')) {
        document.getElementById('sendEmail').value = query;
      }
      return;
    }

    results.style.display = 'block';

    const persons = data.data;
    const html = persons.map(p => `
      <div class="person-card" onclick="fillForm(${JSON.stringify(p).split('"').join('&quot;')})">
        <div class="person-info">
          <div class="name">${escapeHtml(p.name || '')}
            <span class="provider-tag ${p.provider === 'Gmail' ? 'provider-gmail' : 'provider-outlook'}">
              ${escapeHtml(p.provider || '')}
            </span>
          </div>
          <div class="email-addr">${escapeHtml(p.email || '')}</div>
        </div>
        <span style="color:var(--text-muted);font-size:0.8rem">Click to use →</span>
      </div>
    `).join('');

    results.innerHTML = html;
    showToast(`Found ${persons.length} contact(s)`, 'success');

  } catch (err) {
    results.style.display = 'block';
    results.innerHTML = `<div class="empty-state" style="padding:16px 0"><p style="color:var(--error)">⚠️ Could not reach backend. Make sure Spring Boot is running on port 8080.</p></div>`;
    showToast('Backend unreachable — is Spring Boot running?', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Search';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILL SEND FORM FROM SELECTED PERSON
// ─────────────────────────────────────────────────────────────────────────────
function fillForm(person) {
  document.getElementById('sendName').value  = person.name  || '';
  document.getElementById('sendEmail').value = person.email || '';

  // Set provider radio
  const provider = (person.provider || 'Gmail').toLowerCase();
  const radio = document.querySelector(`input[name="provider"][value="${provider === 'outlook' ? 'Outlook' : 'Gmail'}"]`);
  if (radio) radio.checked = true;

  // Clear message so user types fresh
  document.getElementById('sendMessage').value = '';

  // Scroll to send form
  document.getElementById('sendName').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('sendMessage').focus();
  showToast(`"${person.name}" loaded into the send form`, 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAIL
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmail() {
  const name     = document.getElementById('sendName').value.trim();
  const email    = document.getElementById('sendEmail').value.trim();
  const message  = document.getElementById('sendMessage').value.trim();
  const provider = document.querySelector('input[name="provider"]:checked')?.value || 'Gmail';
  const schedule = document.querySelector('input[name="schedule"]:checked')?.value  || '0';
  const btn      = document.getElementById('sendBtn');

  // Validation
  if (!email) { showToast('Recipient email is required.', 'error'); return; }
  if (!message) { showToast('Please enter a short message.', 'error'); return; }
  if (!validateEmail(email)) { showToast('Please enter a valid email address.', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> &nbsp; Sending...';

  const payload = { name, email, provider, message, schedule };

  try {
    const res  = await fetch(`${API_BASE}/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      const scheduleLabel = scheduleText(schedule);
      showToast(`✅ Email sent successfully${scheduleLabel ? ' — ' + scheduleLabel : ''}`, 'success');
      document.getElementById('sendMessage').value = '';
      // Refresh logs/stats after a short delay
      setTimeout(() => { loadLogs(); loadStats(); }, 2000);
    } else {
      showToast(`❌ Send failed: ${data.message}`, 'error');
    }

  } catch (err) {
    showToast('Backend unreachable — is Spring Boot running?', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✈️ &nbsp; Send Email via AI';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD STATS
// ─────────────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const res  = await fetch(`${API_BASE}/stats`);
    const data = await res.json();

    if (data.success && data.data) {
      const s = data.data;
      setStatValue('statTotal',  s.total  ?? '—');
      setStatValue('statQueue',  s.queue  ?? '—');
      setStatValue('statSent',   s.sent   ?? '—');
      setStatValue('statViewed', s.viewed ?? '—');
    }
  } catch {
    // Silent — stats cards stay at '—' when backend is offline
    ['statTotal','statQueue','statSent','statViewed'].forEach(id => setStatValue(id, '—'));
  }
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD LOGS TABLE
// ─────────────────────────────────────────────────────────────────────────────
async function loadLogs() {
  const btn  = document.getElementById('refreshBtn');
  const body = document.getElementById('logsBody');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  try {
    const res  = await fetch(`${API_BASE}/logs`);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      body.innerHTML = `
        <tr><td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p>No email records yet. Send your first email above!</p>
          </div>
        </td></tr>`;
      return;
    }

    const rows = data.data;
    body.innerHTML = rows.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.name  || '—')}</td>
        <td>${escapeHtml(p.email || '—')}</td>
        <td>
          <span class="provider-tag ${(p.provider || '').toLowerCase() === 'gmail' ? 'provider-gmail' : 'provider-outlook'}">
            ${escapeHtml(p.provider || '—')}
          </span>
        </td>
        <td class="message-cell" title="${escapeHtml(p.message || '')}">${escapeHtml(truncate(p.message, 40))}</td>
        <td>${scheduleText(p.schedule || '0')}</td>
        <td>${statusBadge(p.status || '')}</td>
        <td>${formatTime(p.sentTime)}</td>
      </tr>
    `).join('');

  } catch {
    body.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <p style="color:var(--error)">⚠️ Could not load logs. Backend may be offline.</p>
        </div>
      </td></tr>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Refresh';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function statusBadge(status) {
  if (!status) return `<span class="badge-status badge-unknown">—</span>`;
  if (status.includes('Queue'))  return `<span class="badge-status badge-queue">${escapeHtml(status)}</span>`;
  if (status.includes('Sent'))   return `<span class="badge-status badge-sent">${escapeHtml(status)}</span>`;
  if (status.includes('Viewed')) return `<span class="badge-status badge-viewed">${escapeHtml(status)}</span>`;
  return `<span class="badge-status badge-unknown">${escapeHtml(status)}</span>`;
}

function scheduleText(val) {
  const map = { '0': 'Now', '180': '3 min', '3600': '1 hour', '86400': '24 hours' };
  return map[String(val)] || (val ? val + 's' : 'Now');
}

function formatTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '…' : str;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD: Press Enter in search box
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchPerson();
  });

  // Initial data load
  loadStats();
  loadLogs();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadStats();
    loadLogs();
  }, AUTO_REFRESH_MS);
});
