#!/bin/bash
pm2 reload "vagus skool" 2>/dev/null || pm2 start server.js --name "vagus skool"
pm2 save
