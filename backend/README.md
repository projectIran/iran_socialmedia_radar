# Backend

Backend services for Iran Social Media Radar. Each project runs independently and has its own dependencies and config.

## Projects

| Project | Description |
|---------|-------------|
| **[core-system/](core-system/README.md)** | Core backend: Node.js API for users, co-hosts, auth (email/password). Technical doc: [core-system/docs/design-pattern.md](core-system/docs/design-pattern.md). |
| **[telegram-radar/](telegram-radar/README.md)** | Python bot that monitors X (Twitter) for Iran-related trends and sends posts to Telegram. Run: see [telegram-radar/README.md](telegram-radar/README.md) for env setup and commands. |

## Running

Each subfolder has its own dependencies and (where needed) `.env.example`. Install and run from inside the project folder.

**core-system** (Node.js):

```bash
cd backend/core-system
npm install
cp .env.example .env
# edit .env: DATABASE_URL, JWT_SECRET, ADMIN_EMAIL or ADMIN_USER_ID
npm run dev
```

**telegram-radar** (Python):

```bash
cd backend/telegram-radar
pip install -r requirements.txt
cp .env.example .env
# edit .env with X_BEARER_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
python radar.py
```
