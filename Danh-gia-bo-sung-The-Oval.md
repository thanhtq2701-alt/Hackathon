# Đánh giá bổ sung The Oval

Ngày đánh giá: 21/10/2026. Phạm vi: đánh giá, không sửa mã nguồn sản phẩm và không lập lộ trình phát triển.

## Kết luận

The Oval có nền tảng trò chơi phân nhánh thực sự. Phần kiểm tra bổ sung cho thấy các đường đi trong tuyến Convergence có thể chạy đến kết thúc, nhưng dữ liệu hiển thị, luật tính toán và nội dung câu chuyện còn thiếu nhất quán. Vấn đề tổ chức code đã tác động đến hành vi người chơi nhìn thấy; đây không chỉ là chuyện một file có quá nhiều dòng.

Đánh giá này bổ sung cho phần nhận xét trước trong chat. Nó không thay thế kiểm thử trình duyệt toàn diện hoặc đánh giá trải nghiệm của người chơi thực tế.

## Nguồn và cách kiểm tra

- Bản `index.html` đã lấy từ GitHub ở lượt đánh giá trước; cây repository được trả về với SHA `c93146321dd359b07ad760b497f6019751e4a1e4`.
- Bản website đã được so sánh với bản GitHub: giống nhau sau khi bỏ khác biệt xuống dòng cuối file.
- Bản local `E:\ThanhTQ\Hackathon\EVE Frontier\2.html` khác ở luật yêu cầu lật tất cả thẻ trước khi chọn.
- Lượt bổ sung này dùng bản mã đã lưu, không xác nhận lại một triển khai mới có thể xuất hiện sau đó.
- Nạp JavaScript vào môi trường Node VM; dùng đối tượng DOM tối giản để kiểm tra luật và nội dung HTML được dựng. Không dùng kết quả này để kết luận bố cục, hiệu năng hay khả năng truy cập của trình duyệt.
- Các script kiểm tra và kết quả thô nằm trong thư mục `work` của chat. Không chỉnh sửa các file dự án ở ổ E, repository hay website.

## 1. Con số hậu quả hiển thị khác con số thực sự áp dụng

**Mức ảnh hưởng: cao đối với khả năng hiểu và tin vào luật chơi. Đã tái hiện ở cấp hàm.**

Ví dụ A, tuyến Convergence, màn đầu, lựa chọn `Reject Defiantly`:

| Chỉ số | Hiển thị | Thay đổi thực tế khi bắt đầu từ 50 |
|---|---:|---:|
| Public Approval | +15 | +37,5 |
| International Tension | +18 | +45 |
| State Control | +12 | +30 |

`outcomeLines()` lấy các delta từ lựa chọn, trong khi `applyDeltas()` áp dụng hệ số 2,5 ở một số màn Convergence. Đây là tình huống kiểm tra được đặt trực tiếp tại màn đầu để tách ảnh hưởng của phép nhân khỏi giới hạn 0–100; không phải tuyên bố về trạng thái tự nhiên khi người chơi kích hoạt tuyến này.

Ví dụ B, tuyến The Permanent Record, lựa chọn `The "Humble Servant" Speech.`: giao diện được dựng với Approval +18, nhưng Approval từ 50 chỉ tăng lên 59. Nguyên nhân là `applyDeltas()` giới hạn delta chỉ số chính trong khoảng −9 đến +9 ngoài Convergence, còn phần hiển thị vẫn dùng +18.

Hai ví dụ cho thấy sai lệch tồn tại theo cả hai chiều: tăng nhiều hơn và tăng ít hơn số được báo. Các tình huống kiểm tra đều tránh chạm trần Approval, nên sai lệch không thể chỉ giải thích bằng giới hạn tối đa 100.

Tham chiếu: [outcomeLines](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L9897), [applyDeltas](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L10323).

## 2. Nhánh hòa bình dựng sai tiêu đề kết thúc

**Mức ảnh hưởng: trung bình; làm yếu phần kết thúc và nhận diện thành tựu. Đã tái hiện bằng HTML sinh ra.**

Ở `The Final Ultimatum`, khi Tension = 49, lựa chọn duy nhất là `The Peacemaker Ending.`. Tuy nhiên, tiêu đề kết thúc được dựng thành:

