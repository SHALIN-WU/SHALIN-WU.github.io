import { L } from "./l10n.mjs";

export const ui = {
  skip: L("Skip to content", "跳至主要內容", "本文へ移動", "Chuyển tới nội dung"),
  menu: L("Menu", "選單", "メニュー", "Menu"),
  services: L("Services", "服務", "サービス", "Dịch vụ"),
  locations: L("Locations", "全球據點", "拠点", "Văn phòng"),
  about: L("About", "關於我們", "会社概要", "Giới thiệu"),
  contact: L("Contact", "聯絡我們", "お問い合わせ", "Liên hệ"),
  enquire: L("Enquire", "詢價", "見積依頼", "Báo giá"),
  privacy: L("Privacy policy", "隱私權政策", "プライバシー", "Bảo mật"),
  terms: L("Terms of service", "服務條款", "利用規約", "Điều khoản"),
  cookie: L("Cookie policy", "Cookie 政策", "Cookie", "Cookie"),
  disclaimer: L("Legal disclaimer", "法律聲明", "免責事項", "Tuyên bố pháp lý"),
  footerServices: L("Services", "服務", "サービス", "Dịch vụ"),
  footerCompany: L("Company", "公司", "会社", "Công ty"),
  footerLegal: L("Legal", "法律", "法務", "Pháp lý"),
  rights: L(
    "Northgo. Founded in Taipei in 1988.",
    "Northgo。1988 年創立於台北。",
    "Northgo。1988 年、台北で創業。",
    "Northgo. Thành lập tại Đài Bắc năm 1988."
  ),
  langLabel: L("Language", "語系", "言語", "Ngôn ngữ"),
  solves: L("What this solves", "這項服務解決什麼", "何のためのサービスか", "Việc này giải quyết gì"),
  coverage: L("How it is handled", "怎麼做", "進め方", "Cách thực hiện"),
  related: L("Related", "相關服務", "関連", "Liên quan"),
  caseEyebrow: L("Anonymized example", "匿名作業示例", "匿名の作業例", "Ví dụ ẩn danh"),
  cargo: L("Cargo", "貨種", "貨物", "Hàng"),
  lane: L("Lane", "路線", "経路", "Tuyến"),
  challenge: L("Challenge", "問題", "課題", "Vấn đề"),
  approach: L("Approach", "做法", "対応", "Cách làm"),
  result: L("Result", "結果", "結果", "Kết quả"),
  enquireService: L("Enquire about this", "詢問這項服務", "このサービスを依頼", "Yêu cầu báo giá dịch vụ này"),
  seeMap: L("Open the map", "打開地圖", "地図を開く", "Mở bản đồ"),
  hq: L("Head office", "總部", "本社", "Trụ sở chính"),
  tel: L("Tel", "電話", "電話", "Điện thoại"),
  fax: L("Fax", "傳真", "FAX", "Fax"),
  email: L("Email", "信箱", "メール", "Email"),
  maps: L("Open in Google Maps", "在 Google 地圖開啟", "Google マップで開く", "Mở trên Google Maps"),
  enquireOffice: L("Enquire to this office", "向此辦公室詢價", "この拠点に依頼", "Gửi yêu cầu tới văn phòng này"),
  regionLabel: L("Regions", "區域", "地域", "Khu vực"),
  regions: {
    all: L("Global", "全球", "全世界", "Toàn cầu"),
    asia: L("Asia", "亞洲", "アジア", "Châu Á"),
    taiwan: L("Taiwan", "台灣", "台湾", "Đài Loan"),
    japan: L("Japan", "日本", "日本", "Nhật Bản"),
    sea: L("Southeast Asia", "東南亞", "東南アジア", "Đông Nam Á"),
    na: L("North America", "北美", "北米", "Bắc Mỹ")
  },
  mapLabel: L("Office map", "辦公室地圖", "拠点マップ", "Bản đồ văn phòng"),
  mapFallback: L(
    "Markers show approximate city locations. See office details for addresses.",
    "標記顯示城市的大約位置。地址請見辦公室詳細資訊。",
    "マーカーは都市のおおよその位置を示しています。住所は拠点詳細をご確認ください。",
    "Các điểm đánh dấu cho biết vị trí gần đúng của thành phố. Xem thông tin văn phòng để biết địa chỉ."
  ),
  crumbsHome: L("Home", "首頁", "ホーム", "Trang chủ"),
  sendTitle: L("Send the shipment details", "留下可報價的貨況", "貨物の条件を送る", "Gửi thông tin lô hàng"),
  sendText: L(
    "Origin, destination, cargo, and the office that should quote.",
    "填起運地、目的地、貨種，以及負責報價的辦公室。",
    "仕出地、仕向地、貨物、見積する拠点を記入します。",
    "Điền nơi đi, nơi đến, loại hàng và văn phòng sẽ báo giá."
  ),
  modes: L("Modes", "運輸方式", "モード", "Phương thức"),
  industryLink: L("Offshore wind", "離岸風電", "洋上風力", "Điện gió ngoài khơi"),
  privacyNote: L(
    "The enquiry is emailed to the office you select. See the privacy policy.",
    "詢價會寄到你選擇的辦公室。詳見隱私權政策。",
    "依頼は選択した拠点へメールします。プライバシーをご覧ください。",
    "Yêu cầu được gửi email tới văn phòng bạn chọn. Xem chính sách bảo mật."
  ),
  form: {
    step1: L("Step 1 of 2. Your details.", "第 1 步，共 2 步。聯絡資料。", "2 段階の 1。連絡先。", "Bước 1 / 2. Thông tin liên hệ."),
    step2: L("Step 2 of 2. The shipment.", "第 2 步，共 2 步。貨況。", "2 段階の 2。貨物。", "Bước 2 / 2. Lô hàng."),
    required: L("This field is required.", "此欄必填。", "必須項目です。", "Trường này là bắt buộc."),
    email: L("Enter a valid email.", "請輸入有效的電子郵件。", "有効なメールアドレスを入力してください。", "Nhập email hợp lệ."),
    terms: L("Accept the terms to continue.", "請先同意條款。", "規約への同意が必要です。", "Cần đồng ý điều khoản."),
    number: L("Use a number that is zero or greater.", "請輸入 0 或更大的數字。", "0 以上の数値を入力してください。", "Nhập số lớn hơn hoặc bằng 0."),
    select: L("Select one", "請選擇", "選択してください", "Chọn một mục"),
    next: L("Continue", "下一步", "次へ", "Tiếp tục"),
    back: L("Back", "上一步", "戻る", "Quay lại"),
    submit: L("Prepare the enquiry", "產生詢價", "依頼文を作る", "Tạo yêu cầu"),
    first: L("First name", "名字", "名", "Tên"),
    last: L("Last name", "姓氏", "姓", "Họ"),
    company: L("Company", "公司", "会社", "Công ty"),
    emailLabel: L("Email", "電子郵件", "メール", "Email"),
    phone: L("Phone", "電話", "電話", "Điện thoại"),
    country: L("Country", "國家或地區", "国・地域", "Quốc gia hoặc vùng"),
    message: L("Message", "補充說明", "補足", "Ghi chú"),
    termsLead: L("I accept the", "我已閱讀並同意", "次に同意します：", "Tôi đồng ý với"),
    service: L("Service", "服務", "サービス", "Dịch vụ"),
    cargo: L("Cargo type", "貨型", "貨物タイプ", "Loại hàng"),
    pieces: L("Pieces", "件數", "個数", "Số kiện"),
    weight: L("Weight (kg)", "重量（公斤）", "重量（kg）", "Khối lượng (kg)"),
    volume: L("Volume (cbm)", "體積（立方米）", "容積（cbm）", "Thể tích (cbm)"),
    ready: L("Ready date", "可出貨日", "準備できる日", "Ngày hàng sẵn sàng"),
    office: L("Office", "辦公室", "拠点", "Văn phòng"),
    other: L("Other", "其他", "その他", "Khác"),
    readyTitle: L("Enquiry ready to send", "詢價已可寄出", "依頼文の準備ができました", "Yêu cầu đã sẵn sàng để gửi"),
    readyBody: L(
      "Reference {id} is for {office} ({email}). It is sent when you email that office.",
      "編號 {id} 指定給{office}（{email}）。寄出這封信後，才算送達該辦公室。",
      "番号 {id} は{office}（{email}）宛です。その拠点へメールした時点で届きます。",
      "Mã {id} dành cho {office} ({email}). Yêu cầu được gửi khi bạn email văn phòng đó."
    ),
    send: L("Email {email}", "寄到 {email}", "{email} にメール", "Email {email}"),
    copy: L("Copy the text", "複製內容", "文面をコピー", "Sao chép nội dung"),
    copied: L("Copied", "已複製", "コピーしました", "Đã sao chép"),
    subject: L("Northgo enquiry", "Northgo 詢價", "Northgo 見積依頼", "Yêu cầu báo giá Northgo"),
    mailIntro: L("Northgo enquiry", "Northgo 詢價", "Northgo 見積依頼", "Yêu cầu Northgo"),
    noscript: L(
      "JavaScript is off. Email the office that should quote, and include the lane, cargo, and ready date.",
      "未啟用 JavaScript。請直接寫信給負責報價的辦公室，並附上路線、貨種與可出貨日。",
      "JavaScript が無効です。見積する拠点へ、経路・貨物・準備日を書いてメールしてください。",
      "JavaScript đang tắt. Hãy email văn phòng báo giá và ghi tuyến, loại hàng, ngày sẵn sàng."
    ),
    origin: {
      default: L("Origin", "起運地", "仕出地", "Nơi đi"),
      warehouse: L("Cargo location", "貨物現在位置", "貨物の現在地", "Vị trí hàng hiện tại"),
      agency: L("Port", "港口", "港", "Cảng")
    },
    destination: {
      default: L("Destination", "目的地", "仕向地", "Nơi đến"),
      warehouse: L("Warehouse or delivery site", "倉庫或交貨地", "倉庫または配送先", "Kho hoặc nơi giao"),
      agency: L("Next port", "下一港", "次港", "Cảng kế")
    },
    cargoMap: {
      freight: [
        "FCL",
        "LCL",
        L("Air", "空運", "航空", "Hàng không"),
        L("Trucking", "卡車", "トラック", "Xe tải"),
        L("Customs", "報關", "通関", "Thông quan")
      ],
      ocean: ["FCL", "LCL"],
      air: [
        L("General air cargo", "一般空運貨", "一般航空貨物", "Hàng không thông thường"),
        L("Express", "快遞", "エクスプレス", "Chuyển phát")
      ],
      land: [
        L("Full truck", "整車", "チャーター便", "Nguyên xe"),
        L("Shared truck", "併車", "混載トラック", "Xe ghép")
      ],
      customs: [
        L("Import entry", "進口報關", "輸入申告", "Khai nhập"),
        L("Export entry", "出口報關", "輸出申告", "Khai xuất")
      ],
      project: [
        L("Heavy lift", "重吊", "ヘビーリフト", "Nâng hạ nặng"),
        L("Oversized", "超尺寸", "大型", "Quá khổ"),
        L("Breakbulk", "件雜貨", "在来貨物", "Hàng rời kiện")
      ],
      warehouse: [
        L("Storage", "倉儲", "保管", "Lưu kho"),
        L("Offshore equipment", "離岸設備", "オフショア機材", "Thiết bị ngoài khơi"),
        L("Cross-dock", "越庫", "クロスドック", "Cross-dock")
      ],
      agency: [
        L("Full agency", "總代理", "総代理", "Đại lý đầy đủ"),
        L("Protective agency", "保護代理", "保護代理", "Đại lý bảo vệ"),
        L("Husbandry", "船務事項", "ハスバンドリー", "Husbandry")
      ],
      other: [L("Other", "其他", "その他", "Khác")]
    }
  }
};

