# Telegram Radar

Bot that finds trending X (Twitter) posts about Iran/Israel/USA and sends them to Telegram.

**Designed for minimal API usage** — ~7,200 reads/month (Basic plan allows 10,000).

## Topics monitored

- Iran and Israel (attacks, military tensions)
- Iran and USA (sanctions, nuclear, war)
- Iran revolution and protests
- Reza Pahlavi, Khamenei, IRGC

## Install

```bash
cd telegram-radar
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
```

## Configuration (.env)

### 1. X API token
Only `X_BEARER_TOKEN` is required (read-only, does not post):
- Go to [developer.x.com](https://developer.x.com)
- Copy the Bearer Token

### 2. Telegram bot
- In Telegram, message `@BotFather`
- Send `/newbot` and follow the steps
- Copy the bot token → `TELEGRAM_BOT_TOKEN`

### 3. Telegram Chat ID
- Add the bot to a group or channel
- Or use `@userinfobot` to get your Chat ID
- Set it → `TELEGRAM_CHAT_ID`

## Run

```bash
# Continuous run (checks every 60 minutes)
python radar.py

# Run once
python radar.py --once

# Test without sending to Telegram
python radar.py --dry-run

# Run once without sending
python radar.py --once --dry-run
```

## API cost

| Setting | Requests/day | Reads/month | Status |
|---------|--------------|-------------|--------|
| Every 60 min (default) | ~24 | ~7,200 | ✅ Under limit |
| Every 120 min | ~12 | ~3,600 | ✅ Cheaper |
| Every 30 min | ~48 | ~14,400 | ⚠️ Above Basic limit |

> If API budget is tight, set `SEARCH_INTERVAL_MINUTES=120`.

## Run on server (24/7)

```bash
# With nohup
nohup python radar.py > /dev/null 2>&1 &

# Or with screen
screen -S radar
python radar.py
# Ctrl+A, D to detach

# Or with a systemd service
```

## Files

| File | Description |
|------|-------------|
| `radar.py` | Main script |
| `.env` | Configuration (private) |
| `seen_tweets.json` | Cache of seen tweets (auto-generated) |
| `stats.json` | Send stats (auto-generated) |
| `radar.log` | Activity log |