> You have successfully cooled the fires of global war

Hàm `showEndScreen()` kiểm tra có `outcome` trước, rồi lấy câu đầu của outcome làm tên ending. Nhánh xử lý riêng theo `text === 'The Peacemaker Ending.'` nằm sau `else if`, nên không chạy với lựa chọn này vì nó đã có outcome.

Đã kiểm tra Tension 49, 50, 51 kết hợp Approval 49, 50, 51. Các nhánh WAGE WAR/STAY PEACEFUL ở Tension 50–51 dựng được các tên Warmonger, Peacemaker, Impeached và Pacifist theo dữ liệu. Lỗi nêu trên thuộc nhánh Tension dưới 50, không phải mọi kết thúc hòa bình.

Tham chiếu: [Final Ultimatum](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L8454), [showEndScreen](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L10638).

## 3. Lựa chọn từ chức vẫn tiếp tục điều hành

**Mức ảnh hưởng: cao đối với tính nhất quán giữa câu chuyện và hành động. Đã tái hiện ở cấp luật chơi.**

Trong The Revolution, tại act index 6, chọn `Resign in the fallout`. Nội dung nói người chơi rời chức vụ, nhưng `nextAct: 999` chỉ đóng tuyến truyện. `advanceArc()` sau đó gọi `advanceTurn()`.

Trong tình huống kiểm tra ở lượt 10, kết quả là:

- Lượt chuyển thành 11.
- Tuyến Revolution được đánh dấu hoàn tất.
- Không gọi màn kết thúc.
- Một thẻ quản trị thông thường tiếp tục được dựng.

Về kỹ thuật, hành vi đóng arc là nhất quán với hàm hiện tại. Về trải nghiệm, “rời chức vụ” không được phản ánh trong việc người chơi tiếp tục giữ vai trò điều hành. Đây là mâu thuẫn nội dung–cơ chế, không phải lỗi cú pháp.