export const countries = [
  ["TW", "tpe", L("Taiwan", "台灣", "台湾", "Đài Loan")],
  ["JP", "tyo", L("Japan", "日本", "日本", "Nhật Bản")],
  ["VN", "hcmc", L("Vietnam", "越南", "ベトナム", "Việt Nam")],
  ["US", "lax", L("United States", "美國", "アメリカ", "Hoa Kỳ")],
  ["CN", "", L("China", "中國", "中国", "Trung Quốc")],
  ["HK", "", L("Hong Kong", "香港", "香港", "Hồng Kông")],
  ["KR", "", L("South Korea", "南韓", "韓国", "Hàn Quốc")],
  ["SG", "", L("Singapore", "新加坡", "シンガポール", "Singapore")],
  ["MY", "", L("Malaysia", "馬來西亞", "マレーシア", "Malaysia")],
  ["TH", "", L("Thailand", "泰國", "タイ", "Thái Lan")],
  ["ID", "", L("Indonesia", "印尼", "インドネシア", "Indonesia")],
  ["PH", "", L("Philippines", "菲律賓", "フィリピン", "Philippines")],
  ["IN", "", L("India", "印度", "インド", "Ấn Độ")],
  ["AU", "", L("Australia", "澳洲", "オーストラリア", "Úc")],
  ["NZ", "", L("New Zealand", "紐西蘭", "ニュージーランド", "New Zealand")],
  ["CA", "", L("Canada", "加拿大", "カナダ", "Canada")],
  ["MX", "", L("Mexico", "墨西哥", "メキシコ", "Mexico")],
  ["BR", "", L("Brazil", "巴西", "ブラジル", "Brazil")],
  ["CL", "", L("Chile", "智利", "チリ", "Chile")],
  ["DE", "", L("Germany", "德國", "ドイツ", "Đức")],
  ["NL", "", L("Netherlands", "荷蘭", "オランダ", "Hà Lan")],
  ["BE", "", L("Belgium", "比利時", "ベルギー", "Bỉ")],
  ["FR", "", L("France", "法國", "フランス", "Pháp")],
  ["IT", "", L("Italy", "義大利", "イタリア", "Ý")],
  ["ES", "", L("Spain", "西班牙", "スペイン", "Tây Ban Nha")],
  ["GB", "", L("United Kingdom", "英國", "イギリス", "Vương quốc Anh")],
  ["SE", "", L("Sweden", "瑞典", "スウェーデン", "Thụy Điển")],
  ["DK", "", L("Denmark", "丹麥", "デンマーク", "Đan Mạch")],
  ["PL", "", L("Poland", "波蘭", "ポーランド", "Ba Lan")],
  ["TR", "", L("Turkey", "土耳其", "トルコ", "Thổ Nhĩ Kỳ")],
  ["AE", "", L("United Arab Emirates", "阿聯酋", "アラブ首長国連邦", "Các Tiểu vương quốc Ả Rập Thống nhất")],
  ["SA", "", L("Saudi Arabia", "沙烏地阿拉伯", "サウジアラビア", "Ả Rập Xê Út")],
  ["ZA", "", L("South Africa", "南非", "南アフリカ", "Nam Phi")],
  ["EG", "", L("Egypt", "埃及", "エジプト", "Ai Cập")],
  ["BD", "", L("Bangladesh", "孟加拉", "バングラデシュ", "Bangladesh")],
  ["PK", "", L("Pakistan", "巴基斯坦", "パキスタン", "Pakistan")],
  ["KH", "", L("Cambodia", "柬埔寨", "カンボジア", "Campuchia")],
  ["MM", "", L("Myanmar", "緬甸", "ミャンマー", "Myanmar")],
  ["LA", "", L("Laos", "寮國", "ラオス", "Lào")],
  ["LK", "", L("Sri Lanka", "斯里蘭卡", "スリランカ", "Sri Lanka")]
];

