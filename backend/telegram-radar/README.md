# Telegram Radar - رادار تلگرامی

بات مانیتورینگ که:
1. پست‌های ترند X (توییتر) درباره ایران رو پیدا و به تلگرام ارسال می‌کنه
2. کمپین‌ها و پتیشن‌های **Javid Fighter** رو به کانال تلگرام پست می‌کنه (با عکس و دکمه inline)

هر کدوم از این دو منبع مستقل کار می‌کنه — می‌تونی فقط Javid Fighter یا فقط X یا هر دو رو فعال کنی.

## نصب

```bash
cd backend/telegram-radar
python -m venv .venv
source .venv/bin/activate   # مک/لینوکس
pip install -r requirements.txt
```

## کانفیگ

دو فایل env داریم:

| فایل | کاربرد | توضیح |
|------|--------|-------|
| `.env` | **پروداکشن (سرور)** | بات اصلی `@Iran_trend_X_post_Radar_bot` → کانال `@iran_post_x_trend` |
| `.env.local` | **لوکال (توسعه)** | بات تست جداگانه → کانال/گروه تست |

### راه‌اندازی لوکال (اولین بار)

1. توی تلگرام به `@BotFather` پیام بده
2. `/newbot` بزن و یک بات **تست** بساز (مثلا `MyRadarTestBot`)
3. توکنش رو کپی کن
4. یک کانال یا گروه تست بساز و بات رو ادمینش کن
5. فایل `.env.local` رو پر کن:

```env
TELEGRAM_BOT_TOKEN=توکن_بات_تست
TELEGRAM_CHAT_ID=@اسم_کانال_تست
```

6. اجرا:

```bash
python radar.py --env .env.local --once
```

### راه‌اندازی سرور (پروداکشن)

فایل `.env` از قبل تنظیم شده:

```env
TELEGRAM_BOT_TOKEN=توکن_بات_اصلی
TELEGRAM_CHAT_ID=@iran_post_x_trend
```

### متغیرهای محیطی

| متغیر | اجباری | پیش‌فرض | توضیح |
|-------|--------|---------|-------|
| `TELEGRAM_BOT_TOKEN` | بله | — | توکن بات تلگرام از `@BotFather` |
| `TELEGRAM_CHAT_ID` | بله | — | آیدی کانال (`@name`) یا گروه (`-123456`) |
| `JAVID_API_URL` | خیر | `https://api.javidfighter.com` | آدرس API جاوید فایتر |
| `JAVID_API_KEY` | خیر | — | کلید API جاوید فایتر |
| `JAVID_CHECK_INTERVAL_MINUTES` | خیر | `15` | فاصله چک کمپین‌ها (دقیقه) |
| `X_BEARER_TOKEN` | خیر | — | توکن X API (فقط read) |
| `SEARCH_INTERVAL_MINUTES` | خیر | `60` | فاصله جستجوی X (دقیقه) |
| `MIN_LIKES` | خیر | `100` | حداقل لایک برای فیلتر |
| `MIN_RETWEETS` | خیر | `20` | حداقل ریتوییت برای فیلتر |
| `MAX_RESULTS` | خیر | `10` | تعداد نتایج هر جستجو |

## اجرا

```bash
# لوکال — بات تست
python radar.py --env .env.local --once          # یکبار تست
python radar.py --env .env.local --once --dry-run # بدون ارسال
python radar.py --env .env.local                  # مداوم

# سرور — بات اصلی (پروداکشن)
python radar.py --once           # یکبار
python radar.py                  # مداوم (۲۴/۷)
python radar.py --once --dry-run # تست بدون ارسال
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

## ویژگی‌ها

- **دکمه‌های Inline**: هر پست دکمه مستقیم داره (📧 شرکت در کمپین / ✍️ امضای کارزار / 🔗 مشاهده در X)
- **ارسال عکس**: کمپین‌ها و پتیشن‌ها با عکس ارسال میشن (تک عکس یا آلبوم)
- **جلوگیری از تکرار**: آیتم‌های قبلاً ارسال شده دوباره فرستاده نمیشن
- **دو منبع مستقل**: X و Javid Fighter جداگانه کار می‌کنن

## فایل‌ها

| فایل | توضیح |
|------|-------|
| `radar.py` | اسکریپت اصلی |
| `.env` | تنظیمات پروداکشن (خصوصی — git ignore) |
| `.env.local` | تنظیمات لوکال/تست (خصوصی — git ignore) |
| `.env.example` | نمونه تنظیمات (عمومی) |
| `seen_tweets.json` | کش توییت‌های X دیده شده (خودکار) |
| `seen_javid.json` | کش آیتم‌های Javid Fighter ارسال شده (خودکار) |
| `stats.json` | آمار ارسال‌ها (خودکار) |
| `radar.log` | لاگ فعالیت‌ها |
