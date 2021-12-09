#!/bin/bash

#git reset --hard
#git pull origin master

npm run build
npm i

pm2 start process.config.js