export const home = {
  title: L("Making logistics effortless.", "讓物流變得輕鬆。", "物流を、手間なく。", "Biến logistics thành việc đơn giản."),
  accent: L("effortless.", "輕鬆", "手間なく", "đơn giản"),
  seoTitle: L(
    "Making logistics effortless | Northgo",
    "讓物流變得輕鬆｜Northgo",
    "物流を、手間なく。｜Northgo",
    "Biến logistics thành việc đơn giản | Northgo"
  ),
  description: L(
    "Northgo moves freight, project cargo, Taichung port warehousing, and port agency calls from offices in Taiwan, Japan, Vietnam, and the United States.",
    "Northgo 承作海運、空運、陸運、報關、專案物流、台中港倉儲與船務代理。據點在台北、台中、高雄、東京、大阪、胡志明市與洛杉磯，可指定辦公室留下起訖與貨況。",
    "Northgo は海上・航空・陸上輸送、通関、プロジェクト物流、台中港の倉庫、船舶代理を扱います。台北、台中、高雄、東京、大阪、ホーチミン、ロサンゼルスへ貨況を送れます。",
    "Northgo nhận vận tải, hàng dự án, kho cảng Đài Trung và đại lý tàu từ văn phòng tại Đài Loan, Nhật Bản, Việt Nam và Hoa Kỳ."
  ),
  lead: L(
    "Freight, project cargo, Taichung port warehousing, and port agency — handled by teams in Taiwan, Japan, Vietnam, and the United States.",
    "貨運、專案貨、台中港倉儲與船務代理，由台灣、日本、越南與美國的團隊直接處理。",
    "フレイト、プロジェクト貨物、台中港の倉庫、船舶代理。台湾・日本・ベトナム・米国のチームが現地で対応します。",
    "Vận tải, hàng dự án, kho tại cảng Đài Trung và đại lý tàu — do đội ngũ tại Đài Loan, Nhật Bản, Việt Nam và Hoa Kỳ phụ trách."
  ),
  servicesTitle: L("Four services", "四項服務", "四つのサービス", "Bốn dịch vụ"),
  servicesIntro: L(
    "Choose the desk that matches the cargo. Ocean, air, road, and customs sit under freight.",
    "依貨物選擇窗口。海運、空運、陸運與報關在貨運之下。",
    "貨物に合う窓口を選んでください。海上・航空・陸上・通関はフレイトの中です。",
    "Chọn bàn đúng với hàng. Biển, hàng không, đường bộ và thông quan nằm trong vận tải."
  ),
  networkTitle: L("Seven offices", "七個辦公室", "七つの拠点", "Bảy văn phòng"),
  networkLead: L(
    "Taipei is the head office. Taichung, Kaohsiung, Tokyo, Osaka, Ho Chi Minh City, and Los Angeles are on the same map.",
    "總部在台北。台中、高雄、東京、大阪、胡志明市與洛杉磯在同一張地圖上。",
    "本社は台北。台中、高雄、東京、大阪、ホーチミン、ロサンゼルスは同じ地図にあります。",
    "Trụ sở tại Đài Bắc. Đài Trung, Cao Hùng, Tokyo, Osaka, TP. Hồ Chí Minh và Los Angeles nằm trên cùng một bản đồ."
  ),
  trustTitle: L("Why a shipper can send the file", "為什麼可以把這票交給 Northgo", "案件を預けられる理由", "Vì sao có thể giao hồ sơ"),
  trusts: [
    {
      title: L("Since 1988", "自 1988 年", "1988 年から", "Từ 1988"),
      text: L(
        "Founded in Taipei as Max Seair. The company rebranded as Northgo on 11 November 2024.",
        "於台北創立，當時名為 Max Seair。2024 年 11 月 11 日更名為 Northgo。",
        "台北で Max Seair として創業。2024 年 11 月 11 日に Northgo へ改名しました。",
        "Thành lập tại Đài Bắc với tên Max Seair. Đổi thành Northgo ngày 11 tháng 11 năm 2024."
      )
    },
    {
      title: L("IATA, ISO 45001, AEO", "IATA、ISO 45001、AEO", "IATA、ISO 45001、AEO", "IATA, ISO 45001, AEO"),
      text: L(
        "IATA for air cargo, ISO 45001 for occupational health and safety, and AEO as an authorized economic operator.",
        "IATA 對應空運貨運，ISO 45001 為職業安全衛生，AEO 為安全認證優質企業。",
        "IATA は航空貨物、ISO 45001 は労働安全衛生、AEO は認定事業者です。",
        "IATA cho hàng không, ISO 45001 cho an toàn sức khỏe nghề nghiệp, AEO là nhà kinh doanh được chứng nhận."
      )
    },
    {
      title: L("Local desks", "當地窗口", "現地の担当", "Đầu mối tại chỗ"),
      text: L(
        "People in Taiwan, Japan, Vietnam, and the United States answer on the shipment they hold.",
        "台灣、日本、越南與美國的人員，回覆自己手上的那一票。",
        "台湾、日本、ベトナム、米国の担当が、自分が持つ案件に答えます。",
        "Người tại Đài Loan, Nhật Bản, Việt Nam và Hoa Kỳ trả lời đúng lô mình giữ."
      )
    }
  ]
};

