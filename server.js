
const express = require('express');
const app = express();
const image_1 = 'https://tse4.mm.bing.net/th?id=OIP.0CBh1Zsfm1sdsgtfpnSfSAHaHa&pid=Api&P=0&h=180';
const { Storage } = require('@google-cloud/storage');

app.set('view engine', 'ejs');

//middleware to serve the static files
app.use(express.static('public'));
app.use(express.json())

// Add necessary middleware
app.use(express.urlencoded({ extended: true }))





//Declare firebase admin and storage
const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({       //initialize admin
    credential: admin.credential.cert(credentials),
    storageBucket: "employee-management-app-3e6ea.appspot.com",
});
const db = admin.firestore();

const multer = require('multer');   //create the multer middleware





// Create the Multer upload instance
// const upload = multer({ storage: storage });
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
});

// const storageMulter = multer.memoryStorage();
// const upload = multer({ storage: storageMulter });


// Configure Multer storage
const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, ''); // Destination for uploaded files
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.originalname);
    }
});





//Routes
app.get('/', (req, res) => {
    console.log("Home");
    res.render("index", { title: "home" })  //basic home page route that serves the index.html file
});

app.get('/add', (req, res) => {
    console.log("Add new employee");
    res.render("add", { title: "add new employee" })     //add new employee page route
});

app.get('/upload', (req, res) => {      // Render the upload form
    res.render('upload');
});





//Create/add data (end point)
app.post('/add', upload.single("image"), async (req, res) => {

    console.log(req.file);

    try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(req.file.originalname);
        const result = await file.createWriteStream().end(req.file.buffer);
        const downloadUrl = await file.getSignedUrl({
            action: 'read',
            expires: '03-17-2025'
        });
        const imgJson = {
            imageUrl: downloadUrl[0]
        }

        const employeeData = {
            name: req.body.name,
            surname: req.body.surname,
            empId: req.body.empId,
            address: req.body.address,
            position: req.body.position,
            email: req.body.email,
            phone: req.body.phone,
            image: downloadUrl[0]
        }

        const employeeRef = db.collection('employees');
        const response = await employeeRef.add(employeeData).then(() => {
            res.render('add')
        })
        // res.send(response);
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

            const { name, surname, empId, address, position, email, phone, image } = doc.data();   // Retrieve employee data from document

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
                image
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
app.delete('/delete/:id', async (req, res) => {

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
        phone: req.body.phone,
        image: req.body.image
    }

    db.collection('employees').doc(id).update(updateData).then(() => {
        // console.log('Data updated');
        // res.send('Data updated');
        alert('Successfully updated.')
    }).catch((error) => {
        console.log(error);
        res.send(error);
    })
})



// Handle bad URL requests
app.use((req, res) => {
    res.status(404).send('Page not found');
});





// Start the server
const port = 3000;
app.listen(port, 'localhost', () => {
    console.log(`Server is running & listening request on port ${port}`);
});

