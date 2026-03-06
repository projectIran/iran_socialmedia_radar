# Backend

Backend services for Iran Social Media Radar. Each project runs independently and has its own dependencies and config.

## Projects

| Project | Description |
|---------|-------------|
| **[telegram-radar/](telegram-radar/README.md)** | Python bot that monitors X (Twitter) for Iran-related trends and sends posts to Telegram. Run: see [telegram-radar/README.md](telegram-radar/README.md) for env setup and commands. |

## Running

Each subfolder has its own `requirements.txt` and (where needed) `.env.example`. Install and run from inside the project folder:

```bash
cd backend/telegram-radar
pip install -r requirements.txt
cp .env.example .env
# edit .env with X_BEARER_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
python radar.py
```