export const about = {
  seoTitle: L(
    "About Northgo, founded in Taipei in 1988 | Northgo",
    "關於 Northgo：1988 年創立於台北｜Northgo",
    "Northgo について。1988 年台北創業｜Northgo",
    "Về Northgo, thành lập tại Đài Bắc năm 1988 | Northgo"
  ),
  description: L(
    "Northgo was founded in Taipei in 1988 as Max Seair and rebranded on 11 November 2024. The work is freight, projects, warehousing, and port agency.",
    "Northgo 於 1988 年在台北以 Max Seair 創立，2024 年 11 月 11 日更名。業務為貨運、專案、倉儲與船務代理。",
    "Northgo は 1988 年に台北で Max Seair として創業し、2024 年 11 月 11 日に改名しました。事業は輸送、プロジェクト、倉庫、港湾代理です。",
    "Northgo thành lập tại Đài Bắc năm 1988 với tên Max Seair và đổi tên ngày 11 tháng 11 năm 2024. Việc làm là vận tải, dự án, kho và đại lý cảng."
  ),
  title: L("About Northgo", "關於 Northgo", "Northgo について", "Về Northgo"),
  lead: L(
    "A Taipei company since 1988. The name changed in 2024. The desks did not.",
    "1988 年起的台北公司。2024 年改了名字，窗口沒有換。",
    "1988 年からの台北の会社です。2024 年に名前が変わり、窓口は変わっていません。",
    "Công ty Đài Bắc từ 1988. Tên đổi năm 2024. Các bàn làm việc thì không."
  ),
  blocks: [
    {
      heading: L("What changed", "改了什麼", "変わったこと", "Điều đã đổi"),
      text: L(
        "On 11 November 2024 the company took the name Northgo. Before that it operated as Max Seair Logistics.",
        "2024 年 11 月 11 日公司定名為 Northgo。在那之前以 Max Seair Logistics 營運。",
        "2024 年 11 月 11 日に社名を Northgo としました。それ以前は Max Seair Logistics として事業をしていました。",
        "Ngày 11 tháng 11 năm 2024 công ty lấy tên Northgo. Trước đó hoạt động với tên Max Seair Logistics."
      )
    },
    {
      heading: L("What did not", "沒改什麼", "変わっていないこと", "Điều không đổi"),
      text: L(
        "Freight, project cargo, the Taichung warehouse, and port agency are still handled by the same office network.",
        "貨運、專案貨、台中倉庫與船務代理，仍由同一組辦公室處理。",
        "フレイト、プロジェクト貨物、台中の倉庫、港湾代理は、同じ拠点網が扱っています。",
        "Vận tải, hàng dự án, kho Đài Trung và đại lý cảng vẫn do cùng mạng văn phòng xử lý."
      )
    },
    {
      heading: L("How the company decides", "怎麼做決定", "判断の仕方", "Cách quyết định"),
      text: L(
        "The published standard is to do the right thing for the customer: say what the file can and cannot do, and keep the status with the office that holds it.",
        "公開的標準是對客戶做對的事：說清楚這票做得到與做不到的，狀態留在負責的辦公室。",
        "公開している基準は、顧客に対して正しいことをすることです。案件でできることとできないことを伝え、状況は担当拠点が持ちます。",
        "Chuẩn đã công bố là làm điều đúng với khách: nói rõ hồ sơ làm được và không làm được gì, tình trạng nằm ở văn phòng đang giữ."
      )
    },
    {
      heading: L("Certifications", "認證", "認証", "Chứng nhận"),
      text: L(
        "IATA covers the air-cargo practice. ISO 45001 covers occupational health and safety. AEO names Northgo as an authorized economic operator.",
        "IATA 對應空運作業。ISO 45001 對應職業安全衛生。AEO 表示 Northgo 為安全認證優質企業。",
        "IATA は航空貨物の実務、ISO 45001 は労働安全衛生、AEO は認定事業者であることを示します。",
        "IATA cho hoạt động hàng không. ISO 45001 cho an toàn sức khỏe nghề nghiệp. AEO xác nhận Northgo là nhà kinh doanh được chứng nhận."
      )
    }
  ]
};

