const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app =  express();
const PORT = 1608;
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, "style")));

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
});

app.post('/login', (req, res) => {
    console.log(req.body);
});

app.get('/contact', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'))
});

app.post('/contact', (req, res) => {
    console.log(req.body);
});

app.get('/signup', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'))
});

app.post('/signup', (req, res) => {
    console.log(req.body);
});

app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
});