const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require("./server/db");
const { log } = require("console");

const app =  express();

const session = require('express-session');

app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'project123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


const PORT = 1608;
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, "style")));

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.get('/about', (req,res) =>{
    res.sendFile(path.join(__dirname, 'public', 'about.html'))
});

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
});

app.get('/contact', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'))
});

app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.send("אנא מלא את כל השדות");
  }

  db.run(
    `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
    [name, email, subject, message],
    function (err) {
      if (err) {
        console.error("שגיאה בשמירת הפנייה:", err);
        return res.send("שגיאה בשמירת הפנייה");
      }

      console.log("פנייה נשמרה בהצלחה");
      res.send("תודה שפנית אלינו!");
    }
  );
});


app.get('/TaskMaster', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'TaskMaster.html'))
});

app.post('/TaskMaster', (req, res) => {
    console.log(req.body);
});

app.get('/signup', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'))
});

app.post("/signup", (req, res) => {
  const { username, password, password2 } = req.body;
  console.log(req.body);
  if (password !== password2) {
    return res.send("סיסמה לא תקינה");
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      return res.send("שגיאה בבדיקה");
    }

    if (row) {
      return res.send("שם המשתמש כבר קיים");
    }

    db.run(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      [username, password],
      function (err) {
        if (err) {
          return res.send("שגיאה בהכנסת המשתמש");
        }
        return res.redirect("/TaskMaster")
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      return res.send("שגיאה בשרת");
    }

    if (!row) {
      return res.send("שם משתמש או סיסמה שגויים");
    }

    
    req.session.user = { id: row.id, username: row.username };

    return res.redirect("/TaskMaster");
  });
});


app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
});