export const legal = [
  {
    id: "privacy",
    slug: "legal/privacy-policy",
    title: L("Privacy policy", "隱私權政策", "プライバシーポリシー", "Chính sách bảo mật"),
    seoTitle: L("Privacy policy | Northgo", "隱私權政策｜Northgo", "プライバシーポリシー｜Northgo", "Chính sách bảo mật | Northgo"),
    description: L(
      "Northgo uses enquiry details to reply and to quote. The message goes to the office you select. The company does not sell that information.",
    "Northgo 用詢價資料回覆與準備報價，信件只寄到你選擇的辦公室。公司不出售這些資料，並在作業結束前保留紀錄。",
    "Northgo は見積と返信のために依頼内容を使い、送信先は選択した拠点だけです。情報は販売せず、案件が終わるまで記録を保持します。",
      "Northgo dùng dữ liệu yêu cầu để trả lời và báo giá. Thư gửi tới văn phòng bạn chọn. Công ty không bán thông tin đó."
    ),
    paragraphs: [
      L(
        "The enquiry form collects your name, company, email, phone, country, the shipment details you enter, and the office you select.",
        "詢價表收集姓名、公司、電子郵件、電話、國家或地區、你填寫的貨況，以及你選擇的辦公室。",
        "見積フォームは、氏名、会社、メール、電話、国・地域、入力した貨物情報、選択した拠点を受け取ります。",
        "Biểu mẫu thu thập họ tên, công ty, email, điện thoại, quốc gia hoặc vùng, thông tin lô hàng và văn phòng bạn chọn."
      ),
      L(
        "That information is used to answer the enquiry and to prepare a quotation. It is sent to the selected office email. Northgo does not sell it.",
        "這些資料用來回覆詢價與準備報價，並寄到所選辦公室的信箱。Northgo 不出售這些資料。",
        "この情報は返信と見積のために使い、選択した拠点のメールへ送ります。Northgo は販売しません。",
        "Thông tin được dùng để trả lời và lập báo giá, rồi gửi tới email văn phòng đã chọn. Northgo không bán dữ liệu."
      ),
      L(
        "The record is kept while the enquiry and any following shipment file are open. To ask for a copy or a correction, email info.tpe@northgo.com.",
        "資料在詢價與後續作業未結束前保留。若要索取副本或更正，請寫信至 info.tpe@northgo.com。",
        "記録は、依頼とそれに続く案件が開いている間保持します。写しや訂正は info.tpe@northgo.com へ。",
        "Hồ sơ được giữ khi yêu cầu và lô hàng tiếp theo còn mở. Để xin bản sao hoặc sửa, email info.tpe@northgo.com."
      )
    ]
  },
  {
    id: "terms",
    slug: "legal/terms",
    title: L("Terms of service", "服務條款", "利用規約", "Điều khoản dịch vụ"),
    seoTitle: L("Terms of service | Northgo", "服務條款｜Northgo", "利用規約｜Northgo", "Điều khoản dịch vụ | Northgo"),
    description: L(
      "Information on this site is general. A Northgo quotation is confirmed only when the office sends it. Carriage terms are not set by these pages.",
    "本網站資訊為一般說明。Northgo 的報價在所選辦公室寄出後才算確認。頁面上的時效、價格與艙位都不是承諾，也不構成運輸契約。",
    "このサイトの情報は一般説明です。見積は選択した拠点が送ったときに確定します。ページ上の日数、価格、スペースは約束ではなく、運送契約でもありません。",
      "Thông tin trên trang là mô tả chung. Báo giá Northgo chỉ xác nhận khi văn phòng gửi. Các trang này không phải hợp đồng vận tải."
    ),
    paragraphs: [
      L(
        "Pages describe the services Northgo offers. They are not a quotation, a booking, or a contract of carriage.",
        "頁面說明 Northgo 提供的服務。它們不是報價、訂艙或運輸契約。",
        "ページは Northgo のサービス説明です。見積、予約、運送契約ではありません。",
        "Các trang mô tả dịch vụ Northgo. Chúng không phải báo giá, đặt chỗ hay hợp đồng vận tải."
      ),
      L(
        "A quotation is confirmed only when the selected office sends it. Rates, space, and dates in an enquiry are requests, not a commitment.",
        "報價只有在所選辦公室寄出後才算確認。詢價裡的運價、艙位與日期是請求，不是承諾。",
        "見積は、選択した拠点が送ったときに確定します。依頼に書いた運賃、スペース、日付は依頼であり、確約ではありません。",
        "Báo giá chỉ xác nhận khi văn phòng đã chọn gửi nó. Giá, chỗ và ngày trong yêu cầu là đề nghị, không phải cam kết."
      ),
      L(
        "Questions about these terms go to info.tpe@northgo.com.",
        "關於條款的問題請寄至 info.tpe@northgo.com。",
        "本規約についての質問は info.tpe@northgo.com へ。",
        "Câu hỏi về điều khoản gửi tới info.tpe@northgo.com."
      )
    ]
  },
  {
    id: "cookie",
    slug: "legal/cookie-policy",
    title: L("Cookie policy", "Cookie 政策", "Cookie ポリシー", "Chính sách cookie"),
    seoTitle: L("Cookie policy | Northgo", "Cookie 政策｜Northgo", "Cookie ポリシー｜Northgo", "Chính sách cookie | Northgo"),
    description: L(
      "This site does not set analytics cookies unless a GTM container is configured. Essential browser storage is limited to the page you are using.",
    "除非在頁面設定 Google Tag Manager 容器，本網站不放置分析用 Cookie。詢價內容只留在瀏覽器，直到你寄出或離開頁面。",
    "ページに Google Tag Manager のコンテナを設定しない限り、分析用 Cookie は置きません。見積の入力は送信するか離れるまでブラウザ内だけに残ります。",
      "Trang không đặt cookie phân tích trừ khi đã cấu hình GTM. Lưu trữ trình duyệt chỉ phục vụ trang bạn đang dùng."
    ),
    paragraphs: [
      L(
        "The rebuilt site does not load an analytics tag until a Google Tag Manager container ID is added in the page metadata.",
        "在頁面 metadata 加入 Google Tag Manager 容器編號之前，重建後的網站不載入分析標籤。",
        "ページのメタデータに Google Tag Manager のコンテナ ID を入れるまで、分析タグは読み込みません。",
        "Trang không tải thẻ phân tích cho đến khi mã vùng chứa Google Tag Manager được thêm vào metadata."
      ),
      L(
        "The enquiry form keeps what you type in the browser only until you send or leave. It is not written to an advertising profile.",
        "詢價表在你送出或離開前，只把輸入內容留在瀏覽器，不會寫進廣告設定檔。",
        "見積フォームの入力は、送信するか離れるまでブラウザ内だけにあり、広告プロファイルには書きません。",
        "Biểu mẫu chỉ giữ nội dung bạn gõ trên trình duyệt cho đến khi gửi hoặc rời trang, không ghi vào hồ sơ quảng cáo."
      ),
      L(
        "If analytics is turned on later, this page will name the cookies that tag uses.",
        "若日後開啟分析，本頁會寫明該標籤使用的 Cookie。",
        "後日分析を有効にする場合、このページにそのタグの Cookie を記載します。",
        "Nếu sau này bật phân tích, trang này sẽ nêu cookie mà thẻ đó dùng."
      )
    ]
  },
  {
    id: "disclaimer",
    slug: "legal/disclaimer",
    title: L("Legal disclaimer", "法律聲明", "免責事項", "Tuyên bố pháp lý"),
    seoTitle: L("Legal disclaimer | Northgo", "法律聲明｜Northgo", "免責事項｜Northgo", "Tuyên bố pháp lý | Northgo"),
    description: L(
      "Service descriptions and anonymized examples explain how Northgo works. They are not a promise of transit time, price, or space.",
    "服務說明與匿名示例只解釋 Northgo 如何交接貨物，不具名、也不承諾時效、價格或艙位。地址與電話以各辦公室信箱確認的資料為準。",
    "サービス説明と匿名の作業例は、Northgo の引き渡し方を示すだけで、顧客名も日数・価格・スペースの約束も含まれません。住所と電話は各拠点のメールで確認します。",
      "Mô tả dịch vụ và ví dụ ẩn danh giải thích cách Northgo làm việc, không phải cam kết thời gian, giá hay chỗ."
    ),
    paragraphs: [
      L(
        "Transit time, price, and space are confirmed only in a quotation from the office. Examples on service pages do not name a customer and do not state a measured saving.",
        "時效、價格與艙位只以辦公室的報價為準。服務頁上的示例不具名，也不宣稱測得的節省。",
        "日数、価格、スペースは拠点の見積だけが確定です。サービスページの例は顧客名も、測定された削減額も示しません。",
        "Thời gian, giá và chỗ chỉ chốt trong báo giá của văn phòng. Ví dụ trên trang dịch vụ không nêu khách và không nêu khoản tiết kiệm đã đo."
      ),
      L(
        "Map geometry uses Natural Earth public-domain data. Address links may open Google Maps, which has its own terms.",
        "地圖圖形使用 Natural Earth 公共領域資料。地址連結可能開啟 Google 地圖，並適用其服務條款。",
        "地図形状には Natural Earth のパブリックドメインデータを使用しています。住所リンクは Google マップを開く場合があり、同サービスの規約が適用されます。",
        "Hình học bản đồ dùng dữ liệu thuộc phạm vi công cộng của Natural Earth. Liên kết địa chỉ có thể mở Google Maps và tuân theo điều khoản riêng của dịch vụ này."
      ),
      L(
        "Office addresses and phone numbers follow the published Northgo contact details. If a detail has changed, the office email is the check.",
        "辦公室地址與電話依 Northgo 已公開的聯絡資料。若有變更，以該辦公室信箱為準。",
        "住所と電話は公開されている Northgo の連絡先に従います。変更がある場合は拠点のメールで確認してください。",
        "Địa chỉ và điện thoại theo thông tin liên hệ Northgo đã công bố. Nếu có thay đổi, email văn phòng là nơi kiểm tra."
      )
    ]
  }
];

