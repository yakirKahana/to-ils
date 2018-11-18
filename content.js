(function(){

    //document.body.innerHTML += `<div id="to-shekel-popup"></div>`
    let popup = document.createElement("DIV");
    popup.setAttribute("id","to-shekel-popup");
    popup.appendChild(document.createTextNode(""));
    document.body.appendChild(popup);
    //let popup = document.getElementById('to-shekel-popup');
    browser.runtime.onMessage.addListener((data) => {

        popup.innerText = data;
        popup.style.display = "inline-block";
        setTimeout(() => { popup.className = "show"; }, 10);


        setTimeout(() => {
            popup.className = "";
            setTimeout(() => {
                popup.style.display = "none";
                browser.runtime.sendMessage({ done: true }).then();
            }, 510);

        }, 3000);
    });
}());