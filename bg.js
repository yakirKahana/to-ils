

let displayingPopup = false;


fetch('https://api.ratesapi.io/api/latest?symbols=USD,EUR&base=ILS').then((response)=>{
        return response.json()}).then((json)=>{
            browser.storage.local.clear().then(()=>{
                browser.storage.local.set(json);
            });   
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

function convertNumber(usd,info,tab){
 
    //if usd == false then convert euro to shekel  
     browser.storage.local.get('rates').then(function(res){
        let operation = (usd ? res.rates.USD : res.rates.EUR);
        let selectedText = info.selectionText.replace(/[^\d.-]/g, '');
        if (selectedText.length > 0) {
            converted = (parseFloat(selectedText) / operation);
            msg = "₪" + converted.toFixed(2);
        } else {
            msg = "error"
        }

        browser.tabs.sendMessage(tab.id, msg).then(() => {

            displayingPopup = true;
        });

    });
  
}


browser.contextMenus.onClicked.addListener((info,tab)=>{
   
    if (info.menuItemId == "usd_to_ils" && !displayingPopup){
        convertNumber(true,info,tab);
    } else if (info.menuItemId == "euro_to_ils" && !displayingPopup){
        convertNumber(false,info,tab);
    }
    


});


browser.runtime.onMessage.addListener((msg)=>{
    if(msg.done){
        displayingPopup = false; 
    }

});