export const servicesIndex = {
  seoTitle: L(
    "Freight, projects, warehousing, and port agency | Northgo",
    "貨運、專案、倉儲與船務代理｜Northgo",
    "輸送、プロジェクト、倉庫、港湾代理｜Northgo",
    "Vận tải, dự án, kho và đại lý cảng | Northgo"
  ),
  description: L(
    "Northgo services are freight, project logistics, Taichung port warehousing, and shipping agency. Ocean, air, road, and customs each have a page.",
    "Northgo 的服務分為貨運、專案物流、台中港倉儲與船務代理。海運、空運、陸運與報關各有獨立頁面，每頁都能進入對應的詢價。",
    "Northgo のサービスは輸送、プロジェクト物流、台中港の倉庫、船舶代理です。海上、航空、陸上、通関はそれぞれ独立したページから見積へ進めます。",
    "Dịch vụ Northgo là vận tải, logistics dự án, kho cảng Đài Trung và đại lý tàu. Biển, hàng không, đường bộ và thông quan mỗi mục một trang."
  ),
  title: L("Services", "服務", "サービス", "Dịch vụ"),
  lead: L(
    "Four desks. Freight opens into ocean, air, road, and customs.",
    "四個窗口。貨運再分成海運、空運、陸運與報關。",
    "四つの窓口。フレイトは海上、航空、陸上、通関に分かれます。",
    "Bốn bàn. Vận tải mở ra đường biển, hàng không, đường bộ và thông quan."
  )
};

