const express = require('express');
const airportjs = require("airportsjs");
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');
app.use(express.urlencoded());
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'));
app.use(express.static('public'));

var data_to_send = []; // this array is very important
var product_name_to_buy;

app.get('/' , (req , res) => {
  // res.render("view/home.ejs");
  res.render("view/shopping.ejs");
})
app.post('/food' , (req , res) => {
  res.render("view/food.ejs");
  var foodDetails = [];
});
app.post('/getCheapestFood' , (req , res) => {
  var foodname = req.body.food_name
  var url = `https://www.swiggy.com/search?query=${foodname}`;
  console.log(foodname);

  (async () => {
    const browser = await puppeteer.launch({headless : false});
    const page = await browser.newPage();
    await page.goto(url);
    // await page.screenshot({path : "ss.png"});
  })

  res.render("view/food.ejs");
  res.end();
})


app.post("/shopping" , (req , res) => {
  // var product_name = req.body.product_name;
  // var product_name = product_name.repalce(" " , "+");
  // var amazon_url = `https://www.amazon.in/s?k=${product_name}`;
  res.render("view/shopping.ejs");

})

app.post("/shopitem" , (req , res) => {
    var product_name = req.body.product_name_html;
    product_name_to_buy = product_name;

    product_name = product_name.replaceAll(" " , "+");
    var url = `https://www.amazon.in/s?k=${product_name}`;




      (async () => {
      const browser = await puppeteer.launch({headless : true});
      const page = await browser.newPage();
      await page.goto(url);
      // const hrefs = await page.$$eval('a.a-size-base .a-link-normal .s-underline-text .s-underline-link-text .s-link-style .a-text-normal', as => as.map(a => a.href));
      // console.log(hrefs)
      
// await page.evaluate('document.querySelector("span.styleNumber").getAttribute("data-Color")')
      const hrefs = await page.evaluate(() => {
        const href_tag = document.querySelectorAll("a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal");
        var href_array = [];
        // a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal
        href_tag.forEach((i) => {
          href_array.push("https://www.amazon.in/"+i.getAttribute("href"));
        })
        return href_array;
      })
      
      const getRatings = await page.evaluate(() => {
        const r = document.querySelectorAll("span.a-icon-alt");
        var ratings = [];

        r.forEach((elements) => {
          ratings.push(elements.innerText);
        })
        return ratings;
      });

      const getNames = await page.evaluate(() => {
        const names_of_products = document.querySelectorAll("span.a-size-medium.a-color-base.a-text-normal");
        var names = [];
        names_of_products.forEach((elements) => {
          names.push(elements.innerHTML);
        })
        return names
      })
      
      // finding all prices 
      const grab = await page.evaluate(() => {
        const priceTag = document.querySelectorAll("span.a-price-whole");
        var data = [];

        priceTag.forEach((elements) => {
          data.push(elements.innerText);
        })

        return (data);
        
      });

      var data = grab;
      console.log(data);
      for(var i = 0; i < data.length; i++) {
        data[i] = data[i].replaceAll("," , "");
      }

      for(var i = 0; i < data.length; i++) {
        data[i] = data[i].replaceAll("\n" , "");
      }

      data = data.map(Number);
      // console.log(data);
/*
       const arr = [10, 5, 0, 15, 30];
       data = data.sort((a , b) => {return a - b});
       if(data[0] > data[data.length - 1]) {
         data.reverse();
       }
       */
      
       var pseudo_data = [];
       var final = [];

       for(var i = 0; i < data.length; i++) {
        pseudo_data.push(data[i]);
       }

       pseudo_data = pseudo_data.sort((a , b) => {return a - b});
       for(var i = 0; i < 5; i++) 
        final.push(data.indexOf(pseudo_data[i]))
        console.log("final")
       console.log(final)

      for(var i = 0; i < final.length; i++)
       console.log(data[final[i]])
      for(var i = 0; i < final.length; i++)
       console.log(hrefs[final[i] - 1])

      // try {
        console.log(`${product_name} pricelist:\n`)
        console.log(data);
        console.log("\nminimum first \n")
        for(var i = 0; i < 5; i++) {
          console.log(data[i] - 1);
        }
      // }
      // catch {
      //   console.log(data[data.length - 1]);
      // }

      try {
        console.log(hrefs);
        console.log(`${product_name} pricelist:\n`)
        console.log(data);
        console.log("\nminimum first \n")
        for(var i = 0; i < 5; i++) {
          console.log(data[i]);
        }

        data_to_send = []
        for(var i = 0; i < 5; i++) {
          data_to_send.push({"price":data[final[i]] , "url":hrefs[final[i]] , "ratings":getRatings[i] , "names":getNames[i] , "name_of_product":product_name_to_buy});
        }
        // .........................................................................
        // data = data.sort((a , b) => {return a - b});
        // var min = Math.min(...data);
        // console.log("cheapest : "+min);
        // console.log(data.indexOf(min));
        // console.log(hrefs[data.indexOf(min)]);
        // console.log(`https://amazon.in/${hrefs[pos]}`)
        // --------------------------------------------------
      } catch (error) {
        console.log("err");
      }


//      const min = Math.min(...data);
//  	  console.log(min);

      await browser.close();
      res.render("view/shopping_result.ejs");
      // res.sendFile(path.join(__dirname,'public/shopping_result.html'))
      res.end();
    })();
})  

