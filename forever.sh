#!/bin/bash

if [ $# -eq 2 ]; then

  echo "Starting server..."
  export TUNNEL_PORT=$1
  export PORT=$2
  forever start dist/app.js

elif [ $# -eq 4 ]; then

  echo "Starting client..."
  export TUNNEL_HOST=$1
  export TUNNEL_PORT=$2
  export HOST=$3
  export PORT=$4
  forever start dist/app.js

else

  echo "Syntax: ./forever.sh tunnel-port port"
  echo "        ./forever.sh tunnel-host tunnel-port host port"
  echo "e.g. start server: ./forever.sh 15627 8080"
  echo "e.g. start client: ./forever.sh example.com 15627 localhost 80"

fi
