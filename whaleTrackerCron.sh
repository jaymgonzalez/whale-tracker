#!/bin/bash
process="whale-tracker/index.js"
makerun="/home/jay/.nvm/versions/node/v16.17.0/bin/node /home/jay/workspace/whale-tracker/index.js"
logging="/home/jay/workspace/logs/whale-tracker.log"
if ps aux | grep -v grep | grep --quiet $process
then
    printf "Process '%s' is running.\n" "$process"
    exit
else
    printf "Starting process '%s'.\n" "$process"
    $makerun & >> $logging
fi
exit