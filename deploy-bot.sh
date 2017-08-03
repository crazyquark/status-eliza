#!/bin/bash
#status-dev-cli add '{"whisper-identity": "status-eliza", "bot-url": "http://10.162.130.120:7878/bot/bot.js", "name": "Eliza"}' --ip 10.162.131.105
status-dev-cli remove --ip 10.162.131.6
status-dev-cli add --botUrl http://10.162.130.120:7878/bot/bot.js --ip 10.162.131.6

