let displayingPopup = false;

let rates = {
  USD: 0.0,
  ILS: 0.0,
  GBP: 0.0,
};

function mapAttrsToObj(data) {
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
// Get rates
getRates()
  // convert base to ils
  .then((EuroBasedRates) => convertBaseToShekel(EuroBasedRates))
  // save results to rates && clear browser storage
  .then((convertedRates) => {
    rates = convertedRates;
    return browser.storage.local.clear();
  })
  // set browser storage to rates
  .then(() => {
    browser.storage.local.set(rates);
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
  browser.storage.local.get((usd ? 'USD' : 'EUR')).then((res) => {
    const operation = (usd ? res.USD : res.EUR);
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