Tham chiếu: [lựa chọn từ chức](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L9200), [advanceArc](https://github.com/thanhtq2701-alt/Hackathon/blob/c93146321dd359b07ad760b497f6019751e4a1e4/index.html#L10293).

## 4. Kiểm tra khủng hoảng trong Revolution không nằm trên luồng lựa chọn thông thường của arc

**Mức ảnh hưởng: đáng chú ý; cần phân biệt hành vi đã xác định và ý đồ thiết kế chưa biết.**

`checkFailSafes()` có nhánh xử lý impeachment khi `activeArc` là Revolution. Nhưng luồng chọn thẻ trong arc gọi `advanceArc()`, không gọi `checkFailSafes()` sau mỗi lựa chọn. Khi arc kết thúc, `activeArc` được đặt thành null trước khi `advanceTurn()` gọi kiểm tra khủng hoảng.

Đã đặt Approval = 0 ở màn cuối một nhánh Revolution rồi hoàn tất arc: Approval được cứu về 50, không bật `impeached`, và ván tiếp tục.

Điều này cho thấy phần bảo vệ đặc biệt viết cho Revolution không phát huy trong đường đi đã kiểm tra. Chưa có tài liệu thiết kế đủ rõ để kết luận mọi khủng hoảng trong arc bắt buộc phải kết thúc ván. Cũng không được kết luận ending Impeached hoàn toàn không thể đạt: lựa chọn WAGE WAR trong Convergence có callback riêng bật cờ này, và kiểm tra ma trận đã xác nhận nó hoạt động.

## 5. Những kiểm tra có kết quả tích cực

Ở cấp liên kết dữ liệu, 70 nút truyện của bốn arc đều có đường dẫn từ điểm đầu tương ứng trong phép duyệt cấu trúc. Không thấy vòng lặp trong đồ thị đã duyệt. Việc này không đồng nghĩa mọi arc đều dễ kích hoạt trong một ván thật.

Đã duyệt toàn bộ đường lựa chọn trong Convergence từ trạng thái đầu vào cụ thể:

| Approval | Tension | Economy | Authority | Loyalty | Energy |
|---:|---:|---:|---:|---:|---:|
| 50 | 100 | 70 | 50 | 60 | 100 |

Kiểm tra gọi luật `applyDeltas()`, callback `onSelect` nếu có, và `advanceArc()`; quan sát kết quả dựng bởi `showEndScreen()`. Phần hiển thị từng màn và âm thanh được thay bằng hàm rỗng.

Kết quả có 434 đường lựa chọn đến kết thúc, tất cả qua 5 quyết định trong arc, không phát sinh ngoại lệ JavaScript trong phép kiểm tra này:

| Tiêu đề được dựng | Số đường |
|---|---:|
| The Warmonger | 136 |
| The Peacemaker | 136 |
| The Impeached | 42 |
| The Pacifist | 42 |
| Câu mô tả hòa bình bị dùng làm tiêu đề | 78 |

**Các số này là số đường đi từ một trạng thái cố định, không phải tỷ lệ người chơi nhận ending, không phải 434 ván chơi trình duyệt, và không chứng minh độ cân bằng.**

Điểm tốt là hệ thống phân nhánh có thể thực thi đến điểm kết thúc; các ending động không chỉ là những tên được liệt kê trong Archives.

## 6. Tổng hợp cùng phát hiện của lượt đánh giá trước

| Phát hiện | Căn cứ | Phạm vi |
|---|---|---|
| Năng lượng từ 0 được cộng lên 1 trước kiểm tra kết thúc | Kiểm tra hàm | Bản GitHub và local đã xem |
| Năng lượng có thể lên 101 | Quan sát website và kiểm tra hàm | Bản đã xem |
| Lật hết thẻ xung đột với khóa thao tác chuột trên hai thẻ | Đọc code và kiểm tra nhánh | Chỉ luật thêm trong bản local |
| Nội dung kết quả bị cắt trong khung hẹp | Quan sát trực tiếp trình duyệt | Khung hiển thị đã thử, chưa phải mọi thiết bị |
| “Lease to Allies” nói Economy giảm nhưng dữ liệu là +6 | Dữ liệu tình huống | Cả hai bản |
| Thông báo ví/NFT diễn đạt như thật trong khi logic là mock | Code và README | Cả hai bản |
| Chủ đề vũ trụ không nhất quán với nội dung chính trị Trái Đất | Nội dung game và README | Nhận xét thiết kế |
| Con số hậu quả không phản ánh hệ số nhân/giới hạn delta | Kiểm tra bổ sung | Luật chung của hai bản |
| Tiêu đề kết thúc hòa bình bị lấy từ câu mô tả | Kiểm tra bổ sung | Luật chung của hai bản |
| Từ chức trong Revolution vẫn tiếp tục điều hành | Kiểm tra bổ sung | Luật chung của hai bản |

## 7. Ý nghĩa đối với việc đánh giá cấu trúc code

Tổ chức lại code có căn cứ về độ tin cậy: cùng một hậu quả được biểu diễn ở dữ liệu, phép tính, văn bản và màn kết thúc, nhưng các phần chưa dùng chung một kết quả đã được xác định rõ. Những khác biệt đó hiện đã gây hành vi sai hoặc khó hiểu.

Điều này không chứng minh rằng chỉ chia file sẽ cải thiện tốc độ chạy. Chưa có phép đo tải trang, FPS, bộ nhớ hay thiết bị yếu trong lượt đánh giá này.

Về portfolio, bằng chứng mạnh nhất vẫn là một prototype đã có nội dung, trạng thái và phân nhánh thực thi được. Bằng chứng còn yếu là chất lượng kiểm thử toàn diện, độ nhất quán của mô hình và đóng góp riêng của từng thành viên. Tài liệu hiện có chưa đủ để quy toàn bộ sản phẩm cho một cá nhân hoặc kết luận về tác động tới người dùng.

## Giới hạn còn lại

Chưa hoàn tất kiểm thử giao diện mọi tuyến, mọi kích thước màn hình và điều khiển bàn phím; chưa kiểm tra âm thanh toàn bộ video; chưa có dữ liệu playtest để đánh giá cân bằng, mức độ thú vị sau nhiều ván hoặc khả năng người mới hiểu luật. Không đưa ra xác suất tuyển sinh hay suy đoán về cách hội đồng một trường cụ thể sẽ chấm dự án.