export const locationsCopy = {
  seoTitle: L(
    "Offices in Taiwan, Japan, Vietnam, and the United States | Northgo",
    "台灣、日本、越南與美國辦公室｜Northgo",
    "台湾・日本・ベトナム・米国の拠点｜Northgo",
    "Văn phòng tại Đài Loan, Nhật Bản, Việt Nam và Hoa Kỳ | Northgo"
  ),
  description: L(
    "Northgo offices in Taipei, Taichung, Kaohsiung, Tokyo, Osaka, Ho Chi Minh City, and Los Angeles, with address, phone, and email on one map.",
    "Northgo 在台北、台中、高雄、東京、大阪、胡志明市與洛杉磯的辦公室，地址、電話與信箱集中在同一張地圖，並可直接向該辦公室送出詢價。",
    "台北、台中、高雄、東京、大阪、ホーチミン、ロサンゼルスの Northgo 拠点です。住所、電話、メールを一つの地図にまとめ、その拠点へ見積を送れます。",
    "Văn phòng Northgo tại Đài Bắc, Đài Trung, Cao Hùng, Tokyo, Osaka, TP. Hồ Chí Minh và Los Angeles, với địa chỉ, điện thoại và email trên một bản đồ."
  ),
  title: L("Our global offices", "全球據點", "グローバル拠点", "Văn phòng toàn cầu"),
  lead: L(
    "All seven offices at once. Focus Taiwan, Japan, Southeast Asia, North America, or the whole map.",
    "七個辦公室一次看完。可聚焦台灣、日本、東南亞、北美，或看整張地圖。",
    "七拠点を一度に表示します。台湾、日本、東南アジア、北米、または全体に寄せられます。",
    "Bảy văn phòng cùng lúc. Phóng tới Đài Loan, Nhật Bản, Đông Nam Á, Bắc Mỹ hoặc cả bản đồ."
  )
};

