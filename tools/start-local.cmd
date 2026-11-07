@echo off
setlocal
set "port=%~1"
if "%port%"=="" set "port=8000"

pushd "%~dp0.."
python -m http.server %port%
set "exit_code=%ERRORLEVEL%"
popd
exit /b %exit_code%
