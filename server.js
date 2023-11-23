require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

// const util = reqire("util");
const api = require("./routes/index.js");
// const { readFile } = require("fs");

// Server setup
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/api", api);

// Serve static files from the public directory
app.use(express.static("public"));

// GET Route for homepage
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

// GET Route for notes page
app.get("/notes", (req, res) => {
	res.sendFile(path.join(__dirname, "public/notes.html"));
});

// API GET Route ( Reads db.JSON and returns all saved notes as JSON )
app.get("/api/notes", (req, res) => {
	fs.readFile("./db/db.json", "utf-8")
		.then((data) => {
			const notes = JSON.parse(data);
			res.json(notes);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("An error occurred while reading the file.");
		});
});

// API POST Route ( Receives new notes and adds to db.json )
app.post("/api/notes", (req, res) => {
	const note = req.body;
	fs.readFile("./db/db.json", "utf-8")
		.then((data) => {
			const notes = JSON.parse(data);
			note.id = uuidv4();
			notes.push(note);
			fs.writeFile("./db/db.json", JSON.stringify(notes));
		})
		.then(() => {
			res.json(note);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("An error occured while processing the note.");
		});
});

// API DELETE Route ( Deletes the posted note )
app.delete("/api/notes/:id", (req, res) => {
	const noteID = req.params.id;

	fs.readFile("./db/db.json", "utf-8")
		.then((data) => {
			let notes = JSON.parse(data);
			notes = notes.filter((note) => note.id !== noteID);

			return fs.writeFile("./db/db.json", JSON.stringify(notes));
		})
		.then(() => {
			res.status(200).send(`Note with ID ${noteID} deleted successfully.`);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send("An error occurred while processing the request.");
		});
});

// Start the server
app.listen(PORT, () =>
	console.log(`App listening at http://localhost:${PORT}`)
);
