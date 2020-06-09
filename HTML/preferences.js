const fs = require("fs");
const ini = require("ini");
const ahkExecScripts = require("../AutoHotKey/AHK_calls/ahkExecScripts.js");
const path = require("path");

// Load current hotkey values
function loadIni() {
  var config = ini.parse(
    fs.readFileSync(
      path.join(__dirname, "../AutoHotKey/Input_Mapping.ini"),
      "utf-8"
    )
  );
  document.getElementById("input1").value = config.Input.Input1;
  document.getElementById("input2").value = config.Input.Input2;
}

// Update config file with new hotkeys, restart AHK scripts, close window
function writeIni() {
  if (checkDups() !== true) {
    var config = ini.parse(
      fs.readFileSync(
        path.join(__dirname, "../AutoHotKey/Input_Mapping.ini"),
        "utf-8"
      )
    );
    config.Input.Input1 = document.getElementById("input1").value;
    config.Input.Input2 = document.getElementById("input2").value;

    fs.writeFileSync(
      path.join(__dirname, "../AutoHotKey/Input_Mapping.ini"),
      ini.stringify(config, { section: "" })
    );

    // Start the main input AHK script.
    ahkExecScripts.ahkRunScript("main");
    // Close the form
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

    // TODO: Not working for space key... weird...
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