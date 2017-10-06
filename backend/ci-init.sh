#!/bin/bash
# manage server commands here for danfossbot

echo "updatinga bluefire-backend"
cd /home/bluefire/bluefire-backend
git pull
sudo docker-compose down
sudo docker rmi bluefire
sudo docker build . -t bluefire
NODE_ENV=PROD docker-compose up -d