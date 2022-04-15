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

browser.contextMenus.create({
  id: 'gbp_to_ils',
  title: '£ → ₪',
  contexts: ['selection'],

});

function convertNumber(currency, info, tab) {
  browser.storage.local.get(currency).then((res) => {
    let operation;

    if (currency === 'USD') {
      operation = res.USD;
    } else if (currency === 'EUR') {
      operation = res.EUR;
    } else {
      operation = res.GBP;
    }

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
    convertNumber('USD', info, tab);
  } else if (info.menuItemId === 'euro_to_ils' && !displayingPopup) {
    convertNumber('EUR', info, tab);
  } else if (info.menuItemId === 'gbp_to_ils' && !displayingPopup) {
    convertNumber('GBP', info, tab);
  }
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.done) {
    displayingPopup = false;
  }
});
