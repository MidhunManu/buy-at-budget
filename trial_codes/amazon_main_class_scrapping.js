const puppeteer = require('puppeteer');
const airportjs = require("airportsjs");

(async() => {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://en.wikipedia.org/wiki/List_of_airports_in_India");

    const getCodes = await page.evaluate(() => {
        const tag = document.querySelectorAll('div.od');
        var data = [];
        tag.forEach((i) => {
            data.push(i.innerText);
        })
        return data;
    })

    var i = {
        name: 'Kempegowda International Airport (BLR)',
        city: 'Bangalore',
        country: 'India',
        iata: 'BLR',
        latitude: 13.1979,
        longitude: 77.706299
      }
    
    var airport_data = [];
    airport_data
    for(var i = 0; i  < getCodes.length; i++) {
        airport_data.push(airportjs.lookupByIataCode(getCodes[i]));
    }

    airport_data = [...new Set(airport_data)];

    var names_of_airport = [];    
    for(var i = 0; i < airport_data.length; i++) {
        try{
            names_of_airport.push((airport_data[i].city));
        }
        catch{
            continue;
        }
    }
    // console.log(names_of_airport.includes("kempegowda"));
    // console.log(airportjs.lookupByIataCode("BLR"));

    //   console.log(names_of_airport.includes("Bangalore"))
    //   console.log(airportjs.searchByAirportName("Bangalore").iata);
    // var location = "Bangalore";
    // var d = (airportjs.lookupByIataCode());
    // d.forEach((i) => {
    //     console.log(i.city);
    // })
    airport_data.forEach((i) => {
        try {
            console.log({"name":i.name , "iata":i.iata});
        }
        catch {
            console.log("err");
        }
    })
    // for(var i = 0; i < d.length; i++) {
    //     console.log(i.iata);
    // }
    // console.log(names_of_airport);
    // await browser.close();
})();
