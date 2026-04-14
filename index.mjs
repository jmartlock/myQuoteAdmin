import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

const pool = mysql.createPool({
    host: "l3855uft9zao23e2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "rrjl9i386m3c18eb",
    password: "tlcu3u8e75bozoc1",
    database: "nxy81p0y1d3989uy",
    connectionLimit: 10,
    waitForConnections: true
});

app.get('/', async (req, res) => {
    let sqlAuthors = `SELECT authorId, firstName, lastName
        FROM q_authors
        ORDER BY lastName`;
    const [authors] = await pool.query(sqlAuthors);

    let sqlCategories = `SELECT DISTINCT category
        FROM q_quotes
        ORDER BY category`;
    const [categories] = await pool.query(sqlCategories);

    res.render("index", { "authors": authors, "categories": categories });
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT * FROM q_authors");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

app.get('/searchByKeyword', async (req, res) => {
    let keyword = req.query.keyword;
    let sql = `SELECT authorId, firstName, lastName, quote, likes
        FROM q_quotes
        NATURAL JOIN q_authors
        WHERE quote LIKE ?`;
    let sqlParams = [`%${keyword}%`];
    const [rows] = await pool.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});

app.get('/searchByAuthor', async (req, res) => {
    let userAuthorId = req.query.authorId;
    let sql = `SELECT authorId, firstName, lastName, quote, likes
        FROM q_quotes
        NATURAL JOIN q_authors
        WHERE authorId = ?`;
    let sqlParams = [userAuthorId];
    const [rows] = await pool.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});

app.get('/searchByCategory', async (req, res) => {
    let category = req.query.category;
    let sql = `SELECT authorId, firstName, lastName, quote, likes
        FROM q_quotes
        NATURAL JOIN q_authors
        WHERE category = ?`;
    let sqlParams = [category];
    const [rows] = await pool.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});

app.get('/searchByLikes', async (req, res) => {
    let minLikes = req.query.minLikes;
    let maxLikes = req.query.maxLikes;
    let sql = `SELECT authorId, firstName, lastName, quote, likes
        FROM q_quotes
        NATURAL JOIN q_authors
        WHERE likes >= ? AND likes <= ?
        ORDER BY likes DESC`;
    let sqlParams = [minLikes, maxLikes];
    const [rows] = await pool.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});

app.get('/api/author/:id', async (req, res) => {
  let authorId = req.params.id;
  let sql = `SELECT *
            FROM q_authors
            WHERE authorId = ?`;           
  let [rows] = await pool.query(sql, [authorId]);
  res.send(rows);
});

app.listen(3000, ()=>{
    console.log("Express server running")
});
