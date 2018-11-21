
let dateElem = document.getElementById("date-text");
let updateBtn = document.getElementById('update');

function updateUI(){
    browser.storage.local.get("date").then((res) => {
        let date = new Date(res.date);
        dateElem.innerText = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    });
}
updateUI();


updateBtn.addEventListener('click',()=>{
    fetch('https://api.exchangeratesapi.io/latest?symbols=USD,EUR&base=ILS').then((response) => {
        return response.json()
    }).then((json) => {
        data = json;
        browser.storage.local.clear().then(() => {
            browser.storage.local.set(data).then(()=>{
                updateBtn.style.backgroundColor = "#AED581";
                updateBtn.style.cursor = "no-drop";
                updateUI();
                updateBtn.innerText = "עודכן";
                updateBtn.setAttribute('disabled', true);
            });

        });

    });
});
       
