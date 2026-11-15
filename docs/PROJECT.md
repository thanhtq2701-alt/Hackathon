# The Oval & Fleet Council — Hồ sơ dự án

Tài liệu sống duy nhất của dự án: quyết định đã chốt, trạng thái, lịch sử, việc còn mở và lộ trình.
Cập nhật lần cuối: 15/11/2026. Tài liệu cũ (tháng 10/2026) nằm trong `old/` — xem mục 8.

---

## 1. Sản phẩm

- **Tên game:** The Oval (giữ tên này).
- **Ý tưởng gốc:** người chơi đóng vai nhà du hành vũ trụ, ra quyết định cho sự sinh tồn của quốc gia mình. Mỗi lựa chọn phản ánh tính cách người chơi; cuối ván người chơi nhận một "biệt danh" (ending/profile) như Người bảo vệ, Nhà đầu tư tài ba… Họ muốn chơi vì được toàn quyền định đoạt vận mệnh quốc gia.
- **Hai chế độ:**
  - **The Oval** (`/`) — chơi đơn, 40 lượt, thẻ quyết định + tuyến truyện + 12 màn kết thúc.
  - **Fleet Council** (`/world.html`) — chơi nhóm online: mỗi team là một world (1–4 người, 2–4 world), bỏ phiếu 3–4 lá, xây hành tinh, thu hoạch, thẻ đặc biệt, raid, viện trợ, xếp hạng.
- **Người chơi mục tiêu:** bạn bè là học sinh Việt Nam, chưa biết gì về game → cần lời giới thiệu ban đầu. Phổ biến song song tiếng Việt và tiếng Anh (giao diện hiện là tiếng Anh).
- **Nền tảng:** máy tính và điện thoại, qua trình duyệt web.
- **Mục tiêu bản đầu:** prototype chơi đơn hoàn chỉnh + chơi online theo team; mọi tính năng trong bản phác thảo đều chạy được.
- **Bối cảnh dùng cho hồ sơ:** dự án có thể dùng trong portfolio (du học) — mô tả phải trung thực: tính năng nào là thật, cái nào là demo (ví/NFT Sui là demo, đã gắn nhãn).

## 2. Quyết định đã chốt

| Chủ đề | Quyết định |
|---|---|
| Ghi chú viết tay gốc | Bắt đầu 50 điểm (mọi chỉ số 50, 50 vàng, 50 quặng, 3 tàu); chiến đấu + tương tác online; 3–4 lá mỗi poll; mỗi team là một world; chỉ số các lá gần bằng nhau; minh họa tàu/thế giới; tự xây quốc gia; thu hoạch (kho đồ, EXP, vàng, thẻ đặc biệt); ranking từng người — **đã làm đủ** |
| Chi tiêu chung | Mọi thứ tiêu tài nguyên chung (xây, đặt tàu, viện trợ, raid) là **kế hoạch đội**: Yes > No và ít nhất nửa đội đồng ý; im lặng không chặn |
| Hòa phiếu | Hòa tuyệt đối → lấy **trung bình hiệu ứng** các lá hòa; lệch (3–1) → theo số đông |
| Công bằng đội lớn/nhỏ | Mỗi world cùng số thẻ và cùng lượt dùng thẻ; đội nhỏ +2% sản xuất mỗi người thiếu; mục tiêu đội 4 vs đội 1 ≈ 51–52% (đạt 51%) |
| Thời gian | Bỏ phiếu 45 giây (30/45/75), báo cáo 12 giây |
| Từ chức (The Oval) | "Offer your resignation": Approval < 50 → dân chấp nhận, ván kết thúc (The Resignation); ≥ 50 → ở lại |
| Phế truất trong cách mạng | Approval ≤ 0 hoặc Economy ≤ 10 trong tuyến Revolution → The Impeached |
| Chấm dứt nhiệm kỳ | Nghĩa là **ván kết thúc** (chưa có cơ chế kế nhiệm) |
| Tài khoản | PIN 4–8 số (tùy chọn) giữ tên; chỉ pilot có PIN được xếp hạng mọi thời đại |
| Dữ liệu người chơi (chốt 15/11/2026) | Chỉ lưu tối thiểu: tên + PIN đã băm + xếp hạng (pilot có PIN), phòng đang chơi, **số đếm ẩn danh** (không tên/ID/IP) và **góp ý ẩn danh** (giữ 200 tin mới nhất). Trang `feedback.html#privacy` liệt kê mọi thứ được lưu; xóa dữ liệu khi có yêu cầu (chủ dự án xóa tay). Để sau: lịch sử trận/hồ sơ gắn tài khoản chỉ cho pilot có PIN, kèm nút xóa. Không làm: lưu email/số điện thoại/Zalo, công cụ phân tích bên thứ ba (Google Analytics…). Khôi phục PIN bằng **mã khôi phục một lần** hiện khi đăng ký (không cần dữ liệu cá nhân). Ghi hình playtest chỉ khi đã hỏi và được đồng ý. Thêm dữ liệu mới → cập nhật trang `feedback.html#privacy` |
| Hạ tầng | Miễn phí: Render Web Service (free) + Upstash Redis (free); không mua tên miền |
| Quy trình | Làm trên branch, commit; **hỏi chủ dự án trước mỗi lần push**; chỉ merge khi chủ dự án xác nhận. Đợt cân bằng sau dùng branch `balance_1`, `balance_2`… (chỉ khi được yêu cầu). `main` được bảo vệ (cấm xóa, cấm force push) |

