import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";

const upload = multer();
const app = express();
const port = 3000;
const firebaseConfig = {
    apiKey: "AIzaSyC-wwIJnjvWqj6Bq65CPk8_eHulgOZA0nc",
    authDomain: "todo-273311.firebaseapp.com",
    databaseURL: "https://todo-273311.firebaseio.com",
    projectId: "todo-273311",
    storageBucket: "todo-273311.appspot.com",
    messagingSenderId: "940947738403",
    appId: "1:940947738403:web:c7fe92584393ce8cb1c696",
    measurementId: "G-3PNY40FNXF"
};
firebase.initializeApp(firebaseConfig);

app.use(upload.array()); 

app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.get('/', (req, res, next) => {
    res.send("Server is up and running!");    
});

app.post('/register', function(req, res, next) {
    console.log(req.body)
    const username = req.body.email;
    const password = req.body.password;
    const emailRule = new RegExp(/[^@]+@[^\.]+\..+/g);
    if (username && password) {
        if (emailRule.test(username)) {            
            firebase.auth().createUserWithEmailAndPassword(username, password)
            .then(userData => {  
                const user = {
                    uid: userData.user.uid,
                    username: username
                }    
                console.log("Successfully created");
                res.json(user);
            })
            .catch(error => {  
                res.json(error.message);
            });
        } else {
            res.json("Username is invalid!");
        }            
    } else {
        res.json("Username or password empty");
    }    
});

app.post('/login', function(req, res, next) {
    const username = req.body.email;
    const password = req.body.password;
    if (username && password) {
        firebase.auth().signInWithEmailAndPassword(username, password)
        .then(userData => {   
            console.log("Successfully logged in");               
            res.json({ data: userData });
        })
        .catch(error => {  
            res.json(error.message);            
        });
    } else {
        res.json("Username or password empty!");
    }    
});

app.post('/todo', (req, res, next) => {    
    const todoItem = req.body.item; 
    const userId = req.body.userId; 
    if (todoItem) {        
        const item = { "item": todoItem, "userId": userId };
        firebase.database().ref('/ToDo').push(item)
        .then(itemCreated => {   
            res.send({ data: itemCreated });
        })
        .catch(error => {  
            res.send(error.message);            
        });
        next();
    } else {
        res.send("ToDo Item name is empty!");
    }
});

app.get('/todos', (req, res, next) => {
    const toDoItems = [];
    const leadsRef = firebase.database().ref('/ToDo');
    leadsRef.on('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            toDoItems.push({ key: childSnapshot.key, item: childSnapshot.val() });
        });
        res.json(toDoItems); 
    });
});

app.get('/todosArchived', (req, res, next) => {
    const toDoItems = [];
    const leadsRef = firebase.database().ref('/ArchivedToDo');
    leadsRef.on('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            toDoItems.push({ key: childSnapshot.key, item: childSnapshot.val() });
        });
        res.json(toDoItems); 
    });
});

app.post('/removetodo', (req, res, next) => {    
    const key = req.query.key;
    const todoItem = req.body.item; 
    const userId = req.body.userId; 
    firebase.database().ref('/ToDo').child(key).remove().then(itemCreated => {   
        console.log("Successfully deleted");    
        const item = { "item": todoItem, "userId": userId };
        firebase.database().ref('/ArchivedToDo').push(item)
        .then(itemCreated => {   
            console.log("Successfully created");               
            res.json({ data: itemCreated });
        })
        .catch(error => {  
            res.json(error.message);            
        });
    })
    .catch(error => {  
        res.json(error.message);            
    });    
});

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});