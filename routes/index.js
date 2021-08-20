var express = require('express');
var router = express.Router();


var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price:679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869},
]


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.dataCardBike === undefined){
    req.session.dataCardBike = [];
  }
  res.render('index', { dataBike: dataBike });
});

/* GET shop ADD. */
router.get('/shop', function(req, res, next) {

  if(req.session.dataCardBike){
    var alreadyExist = false;
    console.log("if 1");
    for(var i = 0; i< req.session.dataCardBike.length; i++){
      if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
        req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
        alreadyExist = true;
      } 
    }
    if(alreadyExist == false){
      console.log("SOUS IF 2");
      req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
     })
   }
  } else {
    console.log("ELSE");
    req.session.dataCardBike = [];
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
     })
  }

  res.render('shop', {dataCardBike: req.session.dataCardBike});
});

/* GET shop VOIR LE PANIER. */
router.get('/panier', function(req, res, next) {
  res.render('shop', {dataCardBike: req.session.dataCardBike});
});

/* GET shop DELETE. */
router.get('/deleteShop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.deleteShop, 1);
  res.render('shop', {dataCardBike: req.session.dataCardBike});
});

// Update
router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

// stripe
const stripe = require('stripe')('sk_test_YPLgXcsFYID09Fy9ZNYnLZ7n00jPfiR5Ug');
router.post('/create-checkout-session', async (req, res) => {

  req.session.panierStripe = [];
  console.log('panier vide créé');
  
  for(let i = 0; i < req.session.dataCardBike.length; i++) {
    console.log('fonction Panier stripe');
    req.session.panierStripe.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name,
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    });
  }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.session.panierStripe,
      mode: "payment",
      success_url: "https://bike-ecommerce.herokuapp.com/confirm",
      cancel_url: "https://bike-ecommerce.herokuapp.com/cancel",
    });
    
    res.json({ id: session.id });
})

/* Confirmation. */
router.get('/confirm', function(req, res, next) {
  res.render('confirm', {dataCardBike: req.session.dataCardBike});
});
/* Cancel. */
router.get('/cancel', function(req, res, next) {
  res.render('cancel', {dataCardBike: req.session.dataCardBike});
});

module.exports = router;