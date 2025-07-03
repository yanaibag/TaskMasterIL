const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require("./server/db");
const { log } = require("console");

const app =  express();

const session = require('express-session');

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

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

app.post('/tasks/add', (req, res) => {
  if (!req.session.user) return res.status(401).send("לא מחובר");

  const { text, priority } = req.body;
  const userId = req.session.user.id;

  db.run(
    `INSERT INTO tasks (user_id, text, priority) VALUES (?, ?, ?)`,
    [userId, text, priority],
    function (err) {
      if (err) {
        console.error("שגיאה בהוספת משימה:", err);
        return res.status(500).send("שגיאה");
      }
      res.sendStatus(200);
    }
  );
});

app.get('/tasks', (req, res) => {
  if (!req.session.user) return res.status(401).send("לא מחובר");

  const userId = req.session.user.id;

  db.all(`SELECT * FROM tasks WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) {
      console.error("שגיאה בשליפת משימות:", err);
      return res.status(500).send("שגיאה");
    }
    res.json(rows);
  });
});

app.post('/tasks/update/:id', (req, res) => {
  if (!req.session.user) return res.status(401).send("לא מחובר");

  const { done, priority } = req.body;
  const userId = req.session.user.id;
  const taskId = req.params.id;

  db.run(
    `UPDATE tasks 
     SET done = COALESCE(?, done), 
         priority = COALESCE(?, priority) 
     WHERE id = ? AND user_id = ?`,
    [done !== undefined ? (done ? 1 : 0) : null, priority, taskId, userId],
    function (err) {
      if (err) {
        console.error("שגיאה בעדכון משימה:", err);
        return res.status(500).send("שגיאה");
      }
      res.sendStatus(200);
    }
  );
});

app.post('/tasks/delete/:id', (req, res) => {
  if (!req.session.user) return res.status(401).send("לא מחובר");

  const taskId = req.params.id;
  const userId = req.session.user.id;

  db.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [taskId, userId], function(err) {
    if (err) {
      console.error("שגיאה במחיקת משימה:", err);
      return res.status(500).send("שגיאה");
    }
    res.sendStatus(200);
  });
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
        return res.redirect("/login")
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

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
});