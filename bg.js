
let data;
let displayingPopup = false;


fetch('https://api.exchangeratesapi.io/latest?symbols=USD,EUR&base=ILS').then((response)=>{
        return response.json()}).then((json)=>{
            data = json;
        });


browser.contextMenus.create({
    id:"usd_to_ils",
    title: "$ → ₪",
    contexts:["selection"]

});


browser.contextMenus.create({
    id: "euro_to_ils",
    title: "€ → ₪",
    contexts: ["selection"]

});

function convertNumber(usd,info){
    //if usd == false then convert euro to shekel
    let operation = (usd ? data.rates.USD : data.rates.EUR) ;
    console.log(operation);
    let msg = "";
    let selectedText = info.selectionText.replace(/[^\d.-]/g, '');
    if (selectedText.length > 0) {
        selectedText = (parseFloat(selectedText) / operation);
        console.log(selectedText);
        msg = "₪" + selectedText.toFixed(2);

    } else {
        msg = "error"
    }

    return msg;


}


browser.contextMenus.onClicked.addListener((info,tab)=>{
    let msg;
    if (info.menuItemId == "usd_to_ils" && !displayingPopup){
        msg = convertNumber(true,info);
    } else if (info.menuItemId == "euro_to_ils" && !displayingPopup){
        msg = convertNumber(false,info);
    }
    console.log(msg);
    browser.tabs.sendMessage(tab.id, msg).then(() => {
        displayingPopup = true;
    });

});


browser.runtime.onMessage.addListener((msg)=>{
    if(msg.done){
        displayingPopup = false; 
    }
});
