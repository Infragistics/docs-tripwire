@ECHO off
set CURDIR=%CD%

rd %CD%\topics /q

mklink /j %CD%\topics %1