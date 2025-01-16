// const express = require("express");
// const app = express();
// const cors = require("cors");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const port = 3000;

// app.use(cors());
// app.use(express.json());

// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri =
//   "mongodb+srv://ifshadokobiz:B2QI88O7Dr7T1nVW@cluster0.evvtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// // const upload = multer({ dest: "../uploads/" });
// const upload = multer({ dest: path.join(__dirname, "../uploads/") });

// async function run() {
//   try {
//     client.connect();

//     const bookCollection = client.db("ebook_reader").collection("books");

//     app.get("/books", async (req, res) => {
//       const cursor = bookCollection.find({});
//       const books = await cursor.toArray();
//       res.send(books);
//     });

//     app.get("/books/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await bookCollection.findOne(query);
//       res.send(result);
//     });

//     app.post("/books", upload.single("file"), async (req, res) => {
//       try {
//         const file = req.file;
//         const { name, title } = req.body;

//         if (!file) {
//           return res.status(400).send("No file uploaded");
//         }

//         // Read file content
//         // const filePath = path.join(__dirname, file.path);
//         // const fileContent = fs.readFileSync(filePath);
//         const filePath = path.join(__dirname, "../", file.path);
//         const fileContent = fs.readFileSync(filePath);

//         // Create a document to store file metadata and content
//         const book = {
//           name: name,
//           title: title,
//           filename: file.originalname,
//           // contentType: file.mimetype,
//           data: fileContent,
//           uploadedAt: new Date(),
//         };

//         const result = await bookCollection.insertOne(book);

//         // Delete the temporary file
//         fs.unlinkSync(filePath);

//         res.send({ success: true, result: result });
//       } catch (error) {
//         console.error("Error uploading file:", error);
//         res.status(500).send(`Failed to upload file. error: ${error}`);
//       }
//     });

//     app.delete("/books/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await bookCollection.deleteOne(query);
//       res.send(result);
//     });

//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } catch (error) {
//     throw new Error("Unable to connect to MongoDB instance");
//   }
// }
// run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri =
  "mongodb+srv://ifshadokobiz:B2QI88O7Dr7T1nVW@cluster0.evvtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// File upload configuration
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// MongoDB operations
async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("ebook_reader").collection("books");

    // Routes
    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();
      res.send(books);
    });

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    app.post("/books", upload.single("file"), async (req, res) => {
      try {
        const file = req.file;
        const { name, title } = req.body;

        if (!file) {
          return res.status(400).send("No file uploaded");
        }

        // Construct file path and read content
        const filePath = path.join(uploadDir, file.filename);
        const fileContent = fs.readFileSync(filePath);

        // Create a document with metadata and content
        const book = {
          name,
          title,
          filename: file.originalname,
          data: fileContent,
          uploadedAt: new Date(),
        };

        const result = await bookCollection.insertOne(book);

        // Clean up the temporary file
        fs.unlinkSync(filePath);

        res.send({ success: true, result });
      } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send(`Failed to upload file. Error: ${error}`);
      }
    });

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    });

    console.log("Connected to MongoDB and ready to serve requests!");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
