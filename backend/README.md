# Backend

Backend services for Iran Social Media Radar. Each project runs independently and has its own dependencies and config.

## Projects

| Project | Description |
|---------|-------------|
<<<<<<< HEAD
| **[social-media-radar/](social-media-radar/README.md)** | FastAPI server + static dashboard. JSON data for decision-makers, LLM-based email generation API. Run: `pip install -r requirements.txt && python server.py` |
=======
| **[core-system/](core-system/README.md)** | Core backend: Node.js API for users, co-hosts, auth (email/password). Technical doc: [core-system/docs/design-pattern.md](core-system/docs/design-pattern.md). |
>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390
| **[telegram-radar/](telegram-radar/README.md)** | Python bot that monitors X (Twitter) for Iran-related trends and sends posts to Telegram. Run: see [telegram-radar/README.md](telegram-radar/README.md) for env setup and commands. |

## Running

<<<<<<< HEAD
Each subfolder has its own `requirements.txt` and (where needed) `.env.example`. Install and run from inside the project folder:

```bash
cd backend/social-media-radar
pip install -r requirements.txt
python server.py
```

=======
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

>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390
```bash
cd backend/telegram-radar
pip install -r requirements.txt
cp .env.example .env
# edit .env with X_BEARER_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
python radar.py
```
