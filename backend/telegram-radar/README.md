# Telegram Radar - رادار تلگرامی

بات مانیتورینگ که:
1. پست‌های ترند X (توییتر) درباره ایران رو پیدا و به تلگرام ارسال می‌کنه
2. کمپین‌ها و پتیشن‌های **Javid Fighter** رو به کانال تلگرام پست می‌کنه (با عکس)

هر کدوم از این دو منبع مستقل کار می‌کنه — می‌تونی فقط Javid Fighter یا فقط X یا هر دو رو فعال کنی.

## نصب

```bash
cd telegram-radar
python -m venv .venv
source .venv/bin/activate   # مک/لینوکس
pip install -r requirements.txt
cp .env.example .env
```

## تنظیمات (.env)

### ۱. بات تلگرام (اجباری)
- توی تلگرام به `@BotFather` پیام بده
- `/newbot` بزن و مراحل رو طی کن
- توکن بات رو کپی کن → `TELEGRAM_BOT_TOKEN`
- بات رو ادمین کانال کن → `TELEGRAM_CHAT_ID=@channel_username`

### ۲. Javid Fighter API (اختیاری)
- `JAVID_API_URL` و `JAVID_API_KEY` رو از تیم بگیر
- هر ۱۵ دقیقه چک می‌کنه (قابل تنظیم: `JAVID_CHECK_INTERVAL_MINUTES`)
- کمپین‌ها و پتیشن‌های جدید رو با عکس به کانال می‌فرسته
- دفعه اول همه رو ارسال می‌کنه، بعد فقط جدیدها

### ۳. توکن X API (اختیاری)
فقط `X_BEARER_TOKEN` لازمه (read-only):
- برو به [developer.x.com](https://developer.x.com)
- Bearer Token رو کپی کن

## اجرا

```bash
# اجرای مداوم
python radar.py

# فقط یکبار اجرا (همه منابع رو یکبار چک می‌کنه)
python radar.py --once

# تست بدون ارسال به تلگرام
python radar.py --dry-run

# تست یکبار بدون ارسال
python radar.py --once --dry-run
```

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
| `seen_tweets.json` | کش توییت‌های X دیده شده (خودکار) |
| `seen_javid.json` | کش آیتم‌های Javid Fighter ارسال شده (خودکار) |
| `stats.json` | آمار ارسال‌ها (خودکار) |
| `radar.log` | لاگ فعالیت‌ها |
