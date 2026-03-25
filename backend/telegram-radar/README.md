<<<<<<< HEAD
# Telegram Radar

Bot that finds trending X (Twitter) posts about Iran/Israel/USA and sends them to Telegram.

**Designed for minimal API usage** — ~7,200 reads/month (Basic plan allows 10,000).

## Topics monitored

- Iran and Israel (attacks, military tensions)
- Iran and USA (sanctions, nuclear, war)
- Iran revolution and protests
- Reza Pahlavi, Khamenei, IRGC

## Install
=======
# Telegram Radar - رادار تلگرامی

بات مانیتورینگ که پست‌های ترند X (توییتر) درباره ایران/اسرائیل/آمریکا رو پیدا و به تلگرام ارسال می‌کنه.

**طراحی شده برای حداقل مصرف API** — فقط ~۷,۲۰۰ خوانش در ماه (پلن Basic اجازه ۱۰,۰۰۰ میده)

## موضوعات تحت نظر

- ایران و اسرائیل (حملات، درگیری نظامی)
- ایران و آمریکا (تحریم‌ها، هسته‌ای، جنگ)
- انقلاب ایران و اعتراضات
- رضا پهلوی، خامنه‌ای، سپاه

## نصب
>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390

```bash
cd telegram-radar
python -m venv .venv
<<<<<<< HEAD
source .venv/bin/activate   # macOS/Linux
=======
source .venv/bin/activate   # مک/لینوکس
>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390
pip install -r requirements.txt
cp .env.example .env
```

<<<<<<< HEAD
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
=======
## تنظیمات (.env)

### ۱. توکن X API
فقط `X_BEARER_TOKEN` لازمه (read-only، پست نمیذاره):
- برو به [developer.x.com](https://developer.x.com)
- Bearer Token رو کپی کن

### ۲. بات تلگرام
- توی تلگرام به `@BotFather` پیام بده
- `/newbot` بزن و مراحل رو طی کن
- توکن بات رو کپی کن → `TELEGRAM_BOT_TOKEN`

### ۳. Chat ID تلگرام
- بات رو به گروه یا کانال اضافه کن
- یا از `@userinfobot` برای گرفتن Chat ID استفاده کن
- Chat ID رو بذار → `TELEGRAM_CHAT_ID`

## اجرا

```bash
# اجرای مداوم (هر ۶۰ دقیقه چک می‌کنه)
python radar.py

# فقط یکبار اجرا
python radar.py --once

# تست بدون ارسال به تلگرام
python radar.py --dry-run

# تست یکبار بدون ارسال
python radar.py --once --dry-run
```

## هزینه API

| تنظیم | ریکوئست/روز | خوانش/ماه | وضعیت |
|--------|-------------|-----------|-------|
| هر ۶۰ دقیقه (پیشفرض) | ~۲۴ | ~۷,۲۰۰ | ✅ زیر سقف |
| هر ۱۲۰ دقیقه | ~۱۲ | ~۳,۶۰۰ | ✅ خیلی ارزان |
| هر ۳۰ دقیقه | ~۴۸ | ~۱۴,۴۰۰ | ⚠️ بالای سقف Basic |

> نکته: اگه بودجه API محدوده، `SEARCH_INTERVAL_MINUTES=120` بذار.

## اجرا روی سرور (۲۴/۷)

```bash
# با nohup
nohup python radar.py > /dev/null 2>&1 &

# یا با screen
screen -S radar
python radar.py
# Ctrl+A, D برای detach

# یا با systemd service
```

## فایل‌ها

| فایل | توضیح |
|------|-------|
| `radar.py` | اسکریپت اصلی |
| `.env` | تنظیمات (خصوصی) |
| `seen_tweets.json` | کش توییت‌های دیده شده (خودکار) |
| `stats.json` | آمار ارسال‌ها (خودکار) |
| `radar.log` | لاگ فعالیت‌ها |
>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390
