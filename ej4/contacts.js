const MongoClient = require('mongodb').MongoClient;

function help() {
  console.log(
    `Usage: node contacts <cmd> 

        Available commands*: 
        ls <query>: list contacts 
        add <email> <title>: add a new contact 
        update <email> <title>: update a contact 
        rm <email>: remove a contact `,
  );
}

console.log(process.argv);

if (process.argv[2] == "ls") {
  listContacts(null, (err, contacts) => {
    if (err) console.log("Error: " + err.stack);
    else console.log(contacts);
  });

} else if (process.argv[2] == "add") {
  let contact = {
    email: process.argv[3],
    title: process.argv[4]
  };
  addContact(contact, (err, cb) => {
    if (err) console.log("Error: " + err.stack);
    else console.log("Added");
  });
} else if (process.argv[2] == "update") {
  let contact = {
    email: process.argv[3],
    title: process.argv[4]
  };
  updateContact(contact, (err, cb) => {
    if (err) console.log("Error: " + err.stack);
    else console.log("UPDATED.");
  });
} else if (process.argv[2] == "rm") {
  let contact = {
    email: process.argv[3]
  };
  removeContact(contact, (err, cb) => {
    if (err) console.log("Error: " + err.stack);
    else console.log("Removed");
  });
} else help();

function addContact(contact, cb) {
  MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) cb(err);
    else {
      let db = client.db("ej4");
      let contacts = db.collection("contacts");
      contacts.insertOne(contact, (err, result) => {
        if (err) cb(err);
        else cb(null, contact);
        client.close();
      });
    }
  })
}

function updateContact(contact, cb) {
  MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) cb(err);
    else {
      let db = client.db("ej4");
      let contacts = db.collection("contacts");
      contacts.updateOne({ name: contact.name }, { $set: { title: contact.title } }, (err, docs) => {
        if (err) cb(err);
        else cb(null, docs);
        client.close();
      });
    }
  })
}

function removeContact(contact, cb) {
  MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) cb(err);
    else {
      let db = client.db("ej4");
      let contacts = db.collection("contacts");
      contacts.deleteOne({ name: contact.name }, (err, docs) => {
        if (err) cb(err);
        else cb(null, docs);
        client.close();
      });
    }
  })
}

function listContacts(query, cb) {
  MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) cb(err);
    else {
      let db = client.db("ej4");
      let contacts = db.collection("contacts");
      contacts.find().toArray((err, docs) => {
        if (err) cb(err);
        else cb(null, docs);
        client.close();
      });
    }
  })
}

function readContacts(cb) {
  fs.access(DB_PATH, fs.constants.F_OK, (err) => {
    if (err) cb(null, []);
    else {
      fs.readFile(DB_PATH, (err, data) => {
        if (err) cb(err);
        else {
          let contacts = JSON.parse(data);
          cb(null, contacts);
        }
      });
    }
  });
}

function writeContacts(contacts, cb) {
  let json = JSON.stringify(contacts);
  fs.writeFile(DB_PATH, json, cb);
}
