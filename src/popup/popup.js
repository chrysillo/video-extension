// Toolbar popup: shows the version and reloads the extension from disk.
const versionLabel = document.getElementById('version');
const reloadButton = document.getElementById('reload');
const hint = document.getElementById('option-hint');

versionLabel.textContent = `v${chrome.runtime.getManifest().version}`;

reloadButton.addEventListener('click', () => {
  reloadButton.disabled = true;
  reloadButton.classList.add('spinning');
  hint.textContent = 'Reloading… refresh pages to apply';
  chrome.runtime.sendMessage({ type: 'reload-extension' });
});
