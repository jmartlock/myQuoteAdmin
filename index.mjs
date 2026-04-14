import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "l3855uft9zao23e2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "rrjl9i386m3c18eb",
    password: "tlcu3u8e75bozoc1",
    database: "nxy81p0y1d3989uy",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('index');
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})

app.get('/author/new', (req, res) =>{
    res.render('newAuthor');
});

app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate || null;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let country = req.body.country;
  let portrait = req.body.portrait;
  let biography = req.body.biography;

  let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let params = [fName, lName, birthDate, deathDate, sex, profession, country, portrait, biography];
  const [rows] = await pool.query(sql, params);
  res.render("newAuthor", 
             {"message": "Author added!"});
});

app.get("/authors", async function(req, res){
 let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
 const [rows] = await pool.query(sql);
 res.render("authorList", {"authors":rows});
});

app.get("/author/edit", async function(req, res){
  let authorId = req.query.authorId;

  let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId = ${authorId}`;
  const [rows] = await pool.query(sql);
  res.render("editAuthor", {"authorInfo":rows});
});

app.post("/author/edit", async function(req, res){
  let authorId = req.body.authorId;
  let fName = req.body.fName;
  let lName = req.body.lName;
  let dob = req.body.dob;
  let deathDate = req.body.deathDate || null;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let country = req.body.country;
  let portrait = req.body.portrait;
  let biography = req.body.biography;

  let sql = `UPDATE q_authors
             SET firstName=?, lastName=?, dob=?, dod=?, sex=?, 
                 profession=?, country=?, portrait=?, biography=?
             WHERE authorId=?`;
  let params = [fName, lName, dob, deathDate, sex, profession, country, portrait, biography, authorId];
  const [rows] = await pool.query(sql, params);
  res.render("editAuthor", {"authorInfo": [req.body], "message": "Author updated!"});
});

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;

    let sql = `DELETE 
                FROM q_authors
                WHERE authorId = ?`;
    const [rows] = await pool.query(sql, [authorId]);

    res.redirect("/authors");
});

app.get("/quotes", async function(req, res){
  let sql = `SELECT q_quotes.*, 
             CONCAT(firstName, ' ', lastName) AS authorName
             FROM q_quotes
             JOIN q_authors ON q_quotes.authorId = q_authors.authorId
             ORDER BY lastName`;
  const [rows] = await pool.query(sql);
  res.render("quoteList", {"quotes": rows});
});

app.get("/quote/edit", async function(req, res){
  let quoteId = req.query.quoteId;

  let quoteSql = `SELECT * FROM q_quotes WHERE quoteId = ${quoteId}`;
  const [quoteRows] = await pool.query(quoteSql);

  let authorSql = `SELECT authorId, CONCAT(firstName, ' ', lastName) AS authorName 
                   FROM q_authors ORDER BY lastName`;
  const [authorRows] = await pool.query(authorSql);

  res.render("editQuote", {"quoteInfo": quoteRows, "authors": authorRows});
});

app.post("/quote/edit", async function(req, res){
  let quoteId = req.body.quoteId;
  let quote = req.body.quote;
  let authorId = req.body.authorId;
  let category = req.body.category;
  let likes = req.body.likes;

  let sql = `UPDATE q_quotes
             SET quote=?, authorId=?, category=?, likes=?
             WHERE quoteId=?`;
  let params = [quote, authorId, category, likes, quoteId];
  await pool.query(sql, params);

  const [quoteRows] = await pool.query(`SELECT * FROM q_quotes WHERE quoteId = ${quoteId}`);
  const [authorRows] = await pool.query(`SELECT authorId, CONCAT(firstName, ' ', lastName) AS authorName FROM q_authors ORDER BY lastName`);

  res.render("editQuote", {"quoteInfo": quoteRows, "authors": authorRows, "message": "Quote updated!"});
});

app.get("/quote/delete", async function(req, res){
  let quoteId = req.query.quoteId;

  let sql = `DELETE FROM q_quotes WHERE quoteId = ?`;
  await pool.query(sql, [quoteId]);

  res.redirect("/quotes");
});