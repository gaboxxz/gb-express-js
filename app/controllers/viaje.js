const request = require('request');
const split = require('split');
const Telegraf = require('telegraf');
const tele = new Telegraf('1005905152:AAHp2TKh1aNqgSDeoqPiSwt5IvpYQrfCKVw');

exports.searchFligths = (airoportFrom, airoportTo, fligthDate, maxPrice) => {
  const options = {
    method: 'POST',
    url: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0',
    headers: {
      'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
      'x-rapidapi-key': '1eec0757ebmshfb8d331e3f16ae6p14cb35jsnc1347c94cadc',
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      cabinClass: 'economy',
      children: '0',
      infants: '0',
      country: 'AR',
      currency: 'ARS',
      locale: 'es-AR',

      originPlace: airoportFrom,
      destinationPlace: airoportTo,
      tripType: 'one-way',
      outboundDate: fligthDate,
      // inBoundDate:'2020-03-23',
      adults: '1'
    }
  };
  let token;

  request(options, (error, response, body) => {
    if (error) {
      throw new Error(error);
    }

    // console.log(response);
    const list = response.headers.location.split('/');
    token = list[list.length - 1];
    token = token.substring(0, 36);
    // console.log(token)

    const options = {
      method: 'GET',
      url: `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/${token}`,
      qs: { sortType: 'price', sortOrder: 'asc', pageIndex: '0', pageSize: '1' },
      headers: {
        'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
        'x-rapidapi-key': '1eec0757ebmshfb8d331e3f16ae6p14cb35jsnc1347c94cadc'
      }
    };

    request(options, (error, response, body) => {
      if (error) {
        throw new Error(error);
      }
      const arr = JSON.parse(body);
      const Price = Number(arr.Itineraries[0].PricingOptions[0].Price);
      if (Price < maxPrice) {
        const fligth = {
          Price,
          Link: arr.Itineraries[0].PricingOptions[0].DeeplinkUrl
        };
        console.log(
          `Precio desde el aeropuerto: ${airoportFrom} hacia el aeropuerto ${airoportTo} fecha: ${fligthDate}: es: $${JSON.stringify(
            fligth
          )}`
        );
        tele.telegram
          .sendMessage(
            536433485,
            `${'DEAL ALERT!!!' +
              'Precio desde el aeropuerto: '}${airoportFrom} hacia el aeropuerto ${airoportTo} fecha: ${fligthDate}: es: $${JSON.stringify(
              fligth
            )}`
          )
          .catch(console.log);
      }
    });
  });
};

this.searchFligths('EZE-sky', 'LHR-sky', '2020-03-01', process.env.ezeLhr);

setTimeout(() => {
  console.log('Waiting 1');
}, 6000);

this.searchFligths('EZE-sky', 'LGW-sky', '2020-03-01', process.env.ezeLGW);

setTimeout(() => {
  console.log('waiting 2');
}, 6000);

this.searchFligths('ROME-sky', 'EZE-sky', '2020-03-23', process.env.romaEzeiza);
setTimeout(() => {
  console.log('Waiting');
}, 60000);
