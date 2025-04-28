const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'chatbottests' 
  });
  app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/getAllItems', (req, res) => {
    db.query('SELECT * FROM Items', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  app.post('/addItem', (req, res) => {
    const { name, desc } = req.query;
    db.query('INSERT INTO Items (name, `desc`) VALUES (?, ?)', [name, desc], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item added!', id: results.insertId });
    });
  });
  app.post('/deleteItem', (req, res) => {
    const { id } = req.query;
    db.query('DELETE FROM Items WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item deleted!' });
    });
  });
  app.post('/updateItem', (req, res) => {
    const { id, name, desc } = req.query;
    if (!id || !name || !desc) {
        return res.json(null); 
    }
    db.query('SELECT * FROM Items WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.json({}); 
        }
        db.query('UPDATE Items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({
                id,
                name,
                desc
            });
        });
    });
});

  
  