export const contactCopy = {
  seoTitle: L(
    "Request a quotation | Northgo",
    "留下貨況、向辦公室詢價｜Northgo",
    "見積を依頼する｜Northgo",
    "Gửi yêu cầu báo giá | Northgo"
  ),
  description: L(
    "Send Northgo the origin, destination, cargo, ready date, and the office that should quote. The enquiry is emailed to that office.",
    "把起運地、目的地、貨型、件數、重量、體積、可出貨日與負責報價的辦公室交給 Northgo。詢價信寄到該辦公室，回覆之後才算正式報價。",
    "仕出地、仕向地、貨物タイプ、個数、重量、容積、準備日、見積する拠点を Northgo に送ります。依頼はその拠点へメールされ、返信があって見積になります。",
    "Gửi Northgo nơi đi, nơi đến, loại hàng, ngày sẵn sàng và văn phòng sẽ báo giá. Yêu cầu được email tới văn phòng đó."
  ),
  title: L("Enquire", "詢價", "見積依頼", "Yêu cầu báo giá"),
  lead: L(
    "Two steps. Who you are, then the shipment. Nothing is quoted until the office replies.",
    "兩個步驟：先留聯絡方式，再留貨況。辦公室回覆之前，都不算報價。",
    "二つの段階です。連絡先、それから貨物。拠点が返信するまで見積ではありません。",
    "Hai bước. Bạn là ai, rồi đến lô hàng. Chưa phải báo giá cho đến khi văn phòng trả lời."
  )
};
