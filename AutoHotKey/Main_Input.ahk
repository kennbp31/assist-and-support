; Purpose of this script is to always run and modify controls based on which screens are open. 
SendMode Input
SetWorkingDir, %A_ScriptDir%
DetectHiddenWindows, On
SetTitleMatchMode, 2 
#SingleInstance, Force
#NoTrayIcon

; Maps to specific INI file to set what the user wants to use as their input device/method
IniRead, input1 , %A_ScriptDir%\..\config.ini, Input, Input1
IniRead, input2 , %A_ScriptDir%\..\config.ini, Input, Input2

; input1 = joy1 ;< Overide to set an input method in the script
; input2 = joy2 ;< Overide to set an input method in the script

; These hotkeys are suspended in the ToggleLock script, prevents users from sending additional commands until one is finshed.
Hotkey,%input1%,input1, On
Hotkey,%input2%,input2, On

return
; because a variable is needed for various input devices
; I had to use a label rather than a traditional hotkey
; This means there is a separate set of scripts for each mapped input
; This will get complicated of ther user requires more than one input...

input1:
    input1(input1)
return
input2:
    input2(input2) 
return
a::a 

#Include <Input1_Functions>
#Include <Input2_Functions> 
#Include <ToggleLock>