app.post("/contact" , (req , res) => {
  res.render("view/contact.ejs");
})

app.post("/trips" , (req , res) => {
	res.render("view/trips.ejs");
})

app.post("/getCheapestFare", (req , res) => {
  // to get airport codes
  var start_location = (req.body.start_location);
  var end_location = (req.body.end_location);
  var time = (req.body.departure_date);
  var store_start_location_name;
  var store_start_location_iata;
  var store_end_location_name;
  var store_end_location_iata;
  var year;
  var month;
  var day;

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
    var airport_data = [];
    var final_airport_data = [];

    for(var i = 0; i  < getCodes.length; i++) {
        airport_data.push(airportjs.lookupByIataCode(getCodes[i]));
    }
  
    airport_data = [...new Set(airport_data)];
    airport_data.forEach((i) => {
      try {
        if(i != undefined) {
          final_airport_data.push({"name":i.name, "iata":i.iata, "city":i.city});
        }
      }
      catch {
        console.log("leave this city");
      }
    })

    final_airport_data.forEach((i) => {
      if(i.city == start_location) {
        store_start_location_iata = i.iata;
      }
    })

    final_airport_data.forEach((i) => {
      if(i.city == end_location) {
        store_end_location_iata = i.iata;
      }
    })
    
    time = time.split("-");
    year = time[0];
    month = time[1];
    day = time[2];
    var departure_day = `${year}-${month}-${day}`;
    const url = `https://www.spicejet.com/search?from=${store_start_location_iata}&to=${store_end_location_iata}&tripType=1&departure=${departure_day}&adult=1&child=0&srCitizen=0&infant=0&currency=INR&redirectTo=/`;
    console.log(url);


    const getFlightTicketsSpiceJet = await page.evaluate(() => {
      const priceTag = document.querySelectorAll('div.css-76zvg2.r-jwli3a.r-poiln3.r-ubezar.r-majxgm.r-6dt33c');
      var prices = [];
      priceTag.forEach((i) => {
        console.log(prices.push(i.innerText));
      })
      return prices;
    });

    console.log(getFlightTicketsSpiceJet);
  

    await browser.close();
  })();


  res.render("view/trips.ejs");
  res.end();
})

app.get("/login" , (req , res) => {
  var email = req.body.email;
  var password = req.body.passwd;

  if((email != 'midhunmanu@gmail.com') && (password != '1233')) {
    res.render("view/shopping.ejs");
  }
  else {
    res.send("invalid password or email")
  }
})

app.get("/signup" , (req , res) => {
  res.send("under development...");
})

app.get("/getdata" , (req , res) => {
  res.send(data_to_send);
})
app.listen(8080);