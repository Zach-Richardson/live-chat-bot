keepGoing=1
if [[ 
  -z "${NODE_ENV}" ||
  ! ( 
    #valid values for NODE_ENV
    "${NODE_ENV}" == "development" ||
    "${NODE_ENV}" == "production"  
  ) ]]; then 
  printf "Error: Environment variable NODE_ENV not configured properly!
  NODE_ENV configures the run script and the node server. For more information check README.md.
  Please set NODE_ENV to a valid value. Options: [development|production]\n\n"
  keepGoing=0
fi
if [[ -z "${USER}" || 
  ! ( 
    #valid values for USER
    "${USER}" == "postgres"
  ) ]]; then
  printf "Error: Environment variable USER not not configured properly!
  USER configures the postgres server running on the docker container. For more information check README.md.
  Please set USER to a valid value. Options: [postgres]\n\n"
  keepGoing=0
fi
if [[ -z "${RELAY_STORAGE_BACKING}" ||
  ! ( 
    #valid values for USER
    "${RELAY_STORAGE_BACKING}" == "postgres"
  ) ]]; then
  printf "Error: Environment variable RELAY_STORAGE_BACKING not configured properly!
  RELAY_STORAGE_BACKING configures librelay's storage API. For more information check README.md.
  Please set RELAY_STORAGE_BACKING to a valid value. Options: [postgres]\n\n"
  keepGoing=0
fi

if [[ $keepGoing -eq 0 ]]; then
  exit 0
fi

function startDocker() {
  DOCKER_DB_NAME="live_chat_db$(pwd | sed 's/\//_/g')"
	if sudo docker inspect $DOCKER_DB_NAME >/dev/null 2>&1;  then
		echo "Starting existing docker container with postgres database";
		sudo docker start --interactive --attach $DOCKER_DB_NAME;
	else
		echo "Creating NEW docker container with postgres database";
		sudo docker run --interactive -p 5432:5432 --name $DOCKER_DB_NAME postgres:10; \
	fi
}

function resetDocker() {
  DOCKER_DB_NAME="live_chat_db$(pwd | sed 's/\//_/g')"
  printf "docker kill ${DOCKER_DB_NAME}\n"
  sudo docker kill $DOCKER_DB_NAME 2>/dev/null
  printf "docker rm -f ${DOCKER_DB_NAME}\n"
	sudo docker rm -f $DOCKER_DB_NAME 2>/dev/null
}

function rmStaticDirs() {
  printf "Removing directories /dist /semantic /node_modules\n"
  sudo rm -rfd dist semantic node_modules
}

if [[ "$1" == "clean" ]]; then
  rmStaticDirs
elif [[ "$1" == "docker-db-run" ]]; then
  startDocker
elif [[ "$1" == "docker-db-clean" ]]; then
  resetDocker
elif [[ "$1" == "server" ]]; then
  node server
elif [[ "$1" == "run" && "$2" != "ui" ]]; then
  if [[ "${NODE_ENV}" == "production" && ! -z "$1" ]]; then
    printf "Building for Production\n"
    startDocker& 2>/dev/null
    npm run build&
    node server
  elif [[ "${NODE_ENV}" == "development" && ! -z "$1" ]]; then
    printf "Running Dev Server (Webpack HMR)\n"
    startDocker& 2>/dev/null
    node server&
    npm run serve
elif [[ "$1" == "run" && "$2" == "ui" ]]; then
  printf "Running Dev Server (Webpack HMR)\n"
  startDocker& 2>/dev/null
  node server&
  vue ui
else
  echo "command not recognized! available commands: clean, docker, run, run ui"
fi
trap 'killall node' SIGINT