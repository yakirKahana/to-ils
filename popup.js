const dateElem = document.getElementById('date-text');
const updateBtn = document.getElementById('update');

function updateUI() {
  browser.storage.local.get('date').then((res) => {
    const date = new Date(res.date);
    dateElem.innerText = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  });
}
updateUI();

updateBtn.addEventListener('click', () => {
  browser.runtime.sendMessage({ update: true }).then(() => {
    updateBtn.style.backgroundColor = '#AED581';
    updateBtn.style.cursor = 'no-drop';
    updateUI();
    updateBtn.innerText = 'עודכן';
    updateBtn.setAttribute('disabled', true);
  });
});
