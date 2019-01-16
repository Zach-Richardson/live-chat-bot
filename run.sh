if [[ -z "${NODE_ENV}" ]]; then 
  echo "Environment variable NODE_ENV not set, options: [dev|prod]"
fi
if [[ -z "${USER}" ]]; then
  echo "Environment variable USER not set, options: [postgres]"
fi
if [[ -z "${RELAY_STORAGE_BACKING}" ]]; then
  echo "Environment variable RELAY_STORAGE_BACKING not set, options: [postgres]"
fi

function startDocker() {
  DOCKER_DB_NAME="live_chat_db$(pwd | sed 's/\//_/g')"
	if sudo docker inspect $DOCKER_DB_NAME >/dev/null 2>&1;  then
		echo "Starting existing database";
		sudo docker start --interactive --attach $DOCKER_DB_NAME;
	else
		echo "Creating NEW database";
		sudo docker run --interactive -p 5432:5432 --name $DOCKER_DB_NAME postgres:10; \
	fi
}

function resetDocker() {
  echo "Stopping docker container"
  docker kill $DOCKER_DB_NAME 2>/dev/null || exit 0
  echo "Purging docker database"
	docker rm -f $DOCKER_DB_NAME 2>/dev/null || exit 0
}

if [[ "$1" == "clean" ]]; then
  echo "Cleaning project"
  resetDocker
  echo "Removing static files"
  sudo rm -drf dist semantic node_modules
elif [[ "$1" == "docker" ]]; then
  startDocker
elif [[ "$1" == "serve" ]]; then
  npm run build&
  node server
elif [[ "$1" == "run" ]]; then
  node server&
  npm run serve
elif [[ "${NODE_ENV}" == "prod" ]]; then
  echo "Building Production"
  startDocker&
  npm run build&
  node server
elif [[ "${NODE_ENV}" == "dev" ]]; then
  echo "Running Dev Server (Webpack HMR)"
  startDocker&
  node server&
  npm run serve
fi

trap 'killall node' SIGINT