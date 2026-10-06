const fs = require("fs");
const { title } = require("process");
const DB_PATH = "contacts.json";
function help() {
    console.log(
        `Usage: node contacts <cmd> 

        Available commands*: 
        ls <query>: list contacts 
        add <email> <title>: add a new contact 
        update <email> <title>: update a contact 
        rm <email>: remove a contact `
    );
}

console.log(process.argv);

if (process.argv[2] == "ls") {
    let query = process.argv[3];
    listContacts(query, (err, contacts) => {
        if (err) console.log("ERROR: " + err.stack);
        else {
            if (!contacts || contacts.length === 0) {
                console.log("No contacts found.");
            } else {
                contacts.forEach(c => console.log(c.email + ": " + c.title));
            }
        }
    });

} else if (process.argv[2] == "add") {
    let contact = {
        email: process.argv[3],
        title: process.argv[4]
    }
    addContact(contact, (err, c) => {
        if (err) console.log("ERROR: " + err.stack);
        else console.log("ADDED.")
    });
    
} else if (process.argv[2] == "update") {
    let contact = {
        email: process.argv[3],
        title: process.argv[4]
    }
    updateContact(contact, (err, c) => {
        if (err) console.log("ERROR: " + err.stack);
        else console.log("UPDATED.")
    });

} else if (process.argv[2] == "rm") {
    let email = process.argv[3];
    removeContact(email, (err, c) => {
        if (err) console.log("ERROR: " + err.stack);
        else console.log("REMOVED.")
    });

} else help();

function addContact(contact, cb) {
    readContacts((err, contacts) => {
        if (err) cb(err)
        else {
            contacts.push(contact);
            writeContacts(contacts, (err) => {
                if (err) cb(err)
                else cb(null, contact)
            })
        }
    });

}

function updateContact(contact, cb) {
    readContacts((err, contacts) => {
        if (err) cb(err)
        else {
            let index = contacts.findIndex(c => c.email === contact.email);
            if (index === -1) cb(new Error("Contact not found: " + contact.email));
            else {
                contacts[index] = contact;
                writeContacts(contacts, (err) => {
                    if (err) cb(err)
                    else cb(null, contact)
                })
            }
        }
    });

}


function removeContact(email, cb) {
    readContacts((err, contacts) => {
        if (err) cb(err)
        else {
            let index = contacts.findIndex(c => c.email === email);
            if (index === -1) cb(new Error("Contact not found: " + email));
            else {
                contacts.splice(index, 1);
                writeContacts(contacts, (err) => {
                    if (err) cb(err)
                    else cb(null, contacts)
                })
            }
        }
    });

}

function listContacts(query, cb) {
    readContacts((err, contacts) => {
        if (err) cb(err)
        else {
            if (!query) cb(null, contacts)
            else {
                let filtered = contacts.filter(c =>
                    c.email.includes(query) || c.title.includes(query)
                );
                cb(null, filtered);
            }
        }
    });

}

function readContacts(cb) {
    fs.readFile(DB_PATH, (err, data) => {
        if (err) {
            if (err.code === "ENOENT") cb(null, []);
            else cb(err);
        }
        else {
            try {
                let contacts = JSON.parse(data);
                cb(null, contacts);
            } catch (parseError) {
                cb(parseError);
            }
        }
    });
}

function writeContacts(contacts, cb) {
    let json = JSON.stringify(contacts);
    fs.writeFile(DB_PATH, json, cb);
}
