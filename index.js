const e = require('express');
const express = require('express');
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');
app.use(express.urlencoded());
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'));
app.use(express.static('public'));


app.get('/' , (req , res) => {
  // res.render("view/home.ejs");
  res.render("view/login.ejs");
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
    await page.screenshot({path : "ss.png"});
  })

  res.render("view/food.ejs");
  res.end();
})


app.post("/shopping" , (req , res) => {
  res.render("view/shopping.ejs");

})

app.post("/shopitem" , (req , res) => {
    var product_name = req.body.product_name_html;
    product_name = product_name.replaceAll(" " , "+");
    var url = `https://www.amazon.in/s?k=${product_name}`;
      (async () => {
      const browser = await puppeteer.launch({headless : true});
      const page = await browser.newPage();
      await page.goto(url);

      const hrefs = await page.evaluate(() => {
        const href_tag = document.querySelectorAll("a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal");
        var href_array = [];

        href_tag.forEach((i) => {
          href_array.push("https://www.amazon.in/"+i.getAttribute("href"));
        })
        return href_array;
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

      data = data.sort((a , b) => {return a - b});
      if(data[0] > data[data.length - 1]) {
        data.reverse();
      }

      // try {
        console.log(`${product_name} pricelist:\n`)
        console.log(data);
        console.log("\nminimum first \n")
        for(var i = 0; i < 5; i++) {
          console.log(data[i]);
        }
      try {
        console.log(hrefs);
        console.log(`${product_name} pricelist:\n`)
        console.log(data);
        console.log("\nminimum first \n")
        for(var i = 0; i < 5; i++) {
          console.log(data[i]);
        }
      } catch (error) {
        console.log("err");
      }


//      const min = Math.min(...data);
//  	  console.log(min);

      await browser.close();
      res.render("view/shopping.ejs");
      res.end();
    })();
})  

app.post("/contact" , (req , res) => {
  res.render("view/contact.ejs");
})

app.post("/trips" , (req , res) => {
	res.render("view/trips.ejs");
})
app.get("/login" , (req , res) => {
  var email = req.body.email;
  var password = req.body.passwd;

  if((email != "midhun@a.com") && (password != "1233")) {
    res.render("view/food.ejs");
  }
  else {
    res.send("go away!")
  }
})

app.get("/signup" , (req , res) => {
  res.send("under development...");
})
app.listen(8080);

