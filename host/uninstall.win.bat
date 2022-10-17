REG QUERY "HKLM\Software\Google\Chrome\NativeMessagingHosts\com.daijro.clipboard2file" 1>nul 2>nul
if %errorlevel%==0 call :runAsAdmin

REG DELETE "HKLM\Software\Google\Chrome\NativeMessagingHosts\com.daijro.clipboard2file" /f
REG DELETE "HKLM\Software\Microsoft\Edge\NativeMessagingHosts\com.daijro.clipboard2file" /f
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.daijro.clipboard2file" /f

exit

:runAsAdmin

net session 1>nul 2>nul
if %errorLevel%==0 goto:eof
echo Requesting permissions...
powershell start-process '"%~dpnx0"' -verb runas
exit