// Click any project figure to view it larger.
const box = document.getElementById('lightbox');
if (box) {
  document.querySelectorAll('.fig-frame img, .media-frame img').forEach(img => {
    img.addEventListener('click', () => {
      const fig = img.closest('.media-item, .fig-frame');
      const cap = fig && fig.querySelector('.media-caption, .fig-caption');
      box.querySelector('img').src = img.src;
      box.querySelector('img').alt = img.alt;
      box.querySelector('p').textContent = cap ? cap.textContent.trim() : '';
      box.showModal();
    });
  });
  box.addEventListener('click', e => {
    if (e.target === box || e.target.tagName === 'BUTTON') box.close();
  });
}
