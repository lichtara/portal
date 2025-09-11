.PHONY: run dev obs down k6

run:
	cd portal && uvicorn lumora.service:app --host 0.0.0.0 --port 8000

dev:
	docker compose up lumora-dev --build

obs:
	docker compose up -d prometheus grafana

down:
	docker compose down

k6:
	k6 run k6-studio/lumora-smoke.js
