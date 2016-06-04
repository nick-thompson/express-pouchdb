#!/bin/bash

node ./bin/express-pouchdb-minimum-for-pouchdb.js &
POUCHDB_SERVER_PID=$!

cd ./node_modules/pouchdbclone

COUCH_HOST=http://127.0.0.1:6984 npm test

EXIT_STATUS=$?
if [[ ! -z $POUCHDB_SERVER_PID ]]; then
  kill $POUCHDB_SERVER_PID
fi
exit $EXIT_STATUS
