help:
	@echo "Liste des commandes disponibles :"
	@grep -E '^[1-9a-zA-Z_-]+(\.[1-9a-zA-Z_-]+)?:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'

#-- PROJECT
start:  ## Start project
	yarn watch

#-- DATABASE
db.create: ## Create database
	@echo "Starting Docker Compose..."
	@docker-compose up -d
	@echo "Sleeping for 5 seconds..."
	@sleep 5
	@echo "Running make migration..."
	@yarn migrate

db.delete: ## Delete database
	docker compose down && docker volume rm -f fast-foodie-api_db && rm -rf ./public/files && rm -f ./src/migrations/*.ts

db.start: ## Start database
	docker start fast-foodie-db
	
db.stop: ## Stop database
	docker stop fast-foodie-db

db.clean: ## Clean database
	@make db.delete
	@make db.create
	@make start

db.export: ## Export database
	@echo "Exporting database..."
	@docker exec -i fast-foodie-db pg_dump -U fast-foodie-db fast-foodie-db > sakana_san.sql

db.import: ## Import database
	@echo "Importing database..."
	@docker exec -i fast-foodie-db psql -U fast-foodie-db fast-foodie-db < sakana_san.sql

db.reset: ## Reset database
	@echo "Resetting database..."
	@make db.export
	@make db.delete
	@make db.create
	@make start
	@make db.import

#-- TYPEORM
module.create: ## Create module
	@read -p "Entrer le nom du module: " name; \
	upperName=$$(echo $$name | awk '{print toupper(substr($$0,1,1)) tolower(substr($$0,2))}'); \
	allUpperName=$$(echo $$name | awk '{print toupper($$0)}'); \
	nest g module modules/$$name --no-spec; \
	nest g service modules/$$name --no-spec; \
	nest g controller modules/$$name --no-spec; \
	touch ./src/modules/$$name/$$name.entity.ts; \
	echo "import { Entity } from 'typeorm';\nimport { BaseEntity } from '../base.entity';\n\n@Entity()\nexport class $${upperName} extends BaseEntity {}" >> ./src/modules/$$name/$$name.entity.ts; \
	touch ./src/types/api/$$upperName.ts; \
	echo "export interface Create$${upperName}Api {}\n\nexport interface Update$${upperName}Api {}" >> ./src/types/api/$$upperName.ts; \
	echo "export * from './$${upperName}';" >> ./src/types/api/index.ts; \
	touch ./src/types/dto/$$upperName.ts; \
	echo "import { BaseDto } from './BaseDto';\n\nexport interface $${upperName}Dto extends BaseDto {}" >> ./src/types/dto/$$upperName.ts; \
	echo "export * from './$${upperName}';" >> ./src/types/dto/index.ts; \
	touch ./src/validations/$$name.ts; \
	echo "import { Create$${upperName}Api, Update$${upperName}Api } from 'src/types';\nimport * as yup from 'yup';\n\nconst create: yup.ObjectSchema<Create$${upperName}Api> = yup.object({});\n\nconst update: yup.ObjectSchema<Update$${upperName}Api> = yup.object({});\n\nexport const $${name}Validation = {\n  create,\n  update,\n};" >> ./src/validations/$$name.ts; \
	echo "export * from './$${name}';" >> ./src/validations/index.ts; \

#-- DOCKER
docker.build: ## Build docker image
	docker build --platform=linux/amd64 -t fast-foodie-api:latest .  

docker.tag: ## Tag docker image
	docker tag fast-foodie-api:latest noephilippe/fast-foodie-api:latest

docker.push: ## Push docker image
	docker push noephilippe/fast-foodie-api:latest

docker.new: ## Build, tag and push docker image
	make docker.build
	make docker.tag
	make docker.push

#-- DEPLOY
deploy: ## Deploy on server
	make docker.new 
	ansible-playbook -i inventory.ini deploy.yml