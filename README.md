[Unit]
Description=Send Order
# Only launch after network service has started
After=network.target

[Service]
# Full address of your app
ExecStart=/home/ubuntu/.nvm/versions/node/v20.16.0/bin/node /var/www/sendOrderToOperator/index.js
Restart=always
User=nobody
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
Group=nogroup
Environment=PATH=/home/ubuntu/.nvm/versions/node/v20.16.0/bin:/usr/bin:/usr/local/bin
# Set Node to production env
Environment=NODE_ENV=production
WorkingDirectory=/var/www/sendOrderToOperator

[Install]
WantedBy=multi-user.target
