const express = require('express');
const airportjs = require("airportsjs");
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');
app.use(express.urlencoded());
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'));
app.use(express.static('public'));

var data_to_send = []; // this array is result data of shopping, only for amazon
var shopping_final_data_to_send; // shopping json reusult
var flight_data_to_send = []; // this is array is data of flights
var product_name_to_buy;
var store_start_location_name;
var store_start_location_iata;
var store_end_location_name;
var store_end_location_iata;
var spicejet_url;
var final_groceries_list = [];

app.get('/' , (req , res) => {
  // res.render("view/home.ejs");
  res.render("view/shopping.ejs");
})
app.post('/groceries' , (req , res) => {
  res.render("view/groceries.ejs");
});
app.post('/findCheapestGroceries' , (req , res) => {
  var grocery_name = req.body.find_groceries;
	jio_url = `https://www.jiomart.com/catalogsearch/result?q=${grocery_name}`;
	jio_url = jio_url.replaceAll(" ", "+");
	var groceries_data_to_send = [];
  (async () => {
    const browser = await puppeteer.launch({headless : true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.102 Safari/537.36');
    await page.goto(jio_url);

    groceries_data_to_send = [];
    final_groceries_list = [];

		const get_product_price = await page.evaluate(() => {
			const price_tag = document.querySelectorAll("span#final_price");
			var data = [];
			price_tag.forEach((i) => {
				data.push(i.innerText);
			})
			for(var i = 0; i < data.length; i++) {
				data[i] = data[i].replaceAll(" ", "");
				data[i] = data[i].replaceAll("\u20B9", "");
			}
			return data;
		})

		const get_product_name = await page.evaluate(() => {
			const name_tag = document.querySelectorAll("span.clsgetname");
			var data = [];
			name_tag.forEach((i) => {
				data.push(i.innerText);
			})
			return data;
		})

		const get_product_link = await page.evaluate(() => {
			const link_tag = document.querySelectorAll("a.category_name.prod-name");
			var data = [];
			link_tag.forEach((i) => {
        // data.push("https://www.bigbasket.com"+i.getAttribute("href"));
				data.push(`https://www.jiomart.com${i.getAttribute("href")}/`);
			})
			return data;
		});
		
		var jio_mart_data = [];
		for(var i = 0; i < get_product_link.length; i++) {
			jio_mart_data.push({"name":get_product_name[i], "price":Number(get_product_price[i]), "company": "JioMart", "link":get_product_link[i]});
    }
		for(var i = 0; i < get_product_link.length; i++) {
			groceries_data_to_send.push(jio_mart_data[i]);
		}
 		console.log("jio mart price")
		console.log(get_product_price); 

		//console.log(jio_mart_data);

// big basket
		var big_basket_url = `https://www.bigbasket.com/ps/?q=${grocery_name}&nc=as`
		big_basket_url = big_basket_url.replaceAll(" ", "+");
    const big_basket_page = await browser.newPage();
    await big_basket_page.goto(big_basket_url);	

		const get_big_basket_price = await big_basket_page.evaluate(() => {
			const big_basket_price_tag = document.querySelectorAll("span.discnt-price>span.ng-binding");
			var data = [];
			big_basket_price_tag.forEach((i) => {
				data.push(i.innerText);
			})
			return data;
		})

		const get_big_basket_name = await big_basket_page.evaluate(() => {
			const big_basket_name_tag = document.querySelectorAll("div.col-sm-12.col-xs-7.prod-name>a.ng-binding");
			var data = [];
			big_basket_name_tag.forEach((i) => {
				data.push(i.innerText);
			})
			return data;
		})

		const get_big_basket_link = await big_basket_page.evaluate(() => {
			const big_basket_link_tag = document.querySelectorAll("div.col-sm-12.col-xs-7.prod-name>a.ng-binding");
			var data = [];
			big_basket_link_tag.forEach((i) => {
				data.push("https://www.bigbasket.com"+i.getAttribute("href"));
			})
			return data;
		})

		
		var big_basket_data = [];
		for(var i = 0; i < get_big_basket_link.length; i++) {
			big_basket_data.push({"name":get_big_basket_name[i], "price":Number(get_big_basket_price[i]), "company": "Big Basket", "link":get_big_basket_link[i]});
		}

		for(var i = 0; i < get_big_basket_link.length; i++) {
			groceries_data_to_send.push(big_basket_data[i]);
		}	

   function swap(arr, xp, yp) {
     var temp = arr[xp];
     arr[xp] = arr[yp];
     arr[yp] = temp;
		}
    
    for(var i = 0; i < groceries_data_to_send.length - 1; i++) {
      for(var j = 0; j < groceries_data_to_send.length - i - 1; j++) {
        if(groceries_data_to_send[j].price > groceries_data_to_send[j + 1].price) {
          swap(groceries_data_to_send, j, j + 1);
        }
      }
    }
    
    for(var i = 0; i < 10; i++) {
      final_groceries_list.push(groceries_data_to_send[i]);
    }
    console.log(final_groceries_list);

    await browser.close();
    res.render("view/groceries_result.ejs");
    res.end();
  })()
})

app.get("/findGroceries", (req, res) => {
	res.send(final_groceries_list);
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
     
		// scraping flipkart
			
  const flipkart_page = await browser.newPage();
    var flipkart_product_name = req.body.product_name_html;
    flipkart_product_name = flipkart_product_name.replaceAll(" ", "+");
    // let flipkart_product_url = `https://www.flipkart.com/search?q=${flipkart_product_name}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=off&as=off&sort=price_asc`;
    let flipkart_product_url = `https://www.flipkart.com/search?q=${req.body.product_name_html}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=off&as=off&sort=price_asc`
await flipkart_page.goto(flipkart_product_url);
  let flipkart_price = [];
  let flipkart_links = [];
  let flipkart_data = [];

  const vertical_prices = await flipkart_page.evaluate(() => {
		const price_tag = document.querySelectorAll("div._30jeq3._1_WHN1");
			let single_price_tag = [];
			price_tag.forEach((i) => {
				single_price_tag.push(i.innerText);
			})
			return price_tag;
		})

	const cluttered_prices = await flipkart_page.evaluate(() => {
		const price_tag = document.querySelectorAll("div._30jeq3");
      let cluttered_price_tag = [];
      price_tag.forEach((i) => {
        cluttered_price_tag.push(i.innerText);
      })
      return cluttered_price_tag;
    })

		const vertical_prices_all = await flipkart_page.evaluate(() => {
			const tag = document.querySelectorAll("a._1fQZEK");
      let data = [];
      tag.forEach((i) => {
        data.push(`https://www.flipkart.com${i.getAttribute("href")}`);
			})
			return data;
		})

		const cluttered_prices_all = await flipkart_page.evaluate(() =>{
			const tag = document.querySelectorAll("a._3bPFwb");
      let data = [];
      tag.forEach((i) => {
        data.push(`https://www.flipkart.com${i.getAttribute("href")}`);
      })
      return data;
    })

		const cluttered_prices_all_rem = await flipkart_page.evaluate(() => {
		//	const tag = document.querySelectorAll("a._3bPFwb");
		const tag = document.querySelectorAll("a.s1Q9rs");
      let data = [];
      tag.forEach((i) => {
        data.push(`https://www.flipkart.com${i.getAttribute("href")}`);
      })
      return data;
    })

		const product_name = await flipkart_page.evaluate(() => {
			const name_tag = document.querySelectorAll("div._4rR01T");
			let names = [];
			name_tag.forEach((i) => {
				names.push(i.innerText);
			})
			return names;
		})


		const product_ratings = await flipkart_page.evaluate(() => {
			const ratings = document.querySelectorAll("div._3LWZlK");
			let data = [];
			ratings.forEach((i) => {
				data.push(`${i.innerText} out of 5 stars`);
			})
			return data;
		})

		/*for(var i = 0; i < product_ratings.length; i++) {
			if(product_ratings[i] === undefined) {
				product_ratings[i] = "unavailable";
			}
		}	*/

	
		if(cluttered_prices.length != 0) {
      flipkart_price = flipkart_price.concat(cluttered_prices);
    }
    else {
      if(vertical_prices.length != 0) {
        flipkart_price = flipkart_price.concat(vertical_prices);
      }
    }

    if(cluttered_prices_all.length != 0) {
      flipkart_links = flipkart_links.concat(cluttered_prices_all);
    }

    else if(vertical_prices_all.length != 0) {
      flipkart_links = flipkart_links.concat(vertical_prices_all);
    }

    else if(cluttered_prices_all.length == 0 && vertical_prices_all.length == 0) {
      flipkart_links = flipkart_links.concat(cluttered_prices_all_rem);
    }
	else {
		flipkart_links = flipkart_links.contact(last_cluttered_links);
	}

    // for(var i = 0; i < product_name.length; i++) {
    //   if(product_name[i] === null) {
    //     product_name[i] = `${req.body.product_name_html}`;
    //   }
    // }
   
	for(let i = 0; i < flipkart_price.length; i++) {
		flipkart_price[i] = flipkart_price[i].replaceAll(",", "");
		flipkart_price[i] = flipkart_price[i].replaceAll("\u20B9", "");
	}

	flipkart_price = flipkart_price.map(Number); 
    for(let i = 0; i < 5; i++) {
			flipkart_data.push({"price":flipkart_price[i], "url":flipkart_links[i], "ratings":product_ratings[i], "names":product_name[i], "name_of_product":`${req.body.product_name_html}`, "company":"flipkart"});
	}

	/*const flipkart_page = await browser.newPage();
    var flipkart_product_name = req.body.product_name_html;*/

		// shopping jio mart scraping
		
	
	

       var pseudo_data = [];
		/*	for(let i = 0; i < 5; i++) {
        flipkart_data.push({"price":flipkart_price[i], "url":flipkart_links[i], "ratings":product_ratings[i], "names":product_name[i], "name_of_product":`${req.body.product_name_html}`});
      }*/
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

		function swap(arr, xp, yp) {
			var temp = arr[xp];
			arr[xp] = arr[yp];
			arr[yp] = temp;
		}

// flipkart_data.push({"price":flipkart_price[i], "url":flipkart_links[i], "ratings":"unavailable", "names":product_name[i], "name_of_product":`${req.body.product_name_html}`});
        data_to_send = [] // clearing the array after one api call
		shopping_final_data_to_send = [] // clearing the array after one api call
 
		for(var i = 0; i < flipkart_data.length; i++) {
			if(flipkart_data[i].names === undefined) {
				flipkart_data[i].names = (flipkart_data[i].name_of_product);
			}
		}	
   
        for(var i = 0; i < 5; i++) {
          shopping_final_data_to_send.push({"price":data[i] , "url":hrefs[i] , "ratings":getRatings[i] , "names":getNames[final[i]] , "name_of_product":product_name_to_buy, "company":"amazon"});
        }

        for(var j = 0; j < 5; j++) {
          shopping_final_data_to_send.push({"price":flipkart_data[j].price, "url":flipkart_data[j].url, "ratings":flipkart_data[j].ratings, "names":flipkart_data[j].names, "names_of_product":flipkart_data[j].name_of_product, "company":"flipkart"});
        }
		
		for(var k = 0; k < shopping_final_data_to_send.length; k++) {
			console.log(typeof(shopping_final_data_to_send[k].price));
		}
		for(let i = 0; i < shopping_final_data_to_send.length - 1; i++) {
			for(let j = 0; j < shopping_final_data_to_send.length - i - 1; j++) {
			if(shopping_final_data_to_send[j].price > shopping_final_data_to_send[j + 1].price) {
				swap(shopping_final_data_to_send, j, j + 1);
			}
		  }
		}

      } catch (error) {
		console.log(error.stack);
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
    var makemytrip_departure_day = `${day}/${month}/${year}`;
    // const url = `https://google.com`;
    const url = `https://www.makemytrip.com/flight/search?tripType=O&itinerary=${store_start_location_iata}-${store_end_location_iata}-${makemytrip_departure_day}&paxType=A-1_C-0_I-0&cabinClass=E&sTime=1672337344084&forwardFlowRequired=true&mpo=&semType=&intl=false`
    spicejet_url = url;
    console.log(url);

    // blackText fontSize18 blackFont white-space-no-wrap
    const spicejet_price_page = await browser.newPage();
    var unix_time = (Math.floor(new Date(`${year}.${month}.${day}`).getTime() / 1000));
    // await spicejet_price_page.goto("https://www.makemytrip.com/flight/search?tripType=O&itinerary=PNQ-BLR-08/01/2023&paxType=A-1_C-0_I-0&cabinClass=E&sTime=1672337344084&forwardFlowRequired=true&mpo=&semType=&intl=false");
    await spicejet_price_page.goto(`https://www.google.com/search?q=cheapest+flight+from+${store_start_location_iata}+to+${store_end_location_iata}+on+${departure_day}&oq=cheapest+flight+from+${store_start_location_iata}+to+${store_end_location_iata}&aqs=chrome..69i57.11745j0j4&sourceid=chrome&ie=UTF-8`);

    const flight = await spicejet_price_page.evaluate(() => {
      const tag = document.querySelectorAll('span.GARawf');
      var data = [];
      tag.forEach((i) => {
          data.push(i.innerText);
      })
      return data;
  })

    const flight_link = await spicejet_price_page.evaluate(() => {
      const tag = document.querySelectorAll("div.YXEKBb.LQQ1Bd > div > div > a");
      var data = [];
      tag.forEach((i) => {
        data.push(i.getAttribute("href"));
      })
      return data;
    })
  
    const flight_name = await spicejet_price_page.evaluate(() => {
      const tag = document.querySelectorAll("span.ps0VMc");
      var data = [];
      tag.forEach((i) => {
        data.push(i.innerText);
      })
	  return data;
    })

    console.log(flight);
    console.log(flight_link)
    
    flight_data_to_send = []; // clearing the array after one api call
    for(var i = 0; i < flight.length; i++) {
      flight_data_to_send.push({"price":flight[i] ,"airline":flight_name[i], "link":flight_link[i]});
    }


    await browser.close();
    res.render("view/flights_result.ejs");
    res.end();
  })();
})


app.get('/getFlightData' , (req , res) => {
  res.send(flight_data_to_send);
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
  res.send(shopping_final_data_to_send);
})


app.listen(8080);

// this is the best code, I mean it.
