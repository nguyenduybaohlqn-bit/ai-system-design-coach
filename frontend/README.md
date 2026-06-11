# AI Chat — React + TypeScript

Giao diện chat AI giống ChatGPT/Claude, sử dụng **React 18 + TypeScript + Vite**.

## Cấu trúc thư mục

```
src/
├── types/
│   └── index.ts            # Kiểu Message, Chat
├── hooks/
│   └── useChat.ts          # Logic gọi Anthropic API, quản lý state chat
├── components/
│   ├── Icons.tsx           # Tất cả SVG icons
│   ├── ChatArea.tsx        # Vùng chat chính (header + messages + input)
│   ├── ChatArea.module.css
│   ├── MessageBubble.tsx   # Bubble tin nhắn user/AI
│   ├── MessageBubble.module.css
│   ├── Sidebar.tsx         # Sidebar phải (thu/mở, recent chats, account)
│   ├── Sidebar.module.css
│   ├── ThinkingDots.tsx    # Animation "đang trả lời..."
│   └── ThinkingDots.module.css
├── App.tsx                 # Root component, ghép ChatArea + Sidebar
├── App.css                 # Global styles
└── main.tsx                # Entry point
```

## Cài đặt & chạy

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

## Cấu hình API key

File `src/hooks/useChat.ts` gọi thẳng `https://api.anthropic.com/v1/messages`.
Anthropic API key được xử lý tự động bởi môi trường Claude Artifacts.

Nếu chạy **standalone** (ngoài Claude), tạo file `.env`:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Rồi sửa header trong `useChat.ts`:

```ts
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
},
```

> **Lưu ý:** Không hardcode API key trong code — dùng `.env` và thêm vào `.gitignore`.

## Tính năng

| Tính năng | Chi tiết |
|---|---|
| Sidebar thu/mở | CSS transition 260px ↔ 60px |
| Thu nhỏ | Chỉ hiện icon (New, Chats, Avatar) |
| Mở rộng | Recent chats + thời gian + active highlight |
| Gửi tin nhắn | Enter gửi, Shift+Enter xuống dòng |
| Textarea | Tự giãn theo nội dung, tối đa 180px |
| Thinking dots | Animation 3 chấm khi AI đang trả lời |
| Conversation history | Toàn bộ lịch sử được gửi kèm mỗi request |
| CSS Modules | Tránh xung đột class, dễ maintain |

## Mở rộng sau này

- Thêm `localStorage` để lưu lịch sử chat
- Streaming response (`ReadableStream`) thay vì chờ toàn bộ
- Dark mode toggle
- Markdown rendering cho AI response (dùng `react-markdown`)
- Nhiều conversation độc lập
