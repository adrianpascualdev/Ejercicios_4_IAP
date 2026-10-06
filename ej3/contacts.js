const fs = require("fs");
const path = require("path");

const DB_PATH = "./data.json";

function help() {
  console.log(
    `Usage: node contacts <cmd>

Available commands:
  ls [query]           : list contacts
  add <email> <title>  : add a new contact
  update <email> <title>: update a contact
  rm <email>           : remove a contact`,
  );
}

function init() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { users: {}, contacts: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    console.log("Data store initialized.");
  }
}

init();

const cmd = process.argv[2];

try {
  if (cmd === "ls") {
    const query = process.argv[3];
    const contacts = listContacts(query);
    if (contacts.length === 0) {
      console.log("No contacts found.");
    } else {
      contacts.forEach(c => console.log(`${c.email}: ${c.title}`));
    }
  } else if (cmd === "add") {
    const contact = { email: process.argv[3], title: process.argv[4] };
    if (!contact.email || !contact.title) throw new Error("Usage: add <email> <title>");
    addContact(contact);
    console.log("Added");
  } else if (cmd === "update") {
    const contact = { email: process.argv[3], title: process.argv[4] };
    if (!contact.email || !contact.title) throw new Error("Usage: update <email> <title>");
    updateContact(contact);
    console.log("UPDATED.");
  } else if (cmd === "rm") {
    const email = process.argv[3];
    if (!email) throw new Error("Usage: rm <email>");
    removeContact(email);
    console.log("Removed");
  } else {
    help();
  }
} catch (err) {
  console.log("ERROR: " + err.message);
}

function readData() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return { users: {}, contacts: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function addContact(contact) {
  const data = readData();
  if (data.contacts[contact.email]) {
    throw new Error(`Contact already exists: ${contact.email}`);
  }
  data.contacts[contact.email] = { title: contact.title };
  writeData(data);
}

function updateContact(contact) {
  const data = readData();
  if (!data.contacts[contact.email]) {
    throw new Error(`Contact not found: ${contact.email}`);
  }
  data.contacts[contact.email].title = contact.title;
  writeData(data);
}

function removeContact(email) {
  const data = readData();
  if (!data.contacts[email]) {
    throw new Error(`Contact not found: ${email}`);
  }
  delete data.contacts[email];
  writeData(data);
}

function listContacts(query) {
  const data = readData();
  let contacts = Object.entries(data.contacts).map(([email, info]) => ({ email, ...info }));

  if (query) {
    const q = query.toLowerCase();
    contacts = contacts.filter(c =>
      c.email.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }

  return contacts;
}