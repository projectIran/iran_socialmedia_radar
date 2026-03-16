# Telegram Radar

Monitoring bot that:
1. Finds trending X (Twitter) posts about Iran and forwards them to Telegram
2. Posts **Javid Fighter** campaigns & petitions to a Telegram channel (with images and inline buttons)

Each data source works independently — you can enable Javid Fighter only, X only, or both.

## Installation

```bash
cd backend/telegram-radar
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

## Configuration

Two env files for separate environments:

| File | Environment | Description |
|------|-------------|-------------|
| `.env` | **Production (server)** | Main bot `@Iran_trend_X_post_Radar_bot` → channel `@iran_post_x_trend` |
| `.env.local` | **Local (development)** | Separate test bot → test channel/group |

### Local Setup (first time)

1. Message `@BotFather` on Telegram
2. Run `/newbot` and create a **test** bot (e.g. `MyRadarTestBot`)
3. Copy the bot token
4. Create a test channel or group and make the bot an admin
5. Fill in `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_test_bot_token
TELEGRAM_CHAT_ID=@your_test_channel
```

6. Run:

```bash
python radar.py --env .env.local --once
```

### Server Setup (production)

`.env` is pre-configured:

```env
TELEGRAM_BOT_TOKEN=production_bot_token
TELEGRAM_CHAT_ID=@iran_post_x_trend
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | — | Telegram bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | Yes | — | Channel (`@name`) or group (`-123456`) ID |
| `JAVID_API_URL` | No | `https://api.javidfighter.com` | Javid Fighter API base URL |
| `JAVID_API_KEY` | No | — | Javid Fighter API key |
| `JAVID_CHECK_INTERVAL_MINUTES` | No | `15` | Interval to check for new campaigns (minutes) |
| `X_BEARER_TOKEN` | No | — | X API bearer token (read-only) |
| `SEARCH_INTERVAL_MINUTES` | No | `60` | X search interval (minutes) |
| `MIN_LIKES` | No | `100` | Minimum likes to filter trending posts |
| `MIN_RETWEETS` | No | `20` | Minimum retweets to filter trending posts |
| `MAX_RESULTS` | No | `10` | Results per search query |

## Usage

```bash
# Local — test bot
python radar.py --env .env.local --once          # run once
python radar.py --env .env.local --once --dry-run # dry run (no sending)
python radar.py --env .env.local                  # continuous

# Server — production bot
python radar.py --once           # run once
python radar.py                  # continuous (24/7)
python radar.py --once --dry-run # dry run
```

## Running on a Server (24/7)

```bash
# With nohup
nohup python radar.py > /dev/null 2>&1 &

# With screen
screen -S radar
python radar.py
# Ctrl+A, D to detach

# Or use a systemd service
```

## Features

- **Inline Keyboard Buttons**: Each post has a direct action button (📧 Join Campaign / ✍️ Sign Petition / 🔗 View on X)
- **Photo Support**: Campaigns and petitions are sent with images (single photo or album)
- **Duplicate Prevention**: Previously sent items are tracked and won't be resent
- **Independent Sources**: X and Javid Fighter operate independently

## Files

| File | Description |
|------|-------------|
| `radar.py` | Main script |
| `.env` | Production config (private — git ignored) |
| `.env.local` | Local/test config (private — git ignored) |
| `.env.example` | Example config (public) |
| `seen_tweets.json` | Cache of sent X tweet IDs (auto-generated) |
| `seen_javid.json` | Cache of sent Javid Fighter items (auto-generated) |
| `stats.json` | Send statistics (auto-generated) |
| `radar.log` | Activity log |
