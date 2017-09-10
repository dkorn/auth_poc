#!/bin/sh

# Description: demo script to allow submitting API requests to the dummy micro service,
# using the auth service POC.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
RESET='\033[0m' # No Color

echo "\n${PURPLE}Before you start palyin'${RESET}\n"
echo "Available user API tokens: ${YELLOW}'aaa', 'bbb'${RESET}"
echo "Available resources: ${BLUE}'incidents' (incidents/{1, 2, 3}), 'entities' (incidents/1/entities/{1, 2, 3}) 'users'${RESET}\n"

while [ 1 ]
do
  read -p "$(echo Enter $YELLOW"User API Token"${RESET}) `echo $'\n> '`" userApiToken
  echo "\n"

  read -p "$(echo Enter $BLUE"resource"${RESET} query in the following format: '<collection>/<resource-id>/<subresource-collection>/<subresource-id>') `echo $'\n> '`" resource
  echo "\n"

  echo "Generated GET request for resource ${BLUE}$resource ${RESET}with user API token ${YELLOW}$userApiToken ${RESET}:"
  echo "${GREEN}http localhost:1449/api/$resource Authorization:$userApiToken${RESET} \n"

  while true; do
    read -p "To submit request hit $(echo $GREEN'ENTER'$RESET) key, to change the request params hit $(echo $RED'f'$RESET) `echo $'\n> '`" -s -n 1 key
    if [[ $key = "" ]]; then
      echo "\nSubmitting request!\n"
      http localhost:1449/api/$resource Authorization:$userApiToken
      echo "\n"
      break
    elif [ $key = "f" ]; then
      echo "\n"
      break
    else
      echo "\nYou pressed '$key', please type ${GREEN}ENTER or ${RED}f${RESET}\n"
      continue
    fi
    break
  done
done

