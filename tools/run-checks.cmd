@echo off
setlocal
pushd "%~dp0.."

node --check appgame-core.js || goto :failed
node --check datacontent.js || goto :failed
node --check appaudio.js || goto :failed
node --check appclient.js || goto :failed
node --check testsgame-core.test.js || goto :failed
node testsgame-core.test.js || goto :failed

popd
exit /b 0

:failed
set "exit_code=%ERRORLEVEL%"
popd
exit /b %exit_code%
