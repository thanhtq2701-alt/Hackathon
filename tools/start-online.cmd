@echo off
setlocal
rem Starts the Fleet Council server (static game + online rooms). Usage: start-online.cmd [port]
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

pushd "%~dp0.."
node server\server.js
set "exit_code=%ERRORLEVEL%"
popd
exit /b %exit_code%
