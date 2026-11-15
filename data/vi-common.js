// Vietnamese for text shared by every page: links, the language switch, the feedback page and its
// "What this game stores" section, plus patterns for decorated text (bullets, quotes, icons).
(function (root) {
  const I = root.TheOvalI18n;
  if (!I) return;

  I.add({
    // Links and page titles
    'Feedback': 'Góp ý',
    'What this game stores': 'Game lưu những gì',
    'Solo story': 'Chơi đơn',
    'Feedback · The Oval': 'Góp ý · The Oval',
    'Language': 'Ngôn ngữ',

    // Feedback page
    'Something confusing, unfair, broken or fun? Tell us. Every message is read.': 'Có gì khó hiểu, bất công, bị lỗi hay thú vị? Hãy kể cho chúng mình. Góp ý nào cũng được đọc.',
    'About': 'Về',
    'Fleet Council (team mode)': 'Fleet Council (chơi đội)',
    'Something else': 'Việc khác',
    'Message': 'Nội dung',
    'What happened, and what did you expect?': 'Chuyện gì đã xảy ra, và bạn mong điều gì?',
    "Feedback is anonymous. Please don't write your real name, phone number, email or other personal details.": 'Góp ý là ẩn danh. Đừng ghi tên thật, số điện thoại, email hay thông tin cá nhân khác.',
    'Send feedback': 'Gửi góp ý',
    'Thank you! Your message was sent.': 'Cảm ơn bạn! Góp ý đã được gửi.',
    'Write a message first.': 'Hãy viết nội dung trước đã.',
    'Thanks! Please wait a moment before sending another message.': 'Cảm ơn bạn! Chờ một chút rồi hãy gửi góp ý tiếp nhé.',

    // What this game stores
    'Pilot accounts': 'Tài khoản pilot',
    ', only if you choose a PIN in Fleet Council: the pilot name, a scrambled (hashed) form of the PIN (the PIN itself is never stored), when the name was created, and your ranking (EXP, matches, wins, raids won).':
      ', chỉ khi bạn đặt PIN trong Fleet Council: tên pilot, PIN đã được mã hóa một chiều (không bao giờ lưu PIN gốc), thời điểm tạo tên và thứ hạng của bạn (EXP, số trận, số trận thắng, số lần đột kích thắng).',
    'Online rooms': 'Phòng online',
    ': the names in the room and the match in progress. A room is removed after two hours without activity.':
      ': tên những người trong phòng và trận đang diễn ra. Phòng bị xóa sau hai giờ không có hoạt động.',
    'Anonymous play counters': 'Bộ đếm ẩn danh',
    ': for example how many runs ended with each ending, after how many turns and roughly how long, which run length (20, 30 or 40 turns) was chosen, and the settings of finished matches. They contain no names, no IDs and no IP addresses.':
      ': ví dụ bao nhiêu ván kết thúc ở mỗi màn kết thúc, sau bao nhiêu lượt và khoảng bao lâu, độ dài ván đã chọn (20, 30 hay 40 lượt) và cài đặt của các trận đã chơi xong. Không có tên, mã định danh hay địa chỉ IP.',
    'Feedback messages': 'Góp ý',
    ': the text, which mode it is about and the day it was sent. Only the newest 200 are kept.':
      ': nội dung, chế độ được góp ý và ngày gửi. Chỉ giữ 200 góp ý mới nhất.',
    'On your device only': 'Chỉ trên máy của bạn',
    ': your browser remembers your language, which first-game tips you have seen, your last pilot name and your offline practice ranking, and, while the tab is open, the room you are in so you can rejoin it.':
      ': trình duyệt nhớ ngôn ngữ bạn chọn, những gợi ý ván đầu bạn đã xem, tên phi công gần nhất và bảng xếp hạng luyện tập offline; khi tab còn mở, trình duyệt nhớ phòng bạn đang ở để vào lại được.',

    // First-game tips (app/tips.js)
    'First game tip': 'Gợi ý ván đầu',
    'Got it': 'Đã hiểu',
    'Turn off tips': 'Tắt gợi ý',
    'Show tips again': 'Xem lại gợi ý',
    'Tips are on again': 'Đã bật lại gợi ý',
    'These five bars must stay in balance; a bar flashing red is in danger. If the Energy Core reaches 0, the station collapses and the run ends.':
      'Hãy giữ năm chỉ số này cân bằng; chỉ số nhấp nháy đỏ là đang nguy hiểm. Nếu Lõi năng lượng về 0, trạm sụp đổ và ván kết thúc.',
    'Each turn brings one card. Tap an option to reveal it, then tap it again to confirm your choice.':
      'Mỗi lượt có một thẻ. Chạm vào một lựa chọn để lật xem, rồi chạm lần nữa để xác nhận.',
    'The card now shows what actually changed. Press Continue for the next turn.':
      'Thẻ đang hiện đúng những gì đã thay đổi. Bấm Tiếp tục để sang lượt mới.',
    'A warning gives you one turn to recover. Fix that bar now, or the penalty hits next turn.':
      'Cảnh báo cho bạn một lượt để gỡ. Hãy cứu chỉ số đó ngay, nếu không lượt sau sẽ bị phạt.',
    'A story arc has started: its acts replace the normal cards until it ends, and its choices weigh heavily.':
      'Một tuyến truyện đã bắt đầu: các hồi của nó thay cho thẻ thường cho đến khi kết thúc, và mỗi lựa chọn đều rất nặng ký.',
    'Pick the number of worlds, turns and vote time, add bots or share the invite link, then launch the match.':
      'Chọn số thế giới, số lượt và thời gian bỏ phiếu, thêm bot hoặc gửi link mời, rồi bắt đầu trận.',
    'Every pilot votes for one card; the most votes wins. You can change your vote until the timer runs out.':
      'Mỗi phi công bầu cho một lá; lá nhiều phiếu nhất thắng. Bạn có thể đổi phiếu cho đến khi hết giờ.',
    'Your buildings filled their storage. Press Harvest to move it into the treasury and earn EXP.':
      'Công trình đã tích hàng vào kho. Bấm Thu hoạch để chuyển vào ngân khố và nhận EXP.',
    'Building and ordering ships spend the shared treasury, so they are crew plans: propose one, then the crew votes yes or no.':
      'Xây dựng và đóng tàu tiêu ngân khố chung nên là kế hoạch của đội: bạn đề xuất, cả đội bỏ phiếu Đồng ý hoặc Không.',
    'The report shows what your crew chose and what changed this turn. Press Ready when you are done.':
      'Báo cáo cho biết đội đã chọn gì và lượt này thay đổi ra sao. Bấm Sẵn sàng khi bạn xem xong.',
    'From turn 2 you can propose a raid on a rival in the Galaxy tab. Check the raid estimate before you attack.':
      'Từ lượt 2 bạn có thể đề xuất đột kích một đối thủ ở tab Thiên hà. Hãy xem ước tính đột kích trước khi tấn công.',
    'Not stored: email, phone number, real name, IP address or location. There are no cookies and no third-party analytics. The Sui wallet and NFT buttons are demos: nothing is sent or recorded. The game runs on Render and keeps its data in Upstash Redis; these hosts may keep short technical logs.':
      'Không lưu: email, số điện thoại, tên thật, địa chỉ IP hay vị trí. Không có cookie và không dùng công cụ phân tích của bên thứ ba. Nút ví Sui và NFT chỉ là bản demo: không gửi hay ghi lại gì cả. Game chạy trên Render và lưu dữ liệu ở Upstash Redis; hai dịch vụ này có thể giữ nhật ký kỹ thuật ngắn hạn.',
    'Deleting your data': 'Xóa dữ liệu của bạn',
    'Want your pilot (name, PIN and ranking) or one of your messages deleted? Send a feedback message with the pilot name and what to delete, and the project owner will remove it by hand.':
      'Muốn xóa pilot (tên, PIN và thứ hạng) hay một góp ý của bạn? Gửi một góp ý ghi tên pilot và thứ cần xóa, chủ dự án sẽ xóa thủ công.'
  }, [
    [/^(\d+) \/ 500$/, m => m[1] + ' / 500'],
    [/^Feedback needs the online server\. Open (.+)$/, m => 'Góp ý cần máy chủ online. Hãy mở ' + m[1]],
    [/^Could not send\. Feedback needs the online server: (.+)$/, m => 'Không gửi được. Góp ý cần máy chủ online: ' + m[1]],
    [/^Keep it under (\d+) characters\.$/, m => `Hãy viết dưới ${m[1]} ký tự.`],
    // Decorated text: translate what is inside bullets, arrows, quotes and leading icons.
    [/^([•↳✦✓…⚡⚠🔒🔓]+\s*)([\s\S]+)$/u, (m, t) => m[1] + t(m[2])],
    [/^"([\s\S]+)"$/, (m, t) => '"' + t(m[1]) + '"'],
    [/^“([\s\S]+)”$/, (m, t) => '“' + t(m[1]) + '”'],
    [/^— ([\s\S]+)$/, (m, t) => '— ' + t(m[1])],
    [/^(\p{Extended_Pictographic}️?) ([\s\S]+)$/u, (m, t) => m[1] + ' ' + t(m[2])]
  ]);
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
