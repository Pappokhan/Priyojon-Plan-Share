// ---------- Toast notifications (used instead of alert()) ----------
window.ppToast = function (message, type) {
  var stack = document.getElementById('toast-stack');
  if (!stack) {
    window.alert(message);
    return;
  }
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  stack.appendChild(toast);

  requestAnimationFrame(function () { toast.classList.add('is-visible'); });

  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () { toast.remove(); }, 250);
  }, 2600);
};

document.addEventListener('DOMContentLoaded', function () {
  // ---------- Mobile nav toggle ----------
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Profile photo upload preview ----------
  const avatarInput = document.getElementById('avatar_image');
  const avatarPreviewImg = document.getElementById('avatar-preview-img');
  const avatarPreviewEmoji = document.getElementById('avatar-preview-emoji');
  const avatarRemoveBtn = document.getElementById('avatar-remove-btn');
  const removeAvatarField = document.getElementById('remove_avatar');
  const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

  if (avatarInput && avatarPreviewImg) {
    avatarInput.addEventListener('change', function () {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      if (file.size > MAX_AVATAR_BYTES) {
        const msg = window.ppI18n ? window.ppI18n.t('flash.invalid_image_type') : 'Please choose a smaller image.';
        if (window.ppToast) window.ppToast(msg, 'error'); else alert(msg);
        avatarInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        avatarPreviewImg.src = e.target.result;
        avatarPreviewImg.style.display = 'block';
        if (avatarPreviewEmoji) avatarPreviewEmoji.style.display = 'none';
        if (avatarRemoveBtn) avatarRemoveBtn.style.display = 'inline-flex';
        if (removeAvatarField) removeAvatarField.value = '0';
      };
      reader.readAsDataURL(file);
    });
  }

  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', function () {
      if (avatarInput) avatarInput.value = '';
      if (avatarPreviewImg) {
        avatarPreviewImg.src = '';
        avatarPreviewImg.style.display = 'none';
      }
      if (avatarPreviewEmoji) avatarPreviewEmoji.style.display = 'flex';
      if (removeAvatarField) removeAvatarField.value = '1';
      avatarRemoveBtn.style.display = 'none';
    });
  }

  // ---------- Delete-plan confirmation (language-aware) ----------
  document.querySelectorAll('.js-delete-plan-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const message = window.ppI18n ? window.ppI18n.t('dashboard.delete_confirm') : 'Are you sure?';
      if (!confirm(message)) event.preventDefault();
    });
  });

  // ---------- Dynamic plan-step rows ----------
  const container = document.getElementById('items-container');
  const addBtn = document.getElementById('add-item');

  if (!container || !addBtn) return;

  function attachRemove(row) {
    const btn = row.querySelector('.remove-item');
    btn.addEventListener('click', function () {
      if (container.querySelectorAll('.item-row').length > 1) {
        row.remove();
      } else {
        row.querySelectorAll('input').forEach((i) => (i.value = ''));
      }
    });
  }

  container.querySelectorAll('.item-row').forEach(attachRemove);

  addBtn.addEventListener('click', function () {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" name="item_time" data-i18n-placeholder="planform.item_time_placeholder" aria-label="Time" data-i18n-aria-label="planform.col_time" />
      <input type="text" name="item_icon" placeholder="🎬" maxlength="4" aria-label="Icon" data-i18n-aria-label="planform.col_icon" />
      <input type="text" name="item_activity" data-i18n-placeholder="planform.item_activity_placeholder" aria-label="Activity" data-i18n-aria-label="planform.col_activity" />
      <input type="text" name="item_note" data-i18n-placeholder="planform.item_note_placeholder" aria-label="Note" data-i18n-aria-label="planform.col_note" />
      <button type="button" class="remove-item" aria-label="Remove this step" data-i18n-aria-label="planform.remove_item_label">✕</button>
    `;
    container.appendChild(row);
    attachRemove(row);
    if (window.ppI18n) window.ppI18n.apply();
    row.querySelector('input').focus();
  });
});
