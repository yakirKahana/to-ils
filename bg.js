let displayingPopup = false;

// fetch('https://api.ratesapi.io/api/latest?symbols=USD,EUR&base=ILS').then((response) => response.json()).then((json) => {
//   browser.storage.local.clear().then(() => {
//     browser.storage.local.set(json);
//   });
// });

let rates = {
  USD: 0.0,
  ILS: 0.0,
  GBP: 0.0,
};

function mapAttrsToObj(data) {
  console.log('data', data);
  const array = Array.prototype.slice.call(data);
  array.forEach((cube) => {
    currency = cube.getAttribute('currency');
    switch (currency) {
      case 'USD':
        rates.USD = parseFloat(cube.getAttribute('rate'));
        break;

      case 'ILS':
        rates.ILS = parseFloat(cube.getAttribute('rate'));
        break;

      case 'GBP':
        rates.GBP = parseFloat(cube.getAttribute('rate'));
        break;
    }
  });
  return rates;
}

function convertBaseToShekel(EuroBasedRates) {
  return new Promise((resolve) => {
    const newRates = {
      EUR: 1 / EuroBasedRates.ILS,
      USD: EuroBasedRates.USD / EuroBasedRates.ILS,
      GBP: EuroBasedRates.GBP / EuroBasedRates.ILS,
      date: EuroBasedRates.date,
    };

    resolve(newRates);
  });
}

function getRates() {
  return fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml')
    .then((response) => response.text())
    .then((data) => {
      const pasrer = new DOMParser();
      const xml = pasrer.parseFromString(data, 'text/xml');
      const date = xml.getElementsByTagName('Cube')[1].getAttribute('time');
      const RecivedRates = mapAttrsToObj(xml.getElementsByTagName('Cube'));
      RecivedRates.date = date;
      return RecivedRates;
    });
}
getRates()
  .then((EuroBasedRates) => convertBaseToShekel(EuroBasedRates))
  .then((convertedRates) => {
    rates = convertedRates;
    console.log(convertedRates);
  });

browser.contextMenus.create({
  id: 'usd_to_ils',
  title: '$ → ₪',
  contexts: ['selection'],

});

browser.contextMenus.create({
  id: 'euro_to_ils',
  title: '€ → ₪',
  contexts: ['selection'],

});

function convertNumber(usd, info, tab) {
  // if usd == false then convert euro to shekel
  browser.storage.local.get('rates').then((res) => {
    const operation = (usd ? res.rates.USD : res.rates.EUR);
    const selectedText = info.selectionText.replace(/[^\d.-]/g, '');
    if (selectedText.length > 0) {
      converted = (parseFloat(selectedText) / operation);
      msg = `₪${converted.toFixed(2)}`;
    } else {
      msg = 'error';
    }

    browser.tabs.sendMessage(tab.id, msg).then(() => {
      displayingPopup = true;
    });
  });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'usd_to_ils' && !displayingPopup) {
    convertNumber(true, info, tab);
  } else if (info.menuItemId === 'euro_to_ils' && !displayingPopup) {
    convertNumber(false, info, tab);
  }
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.done) {
    displayingPopup = false;
  }
});
