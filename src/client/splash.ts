document.getElementById('start-button')?.addEventListener('click', (event) => {
  event.preventDefault();
  window.location.href = 'game.html';
});

document.getElementById('docs-link')?.addEventListener('click', () => {
  window.open('https://developers.reddit.com/docs', '_blank', 'noopener,noreferrer');
});

document.getElementById('playtest-link')?.addEventListener('click', () => {
  window.open('https://www.reddit.com/r/Devvit', '_blank', 'noopener,noreferrer');
});
