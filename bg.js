
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


browser.contextMenus.onClicked.addListener((info,tab)=>{
    if (info.menuItemId == "usd_to_ils" && !displayingPopup){
        var msg = "";
        var selectedText = info.selectionText.replace(/[^\d.-]/g, '');
        if (selectedText.length > 0){
            selectedText = (parseFloat(selectedText) / data.rates.USD);
            console.log(selectedText);
            msg = "₪" + selectedText.toString() ;

        }else{
            msg = "error"
        }


        browser.tabs.sendMessage(tab.id,msg).then(()=>{
            displayingPopup = true;
        });


    } else if (info.menuItemId == "euro_to_ils" && !displayingPopup){
        browser.browserAction.setBadgeText({ text: "eur", tabId: tab.id});
    }
});


browser.runtime.onMessage.addListener((msg)=>{
    if(msg.done){
        displayingPopup = false; 
    }
});
