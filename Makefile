default: $(BUILD)

DOCKER_DB_NAME := live_chat_db$(shell pwd | sed 's/\//_/g')
BUILD := npm run build
RUN := npm run serve
SERVE := node server

docker-db-run:
	if docker inspect $(DOCKER_DB_NAME) >/dev/null 2>&1; then \
		echo "Starting existing database"; \
		docker start --attach $(DOCKER_DB_NAME); \
	else \
		echo "Creating NEW database"; \
		docker run -p 5432:5432 --name $(DOCKER_DB_NAME) postgres:10; \
	fi

docker-db-clean:
	docker kill $(DOCKER_DB_NAME) 2>/dev/null || exit 0
	docker rm -f $(DOCKER_DB_NAME) 2>/dev/null || exit 0
	
clean:
	rm -dr node-modules dist