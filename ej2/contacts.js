const sqlite3 = require("sqlite3");
const dbPath = "./contacts.sqlite";
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

function init(){
  let db = new sqlite3.Database(dbPath);
  db.run("create table if not exists contacts (email varchar(32), title varchar(32))",
    (err) => {
      if(err) console.log("Error initializing database");
      else console.log("Database initialized.");
  });
  db.close();

}

init();

console.log(process.argv);

if (process.argv[2] == "ls") {
  listContacts(null,(err,contacts) =>{
    if(err) console.log("Error: " + err.stack);
    else console.log(contacts);
  });

} else if (process.argv[2] == "add") {
    let contact = {
        email: process.argv[3],
        title: process.argv[4]
    };
    addContact(contact, (err,cb) => {
        if(err) console.log("Error: " + err.stack);
        else console.log("Added");
    });
} else if (process.argv[2] == "update") {
    let contact = {
        email: process.argv[3],
        title: process.argv[4]
    };
    updateContact(contact, (err,cb) => {
        if(err) console.log("Error: " + err.stack);
        else console.log("UPDATED.");
    });
} else if (process.argv[2] == "rm") {
    let contact = {
        email: process.argv[3]
    };
    removeContact(contact, (err,cb) => {
        if(err) console.log("Error: " + err.stack);
        else console.log("Removed");
    });
} else help();

function addContact(contact, cb) {
  let db = new sqlite3.Database(dbPath);
  db.run("insert into contacts values ('" + contact.email + "','" + contact.title + "')",
    (err) => {
      if (err) cb(err);
      else cb(null,contact);
      
  });
  db.close();

}

function updateContact(contact, cb) {
  let db = new sqlite3.Database(dbPath);
  db.run("update contacts set title = ? where email = ?", [contact.title, contact.email],
    (err) => {
      if (err) cb(err);
      else cb(null, contact);
  });
  db.close();
}

function removeContact(contact, cb) {
  let db = new sqlite3.Database(dbPath);
  db.run("delete from contacts where email = ?", [contact.email],
    (err) => {
      if (err) cb(err);
      else cb(null, contact);
  });
  db.close();
}

function listContacts(query,cb){
  let db = new sqlite3.Database(dbPath);
  db.all("select * from contacts",
    (err, contacts) => {
      if (err) cb(err);
      else cb(null,contacts);
      
  });
  db.close();
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
