# Playtest Fleet Council — 17/11/2026

Khoảng 10 bạn trong lớp, chế độ nhiều người chơi (Fleet Council), khoảng 30 phút, **không ghi hình**.
Mục tiêu: xem người mới có hiểu luật không, một trận dài bao lâu, có muốn chơi lại không, đội đông/ít có thấy công bằng không.

## Trước buổi chơi

- [ ] Hôm trước: xem dashboard Upstash (số lệnh đã dùng so với giới hạn) và mở thử game trên điện thoại của mình.
- [ ] **1 phút trước khi bắt đầu**, mở https://fleet-council.onrender.com/world.html để Render thức dậy (lần mở đầu chờ 30–60 giây).
- [ ] Mở https://fleet-council.onrender.com/api/stats, chụp hoặc chép lại số (số **trước**).
- [ ] Chuẩn bị link mời: tạo phòng → "Sao chép link mời" → gửi vào nhóm chat lớp.

Dặn người chơi: game mặc định tiếng Việt; **PIN không bắt buộc**. Ai đặt PIN thì phải nhớ, vì chưa có cách lấy lại PIN (5 lần sai bị khóa 10 phút).

## Chia phòng và lịch (≈ 30 phút)

Hai phòng, mỗi phòng 5 người, mỗi phòng 2 thế giới. Mỗi phòng có một chủ phòng (người tạo phòng) chỉnh cài đặt và bấm "Bắt đầu trận".

| Thời gian | Phòng A | Phòng B | Cài đặt |
|---|---|---|---|
| 0–3 phút | Vào phòng qua link, chọn thế giới | như phòng A | |
| 3–12 phút | Trận 1: đội 3 vs đội 2 | Trận 1: đội 4 vs đội 1 | 6 lượt, bỏ phiếu 75 giây (người mới cần đọc gợi ý) |
| 12–22 phút | Trận 2: đổi đội (4 vs 1) | Trận 2: đổi đội (3 vs 2) | 10 lượt, bỏ phiếu 45 giây |
| 22–30 phút | Hỏi sau khi chơi + gửi góp ý | | |

- Cuối trận 1, chủ phòng bấm "Về phòng chờ với đội này"; mọi người bấm "Vào thế giới này" để đổi đội.
- Không đủ người thì chủ phòng bấm "+ Bot" (bot có nhãn BOT).
- Người tổ chức không giải thích luật trước. Chỉ trả lời khi có người hỏi, và ghi lại câu hỏi đó.

## Ghi chép trong lúc chơi

Không ghi tên thật: dùng "Phòng A, người 1…". Mỗi lần ai đó khựng lại, hỏi, hay phàn nàn, ghi một dòng:

| Phút | Phòng / người | Màn hình | Chuyện gì xảy ra |
|---|---|---|---|
| | | | |

Để ý thêm: có ai không thấy ô bỏ phiếu kế hoạch đội (xây, đóng tàu, đột kích, viện trợ) không; có ai bỏ gợi ý ngay không; trận 1 và trận 2 thực tế dài bao lâu.

## Hỏi sau khi chơi (5 phút)

Hỏi miệng cả nhóm:

1. Lần đầu vào game, chỗ nào khó hiểu nhất?
2. Gợi ý trong trận có giúp không, hay bị làm phiền?
3. Trong đội bạn, ai quyết định chính? Bạn có thấy lá phiếu của mình có ý nghĩa không?
4. Đội ít người (1 hoặc 2 người) có thấy bị thiệt không? Đội đông có thấy khó thống nhất không?
5. Đột kích: có ai đột kích không, vì sao có / vì sao không? Có thấy quá mạnh hay quá yếu không?
6. Một trận dài vừa, quá ngắn hay quá dài?
7. Nếu có link, tuần sau bạn có tự mở ra chơi lại không? Chấm 1–5.

Sau đó nhờ mọi người mở https://fleet-council.onrender.com/feedback.html và gửi góp ý ẩn danh (chọn "Fleet Council (chơi đội)").

## Sau buổi chơi

- [ ] Mở lại `/api/stats`, ghi số **sau**. Hiệu số giữa sau và trước là số liệu của buổi chơi:
  - `fleet.started` / `fleet.finished`: số trận bắt đầu / chơi hết (bỏ dở = bắt đầu − hết).
  - `fleet.worlds.N`, `fleet.turns.N`, `fleet.humans.N`: số thế giới, số lượt, số người thật mỗi trận.
  - `fleet.minutes.X`: trận dài bao nhiêu phút (`0-5`, `5-10`, `10-20`…).
- [ ] Đọc góp ý trong Upstash (key `fc:feedback`).
- [ ] Gửi Claude: số trước/sau, bảng ghi chép và câu trả lời. Claude sẽ so với số đo bằng bot rồi đề xuất `balance_multi_1` (và `balance_solo_2` nếu cần) để bạn duyệt trước khi sửa.

## Sự cố thường gặp

| Sự cố | Cách xử lý |
|---|---|
| Trang trắng hoặc quay lâu | Render đang thức dậy, chờ 30–60 giây rồi tải lại |
| Một người bị rớt mạng | Mở lại **đúng tab cũ**, nhập lại mã phòng 4 chữ để vào lại chỗ của mình |
| Server khởi động lại giữa trận | Phòng được lưu mỗi 15 giây, vào lại bằng mã phòng là chơi tiếp |
| Quên PIN | Chưa lấy lại được: chơi tên khác hoặc chơi không PIN |
