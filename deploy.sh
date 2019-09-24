#!/bin/bash

if [ ! -e README.md ]
then
  echo "Should be executed from inside the application folder"
  exit 0
fi

WWW_FOLDER=/home/ubuntu/wcm/wcm-backend/public
DIST_FOLDER=/home/ubuntu/wcm/wcm-frontend/dist

git pull https://tmcdos@bitbucket.org/wanos/wcm-frontend.git
RETVAL=$?
if [ $RETVAL -eq 0 ]
then
  npm run build
  RETVAL=$?
  if [ $RETVAL -eq 0 ]
  then
    rm -rf "$WWW_FOLDER"/*
    mkdir -p "$WWW_FOLDER"
    cp -af "$DIST_FOLDER"/* "$WWW_FOLDER/"
    echo "Deployment was successful"
  fi
fi