## 3. Trạng thái hiện tại

- **Live:** https://fleet-council.onrender.com — `/` The Oval, `/world.html` Fleet Council (online + luyện tập với bot). Free tier: ngủ sau 15 phút không ai vào (lần mở đầu chờ 30–60 giây).
- **Lưu trữ:** Upstash Redis (Singapore) — phòng chơi lưu mỗi 15 giây và khi server tắt; tài khoản và bảng xếp hạng lưu vĩnh viễn; số đếm ẩn danh (`stats`) và góp ý (`feedback`) ghi cùng lượt lưu phòng, chỉ khi có thay đổi.
- **Góp ý & thống kê:** trang `/feedback.html` (link từ cả hai chế độ) — gửi góp ý ẩn danh + mục "What this game stores". Số đếm xem ở `/api/stats`; góp ý đọc trong Upstash (key `fc:feedback`) hoặc `var/feedback.json` khi chạy local. The Oval đếm số ván bắt đầu/kết thúc, màn kết thúc, lượt kết thúc, thời lượng; Fleet Council đếm trận bắt đầu/kết thúc, số world, số lượt, số người thật, thời lượng (chỉ trận online). Trận bỏ dở = bắt đầu − kết thúc.
- **Kiểm thử:** 32 test (`tools\run-checks.cmd`): 7 cho The Oval, 25 cho Fleet Council và server.
- **Công cụ mô phỏng** (`tools/sim/`, chạy lại sau mỗi lần đổi số cân bằng; có seed nên cùng lệnh cho cùng kết quả):
  - `node tools/sim/fleet.js` — Fleet Council bot đấu bot bằng chính bot và luật của phòng thật; kịch bản `4v1`, `2v2`, `3w` (`--scenario`, `--matches`, `--turns`, `--seed`).
  - `node tools/sim/oval.js` — chạy chính mã The Oval trong Node (DOM giả, Math.random có seed), bấm chọn thẻ như người chơi; chiến thuật `random`, `balanced`, `approval` (`--strategy`, `--games`, `--seed`).
  - `tools\run-checks.cmd` chạy thử nhanh cả hai để công cụ không bị hỏng khi mã game đổi.
- **Cân bằng đã đo** (đo lại bằng `tools/sim/` ngày 15/11/2026, seed 1):
  - Fleet Council (10 lượt): đội 4 vs 1 = 51,0% (3.000 trận, đổi bên luân phiên); 2v2 (1.000 trận) 1,8 raid/trận, 86,5% trận có raid, bên tấn công thắng 62%, vị trí world 50,7 / 49,3%; Command Core cuối trận trung bình Lv2,2 (Lv2 ~81%, Lv3 ~18%); 35% poll là khủng hoảng; không vòng vote nào phải chờ hết giờ. 3 world 1 người (2.500 trận): 32,9 / 35,5 / 31,6% — Nova Kepler cao hơn ~2 điểm, cần theo dõi.
  - The Oval: chơi ngẫu nhiên (1.000 ván) đủ 12/12 màn kết thúc (thêm The Lazarus Protocol 0,3% khi Energy cạn), cao nhất The Tyrant 25,6% / The Neutral 25,3%; The Resignation hiếm (0,1%); Revolution 19%, Convergence 9%; 33,5% ván kết thúc trước lượt 40. Chơi cân bằng (100 ván) → The Statesman 97%. Spam Approval (100 ván) → bị đảng phế truất 83%.
