/*Importing the express framework cors module, path, fs */
const express = require('express');
const cors = require("cors"); 
const path= require('path');
const fs =require("fs")

const app = express();  //initializing express 
app.use(cors()); // relaxing api security to allow all orgin access

app.use(express.json()); //using express json parsor

app.set("path",3000); //setting path port
/* Logger middleware, logs requests to server */
app.use(function(req,res,next){
    date =new Date()
    console.log('[Date: '+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" Time: "+date.getHours()+":"+date.getMinutes()+'] request '+req.method+" url:"+req.url);
    next();
});

/* Static middleware that returns the mentioned image,if it exists in the path else error*/
app.get("/image/:id",function(req,res,next){
    let para = req.params.id;
    var filePath = path.join(__dirname,"static/image/",para);
    fs.stat(filePath,function(err,fileInfo){
        if (err )
            res.status(404).send({ message: "File Not Found!" });
        else 
            res.sendFile(path.join(__dirname, "static\\image\\"+para));
    });
});
/* Setting all responses to be given to all origins*/
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
})

// Importing Mongo db
const MongoClient = require('mongodb').MongoClient;

/* connecting to online mongodb */
let db;
MongoClient.connect('mongodb+srv://joe:washere@cluster0.bknu4aj.mongodb.net',(err, client)=>{
    db = client.db('webstore')
})

/* Info page */
app.get('/',(req,res,next)=>{
    res.send('Select a Collection, e.g: /collection/messages')
})
/* Defining collectionName as param*/
app.param('collectionName', (req, res, next, collectionName) => {  
    req.collection = db.collection(collectionName)
    return next()
})
/* Getting collection from mongodb */
app.get('/collection/:collectionName', (req, res, next) => {  
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)      
        res.send(results)    
        }  
    )
})
/* postting/inserting collection to mongodb */
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insertOne(req.body,(e,results)=>{
        if(e)return next(e)
        res.send(results.ops)
    })
})
const ObjectID = require('mongodb').ObjectId // intializing object generator from mongodb
/* Get funtion to implement type search */
app.get('/collection/:collectionName/:id', (req, res, next) => { 
    let par = req.params.id
    req.collection.find({$or:[{title: new RegExp('^'+par,'i')},{location: new RegExp('^'+par,'i')}]}).toArray((e, results) => {
        if (e) return next(e)      
        res.send(results)    
        }  
    )
})
/* Putting/Updating collection elements */
app.put('/collection/:collectionName/:id', (req, res, next) => {  
    req.collection.updateOne(
    {_id: new ObjectID(req.params.id)}, 
    {$set: {
        quantity:req.body.quantity,
    }},
    {safe: true, multi: true},
    (e, results) => {
        if (e) return next(e)      
        res.send(results ?{msg: 'success'}: {msg: 'error'})    
        }  
    )
})
/* For postman example deleting collection element */
app.delete('/collection/:collectionName/:id', (req, res, next) => {  
    req.collection.deleteOne(
    {_id: ObjectID(req.params.id)}, 
    (e, results) => {
        if (e) return next(e)      
        res.send(results ?{msg: 'success'}: {msg: 'error'})    
        }  
    )
})
// Starting server on environment variable or 3000 if it doesn't exist 
const port =process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}....`));