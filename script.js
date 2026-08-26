/**
 * 생성형 AI 사무자동화 강의 대시보드 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs Event Listeners
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Use currentTarget or closest('.nav-btn') to safely get data-tab attribute from child span elements
      const targetBtn = e.currentTarget || e.target.closest('.nav-btn');
      if (targetBtn) {
        const tabId = targetBtn.getAttribute('data-tab');
        switchTab(tabId);
      }
    });
  });

  // Course Switcher Event Listeners
  const switcherBtns = document.querySelectorAll('.switcher-btn');
  switcherBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget || e.target.closest('.switcher-btn');
      if (targetBtn) {
        const courseId = targetBtn.getAttribute('data-course');
        switchCourse(courseId);
      }
    });
  });

  // ESC Key listener to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
  });
});

/**
 * Course Switcher Function (Office vs Video Course)
 */
function switchCourse(courseId) {
  // Update Switcher Button active state
  document.querySelectorAll('.switcher-btn').forEach(btn => btn.classList.remove('active'));
  const activeSwitcherBtn = document.querySelector(`.switcher-btn[data-course="${courseId}"]`);
  if (activeSwitcherBtn) activeSwitcherBtn.classList.add('active');

  // Toggle Course Views
  document.querySelectorAll('.course-view').forEach(view => view.classList.add('hidden'));
  const targetCourseView = document.getElementById(`course-${courseId}`);
  if (targetCourseView) targetCourseView.classList.remove('hidden');

  // Toggle Navigation Link Groups
  document.querySelectorAll('.nav-links').forEach(group => group.classList.add('hidden'));
  const targetNavGroup = document.querySelector(`.nav-links-${courseId}`);
  if (targetNavGroup) {
    targetNavGroup.classList.remove('hidden');
    // Switch to default active tab of target course
    const firstActiveTab = targetNavGroup.querySelector('.nav-btn.active') || targetNavGroup.querySelector('.nav-btn');
    if (firstActiveTab) {
      const tabId = firstActiveTab.getAttribute('data-tab');
      switchTab(tabId);
    }
  }

  // Synchronize Top Notion Button URL based on selected course
  const notionBtn = document.querySelector('.btn-nav-action');
  if (notionBtn) {
    if (courseId === 'video') {
      notionBtn.href = 'https://9core.notion.site/AI-3c80ce4c022480a3998fd078acbfa2d5';
    } else {
      notionBtn.href = 'https://9core.notion.site/3c60ce4c0224805eac61cfd7dac72a73?source=copy_link';
    }
  }

  // Scroll to top smooth
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Modal Control Functions
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function closeModalOnOverlay(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

/**
 * Tab Switcher Function
 */
function switchTab(tabId) {
  // Remove active state from all buttons & panes
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  // Add active state to target button & pane
  const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(tabId);

  if (targetBtn) targetBtn.classList.add('active');
  if (targetPane) targetPane.classList.add('active');

  // Synchronize 3-Step Practice Workflow Card active state in Hero section
  document.querySelectorAll('.workflow-card').forEach(card => {
    card.classList.remove('active-step');
    const badge = card.querySelector('.workflow-badge');
    if (badge) badge.classList.remove('highlight');

    if (card.getAttribute('data-workflow-tab') === tabId) {
      card.classList.add('active-step');
      if (badge) badge.classList.add('highlight');
    }
  });

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Copy Code Content by Element ID
 */
function copyCode(elementId) {
  const codeElem = document.getElementById(elementId);
  if (!codeElem) return;

  const textToCopy = codeElem.textContent;
  copyText(textToCopy);
}

/**
 * Toggle Collapsible Prompt Card Expansion
 */
function toggleExpandPrompt(btn) {
  const card = btn.closest('.prompt-card');
  if (!card) return;
  const cardBody = card.querySelector('.prompt-card-body');
  if (!cardBody) return;

  if (cardBody.classList.contains('expanded')) {
    cardBody.classList.remove('expanded');
    btn.innerHTML = '더보기 🔽';
  } else {
    cardBody.classList.add('expanded');
    btn.innerHTML = '접기 🔼';
  }
}

/**
 * Generic Copy Text to Clipboard & Show Toast Notification
 */
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('클립보드에 성공적으로 복사되었습니다!');
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('복사에 실패했습니다. 직접 드래그해서 복사해 주세요.');
  });
}

/**
 * Toast Notification Display
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

/**
 * Force Direct File Download (Supports both file:// and http(s):// protocols)
 */
function forceDownload(event, url, filename) {
  if (event) event.preventDefault();

  // If INVOICE_PDF_BASE64 is defined and target file is invoice_form.pdf, use octet-stream Data URL to guarantee direct file save without PDF viewer
  if (typeof INVOICE_PDF_BASE64 !== 'undefined' && (url.includes('invoice_form.pdf') || filename.includes('견적서양식.pdf'))) {
    triggerDownload(INVOICE_PDF_BASE64, filename);
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      const blob = xhr.response;
      const blobUrl = window.URL.createObjectURL(blob);
      triggerDownload(blobUrl, filename);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } else {
      triggerDownload(url, filename);
    }
  };

  xhr.onerror = function () {
    triggerDownload(url, filename);
  };

  xhr.send();
}

function triggerDownload(urlOrData, filename) {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = urlOrData;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 300);
}

/**
 * Image Enlargement Modal Preview
 */
function openImageModal(imgSrc, title) {
  let modal = document.getElementById('modal-image-preview');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-image-preview';
    modal.className = 'modal-overlay hidden';
    modal.setAttribute('onclick', "closeModalOnOverlay(event, 'modal-image-preview')");
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 1400px; width: 96vw; padding: 20px 24px; background: var(--colors-surface-card); border-radius: var(--rounded-lg); border: 1px solid var(--colors-hairline); box-shadow: 0 20px 60px rgba(0,0,0,0.45);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--colors-hairline-soft); padding-bottom: 10px;">
          <h3 id="modal-image-title" style="margin: 0; font-size: 18px; font-weight: 700; color: var(--colors-ink);">이미지 크게 보기</h3>
          <button class="btn-close-modal" onclick="closeModal('modal-image-preview')" style="background: transparent; border: none; font-size: 28px; cursor: pointer; color: var(--colors-muted); font-weight: 700; line-height: 1;">&times;</button>
        </div>
        <div style="text-align: center; overflow: auto; border-radius: var(--rounded-md); background: #0a0a09; padding: 16px; display: flex; justify-content: center; align-items: center; min-height: 75vh;">
          <img id="modal-image-img" src="" alt="확대 이미지" style="max-width: 100%; max-height: 88vh; width: auto; height: auto; object-fit: contain; border-radius: var(--rounded-sm); box-shadow: 0 8px 32px rgba(0,0,0,0.6);">
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const imgElem = modal.querySelector('#modal-image-img');
  const titleElem = modal.querySelector('#modal-image-title');
  if (imgElem) imgElem.src = imgSrc;
  if (titleElem) titleElem.textContent = title || '이미지 크게 보기';
  
  modal.classList.remove('hidden');
}
