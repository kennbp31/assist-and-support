const electron = require("electron");
const contacts = require("./contacts.js");
const electronWindows = require("./electronWindows.js");
const weather = require("./APIs/weather.js");
const ahkExecScripts = require("./AutoHotKey/AHK_calls/ahkExecScripts.js");

const { app, ipcMain } = electron;

let mainWindow;
let addWindow;

// Create the main window/DOM
app.on("ready", async function () {
  // Load the main window and menu bar
  mainWindow = await electronWindows.createMainWindow.createMainWindow();

  // populate Index.html with the current weather.
  mainWindow.webContents.on("dom-ready", () => {
    async function weatherNode(mainWindow) {
      let ip = await weather.ipAddress.ipAdd();
      let location = await weather.geoLocation.geoLocation(await ip);
      let currentWeather = await weather.currWeather.currWeather(
        await location,
        mainWindow
      );
    }
    weatherNode(mainWindow);

    // Start the main input AHK script.
    ahkExecScripts.ahkRunScript("main");
  });
});

// Catch contact edit request
ipcMain.on("contact:edit", function (err, id) {
  console.log("Log - Edit call received");

  // Ensure the user only opens one edit window at a time
  // If the user is editing an existing record, there is an ID. Open edit window and load information.
  if (id) {
    addWindow = electronWindows.newElectronWindow.createAddWindow(
      "Add/Edit Contact",
      "HTML/contactedit.html"
    );
    // Redundant check for undefined window, worth it to
    // split up the window creation to diff functions.
    if (addWindow !== undefined) {
      // Populate form with existing contact info
      addWindow.webContents.on("did-finish-load", () => {
        contacts.loadEditContact(addWindow, id);
      });
    }

    // If there is no id, then it is a new contact, just open a blank contact window.
  } else {
    addWindow = electronWindows.newElectronWindow.createAddWindow(
      "Add/Edit Contact",
      "HTML/contactedit.html"
    );
  }
});

// Catch contacts:call
ipcMain.on("contacts:call", function (err) {
  contacts.loadContacts(mainWindow);
  console.log("Log - Main Received Message");
});

// Catch Editing an existing contact
ipcMain.on("item:submitEdit", function (err, id, contactSubmit) {
  console.log(
    "Log - Main Received Message - Contact Name: ",
    contactSubmit.first_name
  );
  const editContact = async () => {
    let promise = await contacts.submitContactEdit(err, id, contactSubmit);
    addWindow.close();
    contacts.loadContacts(mainWindow);
  };

  editContact();
});

// Catch Adding a New Contact
ipcMain.on("item:submitAdd", function (err, contactSubmit) {
  console.log(
    "Log - Main Received Message - Contact Name: ",
    contactSubmit.first_name
  );
  const addContact = async () => {
    let promise = await contacts.submitContactAdd(err, contactSubmit);
    addWindow.close();
    contacts.loadContacts(mainWindow);
  };

  addContact();
});

// Catch Deleting a contact
ipcMain.on("contact:delete", function (err, id) {
  console.log("Log - Main Received Message - Deleting Contact ID : ", id);
  // Delete the contact specified using Knex
  const delContact = async () => {
    let promise = await contacts.deleteContact(err, id);
    addWindow.close();
    contacts.loadContacts(mainWindow);
  };

  delContact();
});
