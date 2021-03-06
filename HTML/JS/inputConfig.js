const electron = require("electron");
const { ipcRenderer } = electron;
const fs = require("fs");
const ini = require("ini");
const path = require("path");
const { load, write } = require("../JS/iniConnect.js");

// Load current hotkey values
function loadIni() {
  let config = load.loadIni("config.ini");

  document.getElementById("input1").value = config.Input.Input1;
  document.getElementById("input2").value = config.Input.Input2;
  document.getElementById("disableInputCheck").checked = config.Input.Disabled;
}

// Update config file with new hotkeys, restart AHK scripts, close window
function writeIni() {
  if (checkDups() !== true) {
    let config = load.loadIni("config.ini");

    config.Input.Input1 = document.getElementById("input1").value;
    config.Input.Input2 = document.getElementById("input2").value;
    config.Input.Disabled = document.getElementById(
      "disableInputCheck"
    ).checked;

    write.writeIni("config.ini", config);

    ipcRenderer.send("run:ahkScript", "main");
    //Close the form
    window.close();
  }
}

// Collect new user input
function inputPrompt(inputNum) {
  const input = document.getElementById(inputNum);
  if (input.disabled === false) {
    input.disabled = true;
  } else if (disabledCheck() !== true) {
    input.disabled = false;
    input.focus();
    input.select();

    // have to loop through the gamepad settings to detect keypresses
    let joy = setInterval(() => {
      gameLoop(input);
    }, 50);

    function gameLoop(input) {
      var gamepad = navigator.getGamepads()[0]; //get the first controller.
      if (gamepad && gamepad.connected) {
        // to check if other buttons(A,B,C,D,OK,Exit...) was pressed
        var buttons = gamepad.buttons;
        for (var i in buttons) {
          if (buttons[i].pressed == true) {
            console.log("buttons[%s] pressed", i);
            input.value = "joy" + (parseInt(i) + 1);
            input.disabled = true;
            clearInterval(joy);
          }
        }
      }
    }

    // Collect keyboard keys for input, needed special behavior for space...
    input.addEventListener("keydown", (e) => {
      input.value = e.key;
      if (input.value === " ") {
        input.value = "space";
      }
      input.disabled = true;
    });
  }
}

function checkDups() {
  let input1 = document.getElementById("input1");
  let input2 = document.getElementById("input2");

  if (input1.value === input2.value) {
    alert(
      "Duplicate Inputs are not allowed, please change one of the inputs to a new value!"
    );
    return true;
  } else return false;
}

function disabledCheck() {
  let input1 = document.getElementById("input1");
  let input2 = document.getElementById("input2");
  {
    if (input1.disabled === false || input2.disabled === false) {
      alert(
        "You can only edit one input at a time! Finish editing before continuing!"
      );
      return true;
    }
  }
}

// Set default values for the user.
function dfInput(input) {
  let clr = document.getElementById(input);
  clr.value = input === "input1" ? "tab" : "enter";
  clr.disabled = true;
}

function disableInput() {
  let disableCheckBox = document.getElementById("disableInputCheck");
  let inputOptions = document.getElementById("inputOptions");
  if (disableCheckBox.checked || disableCheckBox.checked === true) {
    inputOptions.style = "pointer-events: none; opacity: 0.4;";
  } else {
    inputOptions.style = "";
  }
}
