// Vietnamese for the solo story's interface: title screen, HUD, cards, notifications, end screen and
// archives, plus the ending titles and arc names in capitals. Story text is in data/vi-solo-content.js.
(function (root) {
  const I = root.TheOvalI18n;
  if (!I) return;

  const BAR = {
    'Public Approval': 'Dân ủng hộ',
    'Interstellar Tension': 'Căng thẳng liên sao',
    'Economic State': 'Kinh tế',
    'State Control': 'Quyền kiểm soát',
    'Party Loyalty': 'Lòng trung thành của Đảng',
    'Energy Core': 'Lõi năng lượng'
  };
  const TOPIC = {
    ENVIRONMENT: 'MÔI TRƯỜNG', WAR: 'CHIẾN TRANH', ECONOMY: 'KINH TẾ', 'CIVIL RIGHTS': 'DÂN QUYỀN',
    CIVILRIGHTS: 'DÂN QUYỀN', SCANDAL: 'BÊ BỐI', GIFT: 'QUÀ TẶNG', ARC: 'TUYẾN TRUYỆN'
  };
  const list = (text, t) => text.split(', ').map(x => t(x)).join(', ');

  I.add(Object.assign({}, BAR, TOPIC, {
    'The Oval - V1.5': 'The Oval - V1.5',
    // Title screen
    'Every decision has a cost.': 'Quyết định nào cũng có cái giá của nó.',
    '🔗 CONNECT SUI WALLET · DEMO': '🔗 KẾT NỐI VÍ SUI · DEMO',
    'Normal Mode': 'Chế độ thường',
    'Pure moral choices. Discover what your decisions say about you. Choose 20, 30 or 40 turns:': 'Những lựa chọn đạo đức thuần túy. Khám phá quyết định của bạn nói gì về bạn. Chọn 20, 30 hoặc 40 lượt:',
    'Play 20 turns': 'Chơi 20 lượt',
    'Play 30 turns': 'Chơi 30 lượt',
    'Play 40 turns': 'Chơi 40 lượt',
    'Team multiplayer. Each team is a world: vote together, build your planet, harvest, raid rivals and climb the pilot ranking.':
      'Chơi đội nhiều người. Mỗi đội là một thế giới: cùng bỏ phiếu, xây hành tinh, thu hoạch, đột kích đối thủ và leo bảng xếp hạng phi công.',
    'Archives': 'Kho lưu trữ',
    'Explore all the different endings, cards, and classified story files.': 'Khám phá mọi màn kết thúc, các thẻ và hồ sơ cốt truyện mật.',
    'Press': 'Nhấn',
    'at any time to enter a cheat code': 'bất cứ lúc nào để nhập mã gian lận',
    'Enter cheat code…': 'Nhập mã gian lận…',

    // HUD
    'TURN': 'LƯỢT',
    'ARC ACTIVE': 'ĐANG CÓ TUYẾN TRUYỆN',
    '♩ Music': '♩ Nhạc',
    '♩ On': '♩ Bật',
    'Approval': 'Ủng hộ',
    'Tension': 'Căng thẳng',
    'Economic': 'Kinh tế',
    'Control': 'Kiểm soát',
    'Loyalty': 'Trung thành',
    'Energy': 'Năng lượng',
    'Economy': 'Kinh tế',
    'Authority': 'Quyền lực',
    'Continue →': 'Tiếp tục →',
    'App >80%: Economy boosts +3, but Approval decays faster.': 'Ủng hộ >80%: Kinh tế được +3, nhưng Ủng hộ giảm nhanh hơn.',
    'Auth >80%: Heavy hand magnifies Approval penalties.': 'Kiểm soát >80%: bàn tay sắt làm mức mất Ủng hộ nặng hơn.',
    'Party >80%: Scandal mgmt easier, but costs steep capital.': 'Đảng >80%: dễ dập bê bối hơn, nhưng tốn nhiều vốn chính trị.',
    'Auth <30: Bleeding 1 Party Loyalty/turn.': 'Kiểm soát <30: mất 1 Trung thành của Đảng mỗi lượt.',

    // Cards
    '⚡ STORY ARC': '⚡ TUYẾN TRUYỆN',
    'Tap to reveal': 'Chạm để lật',
    'Confirm Selection': 'Xác nhận lựa chọn',
    'Tap again to confirm': 'Chạm lần nữa để xác nhận',
    'Outcome:': 'Kết quả:',
    'No immediate stat movement.': 'Các chỉ số chưa thay đổi ngay.',
    'The policy stabilizes supply quickly, but environmental and community costs spark new backlash.': 'Chính sách ổn định nguồn cung nhanh chóng, nhưng cái giá về môi trường và cộng đồng gây ra làn sóng phản đối mới.',
    'Impact is limited for now, but stakeholders will watch implementation closely.': 'Tác động trước mắt còn hạn chế, nhưng các bên liên quan sẽ theo dõi sát việc thực hiện.',
    '🔒 Labeled Disloyal. Blocked by Party.': '🔒 Bị coi là bất trung. Đảng chặn lựa chọn này.',
    'Story Arc Activated': 'Tuyến truyện bắt đầu',

    // Settings and console
    'Governance Settings': 'Cài đặt điều hành',
    'Soundtrack Profile': 'Bộ nhạc nền',
    'Default Ambient': 'Không gian mặc định',
    'Clockwork Pressure': 'Áp lực đồng hồ',
    'Imperial Resonance': 'Âm vang đế chế',
    'Digital Void': 'Khoảng trống số',
    'Cheat Mode': 'Chế độ gian lận',
    'Enable Console': 'Bật bảng điều khiển',
    'Disable Console': 'Tắt bảng điều khiển',
    'Return to Office': 'Quay lại the Oval',
    'Status Manipulator': 'Chỉnh chỉ số',
    'Hidden Metrics': 'Chỉ số ẩn',
    'Executive Powers': 'Quyền hành pháp',
    '+ Skip Turn': '+ Bỏ qua lượt',
    '🔓 Decrypt All Files': '🔓 Giải mã mọi hồ sơ',
    'Soundtrack profile updated.': 'Đã đổi bộ nhạc nền.',
    'Executive Order: Time advanced.': 'Lệnh hành pháp: thời gian đã được tua nhanh.',
    'ALL FILES DECRYPTED. ACCESS GALLERY VIA MAIN MENU.': 'MỌI HỒ SƠ ĐÃ ĐƯỢC GIẢI MÃ. MỞ KHO LƯU TRỮ Ở MÀN HÌNH CHÍNH.',
    '🔓 Gallery Unlocked': '🔓 Đã mở khóa kho lưu trữ',

    // Demo wallet and NFT
    '⌛ CONNECTING...': '⌛ ĐANG KẾT NỐI...',
    '0x7a2d...3f1e · DEMO WALLET': '0x7a2d...3f1e · VÍ DEMO',
    'Demo wallet connected. No real Sui connection is made.': 'Đã kết nối ví demo. Không có kết nối Sui thật nào được tạo.',
    'Preparing demo mint...': 'Đang chuẩn bị đúc NFT demo...',
    'Demo mint finished (no real transaction).': 'Đã đúc NFT demo xong (không có giao dịch thật).',
    "🎉 Demo complete\n\nThis is a preview of how a Legacy NFT ('Lazarus Fragment') would be minted on Sui.\nNo transaction was sent and nothing was recorded on-chain.":
      "🎉 Hoàn tất bản demo\n\nĐây là bản xem trước cách một NFT Di sản ('Lazarus Fragment') sẽ được đúc trên Sui.\nKhông có giao dịch nào được gửi và không có gì được ghi lên chuỗi.",

    // Notifications from the rules
    '⚠ Party Revolt: your own party has voted you out.': '⚠ Đảng nổi loạn: chính Đảng của bạn đã bỏ phiếu phế truất bạn.',
    '⚠ Approval is collapsing: improve it this turn or face an Approval Crisis.': '⚠ Dân ủng hộ đang sụp đổ: hãy cải thiện trong lượt này, nếu không sẽ gặp Khủng hoảng ủng hộ.',
    '⚠ Approval Crisis: Confidence reset, penalties applied across Economy and Loyalty.': '⚠ Khủng hoảng ủng hộ: niềm tin được đặt lại, Kinh tế và Lòng trung thành bị phạt.',
    '⚠ The economy is failing: improve it this turn or face an Economic Collapse.': '⚠ Kinh tế đang suy sụp: hãy cải thiện trong lượt này, nếu không sẽ gặp Sụp đổ kinh tế.',
    '⚠ Economic Collapse: Markets subsidized, immense public backlash absorbed.': '⚠ Sụp đổ kinh tế: thị trường được trợ giá, chính quyền hứng làn sóng phẫn nộ khổng lồ.',
    'Your remaining supporters rally in the streets: Approval steadies at 20.': 'Những người ủng hộ còn lại xuống đường: Dân ủng hộ giữ ở mức 20.',
    '⚠ Warning: Low Party Loyalty restricted your options.': '⚠ Cảnh báo: Lòng trung thành của Đảng thấp đã hạn chế lựa chọn của bạn.',

    // End screen
    'Moral Profile': 'Hồ sơ đạo đức',
    'Logic': 'Lý trí',
    'Empathy': 'Thấu cảm',
    'Freedom': 'Tự do',
    'Order': 'Trật tự',
    'Caution': 'Thận trọng',
    'Courage': 'Can đảm',
    'Pragmatism': 'Thực dụng',
    'Integrity': 'Chính trực',
    'Defining Decisions': 'Những quyết định định hình',
    'Play Again': 'Chơi lại',
    '💠 Mint Legacy NFT (demo)': '💠 Đúc NFT Di sản (demo)',
    'Gallery': 'Kho lưu trữ',
    '🐦 Share on X': '🐦 Chia sẻ lên X',
    'CRITICAL FAILURE': 'SỰ CỐ NGHIÊM TRỌNG',

    // Ending titles (ids stay English for the anonymous counters)
    'The Impeached': 'Kẻ bị phế truất',
    'The Resignation': 'Người từ chức',
    'The Warmonger': 'Kẻ hiếu chiến',
    'The Peacemaker': 'Người kiến tạo hòa bình',
    'The Pacifist': 'Người theo chủ nghĩa hòa bình',
    'The Tyrant': 'Bạo chúa',
    'The Martyr': 'Người tử vì đạo',
    'The Populist': 'Kẻ mị dân',
    'The Statesman': 'Chính khách',
    'The Technocrat': 'Nhà kỹ trị',
    'The Survivor': 'Kẻ sống sót',
    'The Neutral': 'Người trung dung',
    'The Lazarus Protocol': 'Giao thức Lazarus',
    'The World on Fire': 'Thế giới bốc cháy',
    'Legacy of the Ultimatum': 'Di sản của tối hậu thư',
    'Healed the Divide': 'Hàn gắn chia rẽ',
    'By de-escalating global tension before the brink, you secured a era of prosperity without firing a single shot.':
      'Bằng cách hạ nhiệt căng thẳng trước bờ vực, bạn mở ra một kỷ nguyên thịnh vượng mà không cần bắn một phát súng nào.',
    'Energy core depleted': 'Lõi năng lượng cạn kiệt',
    'Energy core depleted. The space station has collapsed. Preparing to extract Legacy Data...': 'Lõi năng lượng cạn kiệt. Trạm vũ trụ đã sụp đổ. Đang chuẩn bị trích xuất Dữ liệu Di sản...',
    'The space station has collapsed. Preparing to extract Legacy Data...': 'Trạm vũ trụ đã sụp đổ. Đang chuẩn bị trích xuất Dữ liệu Di sản...',

    // Arc names in capitals (HUD label)
    'CONVERGENCE ROUTE': 'CON ĐƯỜNG HỘI TỤ',
    'THE SCANDAL': 'VỤ BÊ BỐI',
    'THE REVOLUTION': 'CUỘC CÁCH MẠNG',
    'THE PERMANENT RECORD': 'HỒ SƠ VĨNH VIỄN',

    // Archives
    '← Return': '← Quay lại',
    '🔓 The Oval Archives': '🔓 Kho lưu trữ The Oval',
    'Trigger Condition:': 'Điều kiện kích hoạt:',
    'From turn 6: Interstellar Tension above 80% for 3 turns (or 98%)': 'Từ lượt 6: Căng thẳng liên sao trên 80% suốt 3 lượt (hoặc chạm 98%)',
    'Party Loyalty < 30%': 'Lòng trung thành của Đảng < 30%',
    'State Authority below 30% for 3 turns (or below 25%) while Approval is under 55%, or after turn 10, Approval below 10% for 3 turns':
      'Quyền kiểm soát dưới 30% suốt 3 lượt (hoặc dưới 25%) khi Dân ủng hộ dưới 55%, hoặc sau lượt 10, Dân ủng hộ dưới 10% suốt 3 lượt',
    'The last turn of the run (20, 30 or 40)': 'Lượt cuối của ván (20, 30 hoặc 40)'
  }), [
    [/^(Public Approval|Interstellar Tension|Economic State|State Control|Party Loyalty|Energy Core) ([+-]?\d+(?:\.\d+)?)$/, m => `${BAR[m[1]]} ${m[2]}`],
    [/^\/ (\d+)$/, m => `/ ${m[1]}`],
    [/^(Approval|Tension|Economy|Authority|Loyalty):$/, (m, t) => t(m[1]) + ':'],
    [/^Short-term gains for (.+) come with pressure on (.+)\.$/, (m, t) => `Lợi ích trước mắt cho ${list(m[1], t)} đi kèm áp lực lên ${list(m[2], t)}.`],
    [/^The move lands well and improves (.+)\.$/, (m, t) => `Nước đi được đón nhận và cải thiện ${list(m[1], t)}.`],
    [/^The decision carries risk, with strain concentrated on (.+)\.$/, (m, t) => `Quyết định có rủi ro, áp lực dồn lên ${list(m[1], t)}.`],
    [/^Party revolt brewing: raise Party Loyalty above 10 within (\d+) turn\(s\) or your party will remove you\.$/,
      m => `Đảng sắp nổi loạn: hãy đưa Lòng trung thành của Đảng lên trên 10 trong ${m[1]} lượt, nếu không Đảng sẽ phế truất bạn.`],
    [/^Arc triggered: (.+)$/, (m, t) => `Tuyến truyện bắt đầu: ${t(m[1])}`],
    [/^Unknown code: (.*)$/, m => `Mã không hợp lệ: ${m[1]}`],
    [/^([A-Z ]+) · (.+)$/, (m, t) => `${t(m[1])} · ${t(m[2])}`],
    [/^Endings \((\d+)\)$/, m => `Màn kết thúc (${m[1]})`],
    [/^Story Arcs \((\d+)\)$/, m => `Tuyến truyện (${m[1]})`],
    [/^Classified Decision Files \((\d+)\)$/, m => `Hồ sơ quyết định mật (${m[1]})`],
    [/^(\d+)-act arc$/, m => `Tuyến truyện ${m[1]} hồi`],
    [/^Act (\d+): (.+)$/, (m, t) => `Hồi ${m[1]}: ${t(m[2])}`]
  ]);
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
