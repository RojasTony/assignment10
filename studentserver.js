const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require('mongoose'); //Mongoose npm requirement
require('dotenv').config();

const mString = process.env.databaseUsernames; //creates constant string, that calls URI from the .env file
app.use(bodyParser.json());// needed for body parser
app.use(bodyParser.urlencoded({ extended: false }))// needed for body parser
app.use(express.static('./public'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://rojastony256:123@cluster01.gyywo7b.mongodb.net/?retryWrites=true&w=majority"); //needed to connect to the mDB
const DB = mongoose.connection; // c

//Schema for mongoose, This sets the input that is required for the different fields of data for the students  
const schemaForStudents = new mongoose.Schema({
  _id:
  {
    required: true,
    type: Number,
  },
  FirstName:
  {
    required: true,
    type: String,
  },
  LastName:
  {
    required: true,
    type: String,
  },
  Enrolled:
  {
    required: true,
    type: String,
  },
  GPA:
  {
    require: true,
    type: String,
  }
})
const mongoStorage = mongoose.model('Data', schemaForStudents)

//lines 46 - 70 are to display the urls in the browser when the server is running 
app.get('/addStudent', function (req, res) {
  res.render('addStudent');
})

app.get('/displayStudent', function (req, res) {
  res.render('displayStudent');
})

app.get('/updateStudent', function (req, res) {
  res.render('updateStudent');
})

app.get('/deleteStudent', function (req, res) {
  res.render('deleteStudent');
})

app.get('/listStudents', function (req, res) {
  res.render('listStudents');
})

app.get('/', function (req, res) {
  res.render('index');
})

// This is the post function. This will prompt the user to input information for the required fields for the students, 
// when the user hits the submit button the information will be saved into the MongoDB database.
app.post('/students', async function (req, res) {
  const studentData = new mongoStorage({ //match what is on the left with the ones in the schema 
    _id: req.body.id,
    FirstName: req.body.first_name,
    LastName: req.body.last_name,
    GPA: req.body.gpa,
    Enrolled: req.body.enrolled,
  })
 
  //the function below in line 82-89 checks to see if there is a student profile with the same first and last name within the database,
  //if one is found the message duplicate student will display and the user would have input a different student name. 
  const studentExists = await mongoStorage.findOne({ FirstName: req.body.first_name, LastName: req.body.last_name, }) 
  console.log(studentExists)
  if (studentExists) {
    return res.status(200).send("Duplicate Student!")
  }
  const dataSave = await studentData.save(); //saves the data in DB
  res.status(200).send("Success");

});

//This is the delete function. For this function the user would have to input the student's ID after the url by using
// /<student's ID> . Afterwards the student's profile that matches the ID will be erased from the Mongo Database.
app.delete('/students/:id', async function (req, res) {

  const dataSave = await mongoStorage.deleteOne({ _id: req.params.id })
  res.status(200).send(dataSave);
})

//This is the function for getting a single student's information. 
//Similar to the delete function above , the user would have to type the specific student's ID that they wish to view,
//once inputed , the student's profile information will be displayed.
//Furthermore, for some of the functions stated below we use "await" because we are dealing with asynchronous functions
//so the server is having to wait for some information.
app.get('/students/:id', async function (req, res) {
  {
    console.log(req.params.id)
    const dataSave = await mongoStorage.findOne({ _id: req.params.id });
    console.log(dataSave)
    res.status(200).send(dataSave)
  }
})
// This is the update function.
// For this function , similar to the add student or post function. The user will simply input the required information for the student
// that they wish to modify, also they would have to input the specific student's ID that they wish to modify.
app.put('/students/:id', async function (req, res) {
  console.log(req.params.id)
  const dataSave = await mongoStorage.updateOne({ _id: req.params.id }, { FirstName: req.body.first_name, LastName: req.body.last_name, GPA: req.body.gpa, Enrolled: req.body.enrolled });
  res.status(200).send(dataSave);
  console.log(dataSave)
})

//This is the get all students function , as well as the search get.
//For this function the user can simply select the display all students tab in the navbar and the function will display all the 
//current student's information within the mongo database.
//Furthermore, the user can utilize the search functionality by searching for the first letters of the student's first and last name
//within the url of the page.
app.get('/students', async function (req, res) {
  let { FrstName, LstName } = req.query; //here we are declaring the names of the queries 
  console.log(FrstName)

  //loop: if FrstName and LstName is entered into the url , it will try to find a student within the query whose
  // first and last name matches the letter or letters that the user inputed in the url.
  if (FrstName && LstName) {
    var firstNameRegex = new RegExp("^" + FrstName);
    var lastNameRegex = new RegExp("^" + LstName);
    let students = await mongoStorage.find({ FirstName: firstNameRegex, LastName: lastNameRegex });
  // nested if: if there are students in the query that match the user's inputed information, then output them to the screen
  // otherwise display "not found" if there are none.
    if (students.length > 0) {
      res.status(200).send(students);
    }
    else {
      res.status(404).send("Not Found");
    }
  }
  else {
    const dataSave = await mongoStorage.find();
    res.status(200).send(dataSave);
  }

})

app.listen(5678); //starts the server
console.log('Server is running...');