- **Thời gian chơi ước tính:** The Oval 14–21 phút/ván đủ 40 lượt; Fleet Council 5–10 phút/trận 10 lượt.

## 4. Lịch sử thay đổi (Pull Request)

| PR | Nội dung |
|---|---|
| #1 | Tạo Fleet Council; sửa 4 lỗi The Oval (số hiển thị ≠ số áp dụng, cộng Energy hai lần, Energy 0→1, tiêu đề Peacemaker) |
| #2 | Tinh chỉnh giao diện (font, mobile, nhãn demo ví/NFT); thêm `CLAUDE.md` |
| #3 | Link chơi online từ trang tĩnh; README hướng dẫn deploy |
| #4 | Xây công trình cần cả đội bỏ phiếu |
| #5 | Lưu phòng + tài khoản PIN qua Upstash; `/healthz` |
| #6 | Gom về một deployment duy nhất |
| #7 | Sửa 3 lỗi tuyến truyện The Oval (từ chức, phế truất trong cách mạng, câu "Lease to Allies") |
| #8 | Đặt tàu và viện trợ cần cả đội bỏ phiếu |
| #9 | Đợt cân bằng lớn cho Fleet Council và The Oval |
| #10 | Gom tài liệu vào `docs/PROJECT.md`, lưu trữ tài liệu cũ vào `old/` |
| #11 | Công cụ mô phỏng cân bằng có seed cho cả hai chế độ (`tools/sim/`); đo lại số cân bằng |
| #12 | Số đếm ẩn danh, trang góp ý `feedback.html` + mục "What this game stores"; chốt quyết định dữ liệu người chơi |

## 5. Lỗi trong tài liệu cũ — đối chiếu

Mười lỗi trong `old/THE-OVAL-LOI-HE-THONG-VA-CHU-TRINH-KHAC-PHUC.txt` và `old/Danh-gia-bo-sung-The-Oval.md` đều đã xử lý:

| Lỗi | Đã xử lý ở |
|---|---|
| Energy về 0 được hồi +1 trước khi kiểm tra; Energy vượt 100 | PR #1 |
| Số hiển thị khác số thực sự áp dụng | PR #1 |
| Hàm tạo câu giải thích áp hiệu ứng lần hai | PR #1 |
| Tiêu đề kết thúc Peacemaker sai | PR #1 |
| Chữ trên thẻ bị cắt ở màn hình hẹp | PR #2 |
| Thông báo ví/NFT giống giao dịch thật | PR #2 |
| Từ chức vẫn điều hành tiếp | PR #7 (đề nghị từ chức, dân quyết định) |
| Kiểm tra khủng hoảng không chạy trong Revolution | PR #7 |
| "Lease to Allies" mô tả ngược số liệu | PR #7 |
| Bộ test chưa bảo vệ các lỗi đã biết | PR #1–#9 (31 test) |

## 6. Câu hỏi còn mở

1. **Mục tiêu chính:** chơi giải trí với bạn bè, nộp dự thi, hay portfolio? → quyết định ưu tiên tính năng mới hay độ hoàn thiện.
2. **Cơ chế kế nhiệm** cho The Oval (người khác lên thay khi hết nhiệm kỳ rồi chơi tiếp) — làm hay không?
3. **Ngôn ngữ giao diện:** thêm tiếng Việt song song tiếng Anh khi nào?
4. **Web3 / Sui:** giữ demo, bỏ, hay tích hợp thật sau này?
5. **Ngân sách:** giữ hoàn toàn miễn phí, hay chấp nhận ~7 USD/tháng để server không ngủ khi có người chơi đều?
6. **Playtest:** ai chơi thử, bao nhiêu nhóm, khi nào; có ghi hình không (cần người chơi đồng ý).
7. **Thành viên nhóm Auraa** và đóng góp của từng người (cần nếu dùng cho portfolio).

## 7. Lộ trình phát triển

**Nguyên tắc:** đến nay mọi cân bằng dựa trên bot/mô phỏng — ưu tiên số 1 là kiểm chứng với người thật trước khi thêm tính năng.

