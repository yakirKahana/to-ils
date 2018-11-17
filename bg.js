
var rates;


fetch('https://api.exchangeratesapi.io/latest?symbols=USD,EUR&base=ILS').then((response)=>{
        return response.json()}).then((json)=>{
            rates = json.rates;
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
    if (info.menuItemId == "usd_to_ils"){
        var msg = "";
        var selectedText = info.selectionText.replace(/[^\d.-]/g, '');
        if (selectedText.length > 0){
            selectedText = (parseFloat(selectedText) / rates.USD);
            console.log(selectedText);
            msg = "₪" + selectedText.toString() ;
            
        }else{
            msg = "error"
        }
        //browser.browserAction.setBadgeText({ text: msg, tabId: tab.id});
        browser.notifications.create("usd",{type:"basic",title:msg, message:""});


    } else if (info.menuItemId == "euro_to_ils"){
        browser.browserAction.setBadgeText({ text: "eur", tabId: tab.id});
    }
});
