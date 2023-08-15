
const express = require('express');
const app = express();
const morgan = require('morgan')

app.set('view engine', 'ejs');

//Middleware
app.use(morgan('dev'));     
//middleware to serve the static files
app.use(express.static('public'));



//Declare firebase admin
const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({       //initialize admin
  credential: admin.credential.cert(credentials)
});
const db = admin.firestore()
app.use(express.json())
app.use(express.urlencoded({extended:true}))



//Create a post (end point)
app.post('/create', async(req,res)=>{
    
})



//Routes
app.get('/', (req, res) => {
   console.log("Home");
   res.render("index", {title:"home"})  //basic home page route that serves the index.html file
});

app.post('/add', async(req, res) => {
    console.log("Add");
    // res.render("add", {title:"add new employee"})   //add new employee page route
    try {

        const employeeJson = {
            name: req.body.name,
            surname: req.body.surname,
            empId: req.body.empId,
            address: req.body.address,
            position: req.body.position,
            email: req.body.email,
            phone: req.body.phone
        }

        const response = await db.collection('employees').add(employeeJson);
        res.send(response)
    } catch (error) {
        res.send(error)
    }
});

app.get('/viewall', (req, res) => {
    console.log("View all");
    res.render("viewall", {title:"view all employees"})     //View all employees page route
 });

// Handle bad URL requests
app.use((req, res) => {
    res.status(404).send('Page not found');
});





// Start the server
const port = 3000;
app.listen(port, 'localhost', () => {
    console.log(`Server is running & listening request on port ${port}`);
});

