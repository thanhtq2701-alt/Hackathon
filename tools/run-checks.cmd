@echo off
setlocal
pushd "%~dp0.."

node --check app\game-core.js || goto :failed
node --check data\content.js || goto :failed
node --check app\audio.js || goto :failed
node --check app\client.js || goto :failed
node --check data\world-content.js || goto :failed
node --check app\world-core.js || goto :failed
node --check app\world-room.js || goto :failed
node --check app\world-art.js || goto :failed
node --check app\world-client.js || goto :failed
node --check server\storage.js || goto :failed
node --check server\server.js || goto :failed
node --check tests\game-core.test.js || goto :failed
node --check tests\world-core.test.js || goto :failed
node --check tools\sim\fleet.js || goto :failed
node --check tools\sim\oval.js || goto :failed
node tests\game-core.test.js || goto :failed
node tests\world-core.test.js || goto :failed
rem Quick smoke runs so the simulators keep working when the game code changes.
node tools\sim\fleet.js --matches 5 >nul || goto :failed
node tools\sim\oval.js --games 5 >nul || goto :failed

popd
exit /b 0

:failed
set "exit_code=%ERRORLEVEL%"
popd
exit /b %exit_code%
