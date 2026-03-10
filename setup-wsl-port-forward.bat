@echo off
echo Nastavuji port forwarding WSL -> Windows pro Vite (port 5173)...
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=172.24.4.255
netsh advfirewall firewall add rule name="Vite Dev 5173" dir=in action=allow protocol=TCP localport=5173
echo.
echo Hotovo! Telefon se pripoji na: http://10.0.1.49:5173
pause
