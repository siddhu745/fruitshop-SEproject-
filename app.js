require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require('mongoose-findorcreate')

const app = express()
var l = false;
var un = "Your"
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('view engine','ejs')
app.use(session({
    secret : "Our Little Secret",
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser : true})
const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId : String
    // secret : String
})

const productSchema = new mongoose.Schema({
    imagesrc : String,
    fruitname : String,
    quantity : String,
    price : String
})

const orderSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    address : String,
    address2 : String,
    city : String,
    state : String,
    zip : String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User",userSchema)
const Product = new mongoose.model("Product",productSchema)
const Order = new mongoose.model("Order",orderSchema)

passport.use(User.createStrategy())

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:745/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user)
    })
  }
))
// -------------------------------------------------------------------

app.get('/',function(req,res){
    res.render('index',{title:"home"})
})
app.post('/',function(req,res){
    
})
app.get('/store',function(req,res){
    res.render('store',{title:"store"})
})

app.get('/contactus',function(req,res){
    res.render("store ",{title:"contactus"})
})

app.get('/cart',function(req,res){
    if(l === false){
        res.render('home',{title:"signin"})
    }
    else{
        Product.find({},function(err,foundItems){
            res.render('cart',{title : "cart",
                                cartItems : foundItems,
                                })
    
        })

    }
})

app.get('/buy',function(req,res){
    res.render('buy',{title: "buy"})
})

app.post('/order',function(req,res){
    if(req.body.fname == '' || req.body.lname == '' || req.body.inputAddress == '' ||
    req.body.inputAddress2 == '' ||req.body.inputCity == '' ||
     req.body.inputZip == '' || req.body.inputState == 'Choose...' ){
        
        res.redirect('/buy')
    }
    else{
        const order = new Order({
            firstname : req.body.fname,
            lastname : req.body.lname,
            address : req.body.inputAddress,
            address2 : req.body.inputAddress2,
            city : req.body.inputCity,
            state : req.body.inputState,
            zip : req.body.inputZip
        })
        // console.log(order);
        order.save()
    
        res.render('show',{title:"message"})

    }
})

app.get('/signin',function(req,res){
    if(l === false){
        res.render('home',{title:"signin"})
    }
    else{
            res.render('logout',{title : "account",
                                username : un})
    
        
    }
    
})
app.get('/store/seasonalfruits',function(req,res){
    res.render('seasonalfruits',{title : "seasonalfruits"})
})
app.get('/store/exoticfruits',function(req,res){
    res.render('exoticfruits',{title:'exoticfruits'})
})
app.get('/store/sun-dry-fruit-and-berry',function(req,res){
    res.render('sunDryFruitAndBerry',{title :"sunDryfruitsAndBerry"})
})

app.get('/store/frozenfood',function(req,res){
    res.render('frozenfood',{title :"frozenfood"})
})
app.get('/store/dryfruitsandnuts',function(req,res){
    res.render('DryFruitsAndNuts',{title :"DryFruitsAndNuts"})
})




app.post('/cart',function(req,res){
    const productdata = req.body;
    // console.log(productdata)
    const ob = new Product({
        imagesrc : productdata.imageSrc,
        fruitname : productdata.fruitName,
        quantity : productdata.Quantity,
        price : productdata.Price
    })
    ob.save()
})

app.post('/delete',function(req,res){ 
    Product.findByIdAndRemove(req.body.productId,function(err){
        if(!err) console.log("successfully deleted")
        else console.log(err);
    })
    res.redirect('/cart')
    // console.log(req.body.productId);
    // res.redirect('/cart')
})
// ------------------------------auth---------------------------------------
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }
))

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    // res.redirect('/secrets')
    res.redirect('/store')
})

app.get('/register',function(req,res){
    res.render('register',{title :"register"})
})

app.get('/login',function(req,res){
    l = true
    res.render('login',{title :"login"})
})

app.get('/logout',function(req,res){
    l = false
    req.logout(function(err){
        if(err){
            console.log(err)
        }
        res.redirect('/')
    })
})

// app.get('/secrets',function(req,res){
//     User.find({'secrets' : {$ne : null}}, function(err,foundUsers){
//         if(err){
//             console.log(err)
//         }
//         else{
//             if(foundUsers){
//                 res.render("secrets",{usersWithSecrets : foundUsers})
//             }
//         }
//     })
// })

app.get('/submit',function(req,res){
    if(req.isAuthenticated()){
        res.render('submit',{title :"DryFruitsAndNuts"})
    }
    else{
        res.redirect('/login')
    }
})

app.post('/submit',function(req,res){
    const SubmittedSecret = req.body.secret
    // console.log(req.user.id)
    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err)
        }
        else{
            if(foundUser){
                foundUser.secret = SubmittedSecret
                foundUser.save(function(){
                    res.redirect('/store')
                })
            }
        }
    })

})



app.post('/register',function(req,res){
    l = true
    un = req.body.username
    User.register({username : req.body.username,},req.body.password,function(err,user){
        if(err){
            console.log(err)
            res.render('register',{title :"DryFruitsAndNuts"})
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('/store')
            })
        }
    })
})

app.post('/login',function(req,res){
    un = req.body.username
    const user = new User({
        username : req.body.username,
        password : req.body.password
    })

    req.login(user, function(err){
        if(err){
            console.log(err)
        }
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/store')
            })
        }
    })

})


app.listen(745,function(){
    console.log("Server is running on port 745")
})