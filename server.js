
const express = require('express');
const app = express();
const morgan = require('morgan')
const path = require('path')
const image = 'https://tse4.mm.bing.net/th?id=OIP.0CBh1Zsfm1sdsgtfpnSfSAHaHa&pid=Api&P=0&h=180';


app.set('view engine', 'ejs');

//Middleware
app.use(morgan('dev'));

//middleware to serve the static files
app.use(express.static(path.join(__dirname, 'public')))


//Declare firebase admin
const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({       //initialize admin
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



//Create a post (end point)
app.post('/create', async (req, res) => {

})



//Routes
app.get('/', (req, res) => {
    console.log("Home");
    res.render("index", { title: "home" })  //basic home page route that serves the index.html file
});

app.get('/add', (req, res) => {
    console.log("Add new employee");
    res.render("add", { title: "add new employee" })     //add new employee page route
});




//Create/add data (end point)
app.post('/add', async (req, res) => {
    
    try {

        const employeeData = {
            name: req.body.name,
            surname: req.body.surname,
            empId: req.body.empId,
            address: req.body.address,
            position: req.body.position,
            email: req.body.email,
            phone: req.body.phone
        }

        const employeeRef = db.collection('employees');
        const response = await employeeRef.add(employeeData).then(()=>{
            res.redirect('add')
        })

        res.send(response)
        // Return the newly created employee's document ID
        // res.send(`Employee added with ID: ${employeeData.id}`);

    } catch (error) {

        // Handle error
        console.error(error);
        console.log(error);
        res.status(500).send('Failed to add employee');
    }
});


//read data (end point)
app.get('/viewall', async (req, res) => {

    try {
        // Retrieve all employee documents from Firestore
        const snapshot = await db.collection('employees').get();

        // Create an array to store employee data
        const responseArray = [];

        // Iterate over each employee document
        snapshot.forEach((doc) => {


            const { name, surname, empId, address, position, email, phone } = doc.data();   // Retrieve employee data from document


            responseArray.push({      // Add employee data to the array
                ...doc.data(),
                id: doc.id,
                name,
                surname,
                empId,
                address,
                position,
                email,
                phone,
                image: image
            });
        });

        // Return the array of employees
        res.render("viewall", { title: 'all employees', responseArray })

    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
})



//delete an employee (end point)
app.delete('/viewall/delete/:id', async (req, res) => {

    try {
        const response = await db.collection('employees').doc(req.params.id).delete();
        res.send(response);
        console.log('Employee deleted.');
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})



//Update employee data (end point)
app.put('/update/:id', (req, res) => {

    const id = req.params.id;

    const updateData = {
        name: req.body.name,
        surname: req.body.surname,
        empId: req.body.empId,
        address: req.body.address,
        position: req.body.position,
        email: req.body.email,
        phone: req.body.phone
    }

    db.collection('employees').doc(id).update(updateData).then(() => {
        console.log('Data updated');
        res.send('Data updated');
    }).catch((error) => {
        console.log(error);
        res.send(error);
    })
})



// app.get('/update', (req, res) => {
//     console.log("Update employee data");
//     res.render("update", { title: "update employee data" })     //update employee page route
// });



// Handle bad URL requests
app.use((req, res) => {
    res.status(404).send('Page not found');
});



// Start the server
const port = 3000;
app.listen(port, 'localhost', () => {
    console.log(`Server is running & listening request on port ${port}`);
});

