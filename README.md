# MailCatcher API

Chỉ nhận email → lưu tạm 30 phút → API xem.

## API

- `GET /api/mails` → danh sách email
- `GET /api/mails/:id` → chi tiết
- Header: `x-api-key: your_key`

## Cấu hình domain

```env
ALLOWED_DOMAINS=example.com,mydomain.com