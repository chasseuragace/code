# Workspace Rules

- Single source of truth for time: local machine clock.
- Follow service-first development: implement and fully test services before controllers.
- Use Docker for local development. `server` and `db` services defined in `docker-compose.yml`.
- Source mounted as a volume for rapid iteration: `./src:/app/src`.
- TypeORM `synchronize: true` in dev only, never in production.
- Log decisions in `DECISIONS.md`. Keep notes in `NOTES.md`. Maintain plan in `PLAN.md`.
- All APIs must have Jest tests. Start with service tests; add e2e after controllers.
- Code style: NestJS module structure under `src/modules/`.
