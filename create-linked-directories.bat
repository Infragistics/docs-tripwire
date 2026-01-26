@ECHO off
set CURDIR=%CD%
set offContent=%CURDIR%\offline\Tripwire.Offline\Content
set offImages=%CURDIR%\offline\Tripwire.Offline\img
set offScripts=%CURDIR%\offline\Tripwire.Offline\scripts
set onContent=%CURDIR%\online\Tripwire.Web\Content
set onImages=%CURDIR%\online\Tripwire.Web\img
set onScripts=%CURDIR%\online\Tripwire.Web\scripts
set TripwireTopics=%CURDIR%\topics

ECHO ------------
cd %CURDIR%

mklink /j %offContent% %onContent%
ECHO ------------
mklink /j %offImages% %onImages%
ECHO ------------
mklink /j %offScripts% %onScripts%
ECHO ------------

cd ..
IF EXIST %CD%\help-topics-ja\topics (
	ECHO JA folder found, linking
	mklink /j %TripwireTopics% %CD%\help-topics-ja\topics 
) ELSE (
	ECHO linking EN folder
	mklink /j %TripwireTopics% %CD%\help-topics\topics
)


PAUSE