**Giai đoạn 0 — Nền móng (~1 tuần)**
- ~~Đưa công cụ mô phỏng bot vào repo (`tools/sim/`)~~ — đã làm (xem mục 3).
- GitHub Actions tự chạy test khi mở PR.
- ~~Nút "Góp ý" trong game + thống kê ẩn danh lưu dạng số đếm trong Upstash~~ — đã làm (xem mục 3).
- Theo dõi giới hạn Upstash và Render free.

**Giai đoạn 1 — Playtest & người mới (2–3 tuần)**
- 3–5 nhóm bạn chơi thử: đo thời gian thật, chỗ khó hiểu, có muốn chơi lại không, trận 1v4 có thấy công bằng không.
- Hướng dẫn trận đầu tiên (bỏ phiếu, harvest, đề xuất xây, raid).
- Giao diện tiếng Việt.
- Tóm tắt sau trận: quyết định bước ngoặt, trận raid lớn, ai đóng góp gì; thẻ chia sẻ.
- Cân bằng lại theo dữ liệu thật (branch `balance_1`).

**Giai đoạn 2 — Chiều sâu nội dung (1–2 tháng)**
- Fleet Council: vai trò cho từng pilot (không thêm phiếu); thêm tình huống/khủng hoảng (hiện 31); công trình Lv4–5; ngoại giao có cấu trúc (trao đổi, liên minh).
- The Oval: đồng bộ bối cảnh vũ trụ (nhiều thẻ vẫn là chính trị Trái Đất); cơ chế kế nhiệm (nếu chốt); chọn độ dài ván 20/30/40.
- Kết nối hai chế độ: kết quả The Oval mở khóa danh hiệu/giao diện trong hồ sơ pilot.

**Giai đoạn 3 — Cộng đồng (khi có người chơi đều)**
- Mùa xếp hạng; lịch sử trận và hồ sơ pilot (chỉ pilot có PIN, có nút xóa — xem quyết định "Dữ liệu người chơi").
- Chat tự do chỉ khi có công cụ chặn/báo cáo.
- Khôi phục PIN bằng mã khôi phục một lần (không lưu email/số điện thoại) và trang quản trị nhỏ.
- PWA, tối ưu điện thoại.

**Giai đoạn 4 — Mở rộng (khi cần)**
- Nâng gói Render nếu đông người.
- Web3/Sui thật chỉ khi có lợi ích rõ cho người chơi; không bắt buộc ví để chơi.
- Nếu kiếm tiền: chỉ đồ trang trí, không bán sức mạnh.

## 8. Thư mục `old/` (lưu trữ, không chỉnh sửa)

| File | Nội dung | Còn dùng để |
|---|---|---|
| `old/THE-OVAL-Ho-so-dinh-huong-va-phat-trien-game-vu-tru.txt` | Hồ sơ đánh giá + định hướng + kế hoạch 14 mốc deploy (26/10/2026) | Tham khảo thiết kế dài hạn (tài nguyên, chiến đấu, ngoại giao, kiến trúc) |
| `old/PROMPT-BAN-GIAO-COPILOT-THE-OVAL-VA-LOI-NHAN.txt` | Prompt bàn giao cho Copilot, toàn văn kế hoạch, **lời nhắn cá nhân gửi Thanh** (phần C) | Đọc lại lời nhắn; nguyên tắc làm việc |
| `old/THE-OVAL-THONG-TIN-CAN-XAC-NHAN.txt` | Biểu mẫu chốt yêu cầu (đã điền mục 1.1–1.6) | Các câu chưa trả lời → đã chuyển thành mục 6 ở trên |
| `old/THE-OVAL-LOI-HE-THONG-VA-CHU-TRINH-KHAC-PHUC.txt` | 10 lỗi + quy trình sửa từng lỗi (27/10/2026) | Đã xử lý hết — xem mục 5 |
| `old/Danh-gia-bo-sung-The-Oval.md` | Đánh giá bổ sung lỗi (21/10/2026) | Đã xử lý hết |
| `old/copilot_instructions_uiux.md.txt` | Hướng dẫn UI/UX cho Copilot | Tham khảo khi làm lại giao diện |
| `old/hackathon/Hackathon Script.docx`, `Slide.pdf` | Bài nộp hackathon gốc (kịch bản + slide) | Hồ sơ / portfolio |
