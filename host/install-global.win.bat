:: Run as admin
net session 1>nul 2>nul
if %errorLevel% NEQ 0 (
    echo Requesting permissions...
    powershell start-process '"%~dpnx0"' -verb runas
	exit
)

REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\com.daijro.clipboard2file" /ve /t REG_SZ /d "%~dp0com.daijro.clipboard2file.win.json" /f
REG ADD "HKLM\Software\Microsoft\Edge\NativeMessagingHosts\com.daijro.clipboard2file" /ve /t REG_SZ /d "%~dp0com.daijro.clipboard2file.edge.win.json" /f