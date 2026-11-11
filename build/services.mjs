import { L } from "./l10n.mjs";

const oceanCase = {
  cargo: L("FCL general merchandise", "整櫃一般貨", "FCL一般貨物", "Hàng tổng hợp nguyên container"),
  lane: L("Taichung or Kaohsiung to Los Angeles", "台中或高雄至洛杉磯", "台中または高雄からロサンゼルス", "Đài Trung hoặc Cao Hùng đến Los Angeles"),
  challenge: L(
    "The shipper needs a sailing that matches the consignee’s receiving window.",
    "貨主需要一班對得上收貨窗口的船期。",
    "荷主は荷受人の受入枠に合う本船を必要としています。",
    "Chủ hàng cần một chuyến tàu khớp khung nhận hàng của người nhận."
  ),
  approach: L(
    "Northgo books FCL with a contracted carrier and the Los Angeles office coordinates the destination handoff.",
    "Northgo 以合約船公司安排整櫃，洛杉磯辦公室接手目的地銜接。",
    "Northgo が契約船社で FCL を手配し、ロサンゼルス拠点が仕向地の引き渡しを受けます。",
    "Northgo đặt FCL với hãng tàu có hợp đồng, văn phòng Los Angeles nhận phần giao tại đích."
  ),
  result: L(
    "The cargo moves on the booked sailing, and the destination office handles delivery coordination.",
    "貨物搭上已訂船期，目的地辦公室負責後續配送銜接。",
    "貨物は予約した本船で動き、仕向地の拠点が配送の段取りを引き受けます。",
    "Hàng đi đúng chuyến đã đặt, văn phòng đích lo phần phối hợp giao."
  )
};

const airCase = {
  cargo: L("Urgent parts", "急件零件", "緊急部品", "Linh kiện gấp"),
  lane: L("Taipei to Tokyo", "台北至東京", "台北から東京", "Đài Bắc đến Tokyo"),
  challenge: L(
    "The parts have to make a short acceptance window at destination.",
    "零件必須趕上目的地很短的收貨時段。",
    "部品は仕向地の短い受入時間に間に合わせる必要があります。",
    "Linh kiện phải kịp khung nhận hàng rất ngắn tại đích."
  ),
  approach: L(
    "The Taipei team books the flight and the Tokyo office prepares the destination release.",
    "台北團隊訂位，東京辦公室準備目的地放貨。",
    "台北チームが便を手配し、東京拠点が仕向地の引き取りを準備します。",
    "Đội Đài Bắc đặt chuyến, văn phòng Tokyo chuẩn bị giao tại đích."
  ),
  result: L(
    "The freight is tendered to the booked flight and released through the Tokyo office.",
    "貨物交運已訂航班，並由東京辦公室放貨。",
    "貨物は予約便に引き渡され、東京拠点からリリースされます。",
    "Hàng được giao cho chuyến đã đặt và xuất qua văn phòng Tokyo."
  )
};

const landCase = {
  cargo: L("Import container", "進口貨櫃", "輸入コンテナ", "Container nhập"),
  lane: L("Taichung port to a delivery address in central Taiwan", "台中港至中台灣交貨地址", "台中港から台湾中部の配送先", "Cảng Đài Trung đến địa chỉ giao ở miền Trung Đài Loan"),
  challenge: L(
    "The box has to leave the port and reach a named address on the same file as the ocean move.",
    "貨櫃要離港，並與海運同一票送到指定地址。",
    "コンテナは港を出て、海上輸送と同じ案件で指定住所へ届く必要があります。",
    "Container phải rời cảng và tới đúng địa chỉ trên cùng hồ sơ với lô biển."
  ),
  approach: L(
    "The Taichung office arranges the truck and keeps the status on the shipment file.",
    "台中辦公室安排卡車，並把狀態記在同一票貨上。",
    "台中拠点がトラックを手配し、状況を同じ案件に残します。",
    "Văn phòng Đài Trung xếp xe và ghi tình trạng trên cùng lô hàng."
  ),
  result: L(
    "The container is picked up at the port and delivered to the address on the file.",
    "貨櫃自港口提領，送到檔案上的地址。",
    "コンテナは港でピックアップされ、案件の住所へ届きます。",
    "Container được lấy tại cảng và giao tới địa chỉ trong hồ sơ."
  )
};

const customsCase = {
  cargo: L("Imported machinery", "進口機械", "輸入機械", "Máy móc nhập khẩu"),
  lane: L("Into Taiwan", "進口台灣", "台湾向け輸入", "Nhập vào Đài Loan"),
  challenge: L(
    "The duty depends on the HS code agreed before filing.",
    "稅費取決於申報前確認的 HS Code。",
    "関税は申告前に合意した HS コードで決まります。",
    "Thuế phụ thuộc mã HS đã thống nhất trước khi khai."
  ),
  approach: L(
    "Northgo checks the classification with the shipper, then files the entry against that code.",
    "Northgo 與貨主確認稅則分類後，依該代碼申報。",
    "Northgo は荷主と分類を確認し、そのコードで申告します。",
    "Northgo đối chiếu phân loại với chủ hàng, rồi khai theo mã đó."
  ),
  result: L(
    "The entry is filed on the agreed code and the cargo is released for delivery.",
    "依約定稅則完成申報，貨物放行後交付運送。",
    "合意したコードで申告し、貨物は配送できる状態でリリースされます。",
    "Tờ khai dùng mã đã thống nhất và hàng được thông quan để giao."
  )
};

const projectCase = {
  cargo: L("Offshore wind components", "離岸風電構件", "洋上風力の部材", "Cấu kiện điện gió ngoài khơi"),
  lane: L("Sea freight into Taichung port, then storage and an inland move", "海運進台中港，再倉儲與內陸運送", "海上輸送で台中港へ入れ、保管後に内陸輸送", "Đường biển vào cảng Đài Trung, rồi lưu kho và vận chuyển nội địa"),
  challenge: L(
    "Large pieces need the vessel, the port warehouse, and the road move planned together.",
    "大型構件必須把船期、港口倉儲與公路運輸一起排。",
    "大型部材は本船、港の倉庫、陸上輸送をまとめて組む必要があります。",
    "Cấu kiện lớn cần xếp tàu, kho cảng và chặng đường bộ trong cùng một kế hoạch."
  ),
  approach: L(
    "The project desk coordinates the sea leg, the Taichung warehouse, and the inland delivery under one file.",
    "專案小組用同一票作業串起海運、台中倉與內陸運輸。",
    "プロジェクト担当が海上、台中の倉庫、内陸配送を一つの案件でつなぎます。",
    "Bàn dự án nối chặng biển, kho Đài Trung và giao nội địa trên một hồ sơ."
  ),
  result: L(
    "Components are staged at the port warehouse and released inland when the site is ready.",
    "構件先放在港口倉庫，工地可收貨時再內陸出庫。",
    "部材は港の倉庫で一旦置き、現場の受入ができてから内陸へ出します。",
    "Cấu kiện được tập kết tại kho cảng và xuất nội địa khi công trường nhận được."
  )
};

const warehouseCase = {
  cargo: L("Project equipment waiting for a site", "等待工地收貨的專案設備", "現場の受入を待つプロジェクト機材", "Thiết bị dự án chờ công trường nhận"),
  lane: L("Inbound to the Taichung port warehouse", "進倉至台中港倉庫", "台中港の倉庫へ入庫", "Nhập kho tại cảng Đài Trung"),
  challenge: L(
    "The equipment arrives by sea before the site can take it.",
    "設備海運抵港時，工地還不能收。",
    "機材は現場が受け取れるより先に船で着きます。",
    "Thiết bị tới bằng đường biển trước khi công trường nhận được."
  ),
  approach: L(
    "Northgo receives it into the Taichung warehouse and records the inventory until release.",
    "Northgo 收入台中倉庫並登錄庫存，直到出庫。",
    "Northgo は台中の倉庫で受け、出庫まで在庫を記録します。",
    "Northgo nhập kho Đài Trung và ghi tồn đến lúc xuất."
  ),
  result: L(
    "The cargo stays in the port warehouse and leaves when the project calls it out.",
    "貨物留在港口倉庫，專案叫貨時出庫。",
    "貨物は港の倉庫に残り、プロジェクトの呼び出しで出庫します。",
    "Hàng nằm tại kho cảng và xuất khi dự án gọi."
  )
};

const agencyCase = {
  cargo: L("A dry-bulk port call", "一艘乾散貨船的港口掛靠", "乾貨物船の寄港", "Một lượt cập cảng của tàu hàng rời"),
  lane: L("A Taiwan port, coordinated from Kaohsiung or Taipei", "台灣港口，由高雄或台北協調", "台湾の港。高雄または台北から調整", "Một cảng Đài Loan, điều phối từ Cao Hùng hoặc Đài Bắc"),
  challenge: L(
    "The owner needs an agent on the file before the vessel arrives.",
    "船東需要船舶抵港前就有代理進件。",
    "船主は入港前に代理が案件を持っている必要があります。",
    "Chủ tàu cần đại lý nhận hồ sơ trước khi tàu tới."
  ),
  approach: L(
    "The local desk handles port formalities and the husbandry items the owner requests.",
    "當地小組處理港口手續，以及船東交代的船務事項。",
    "現地拠点が港湾手続きと、船主が依頼したハスバンドリーを扱います。",
    "Bàn địa phương lo thủ tục cảng và hạng mục husbandry chủ tàu yêu cầu."
  ),
  result: L(
    "The call is coordinated with the port, and the owner receives the port report from the agent.",
    "掛靠由代理與港口協調，船東收到港口報告。",
    "寄港は代理が港と調整し、船主はポートレポートを受け取ります。",
    "Lượt cập được đại lý phối hợp với cảng, chủ tàu nhận báo cáo cảng."
  )
};

function point(title, text) {
  return { title, text };
}

export const services = [
  {
    id: "freight",
    slug: "services/freight-logistics",
    child: false,
    caseFrom: "ocean",
    title: L("Freight logistics", "貨運物流", "フレイトロジスティクス", "Vận tải hàng hóa"),
    seoTitle: L(
      "Freight logistics by ocean, air, road, and customs | Northgo",
      "海運、空運、陸運與報關貨運｜Northgo",
      "海上・航空・陸上輸送と通関｜Northgo",
      "Vận tải biển, hàng không, đường bộ và thông quan | Northgo"
    ),
    description: L(
      "Northgo handles ocean, air, and road freight plus customs clearance from offices in Taiwan, Japan, Vietnam, and the United States.",
      "Northgo 從台灣、日本、越南與美國的辦公室承作海運、空運、陸運與報關。四種方式各有頁面，詢價可指定起運地、目的地與負責報價的據點。",
      "Northgo は台湾・日本・ベトナム・米国の拠点で、海上・航空・陸上輸送と通関を扱います。四つのページから、仕出地、仕向地、担当拠点を指定して見積を依頼できます。",
      "Northgo nhận vận tải biển, hàng không, đường bộ và thông quan từ văn phòng tại Đài Loan, Nhật Bản, Việt Nam và Hoa Kỳ."
    ),
    eyebrow: L("Services", "服務", "サービス", "Dịch vụ"),
    lead: L(
      "One freight desk for the sailing, the flight, the truck, and the customs entry. Each mode has its own page.",
      "海運、空運、卡車與報關由同一組貨運窗口處理。每一種方式都有自己的頁面。",
      "本船、航空便、トラック、通関を一つの窓口で受けます。モードごとにページがあります。",
      "Một đầu mối cho chuyến tàu, chuyến bay, xe tải và tờ khai. Mỗi phương thức có trang riêng."
    ),
    solves: L(
      "Shippers use this when the move crosses more than one mode and should stay on one file.",
      "貨要跨過一種以上的運輸方式、又希望留在同一票時，從這裡開始。",
      "複数モードにまたがり、一つの案件に残したいときに使います。",
      "Dùng khi lô hàng đi hơn một phương thức và cần nằm trên một hồ sơ."
    ),
    points: [
      point(L("Ocean", "海運", "海上", "Đường biển"), L("FCL and LCL on contracted sailings.", "合約船期上的整櫃與併櫃。", "契約本船での FCL と LCL。", "FCL và LCL trên chuyến có hợp đồng.")),
      point(L("Air", "空運", "航空", "Hàng không"), L("Flight booking when the cargo cannot wait for a vessel.", "趕不及船期時改走航班。", "本船を待てない貨物の航空手配。", "Đặt chuyến bay khi hàng không chờ được tàu.")),
      point(L("Road", "陸運", "陸上", "Đường bộ"), L("The truck that joins the port, airport, or warehouse to the address.", "把港、機場或倉庫接到地址的卡車。", "港・空港・倉庫と住所をつなぐトラック。", "Xe nối cảng, sân bay hoặc kho với địa chỉ.")),
      point(L("Customs", "報關", "通関", "Thông quan"), L("HS code check and filing on the same shipment.", "同一票上的稅則確認與申報。", "同じ案件での HS 確認と申告。", "Kiểm mã HS và khai trên cùng lô."))
    ]
  },
  {
    id: "ocean",
    slug: "services/ocean-freight",
    child: true,
    parent: "freight",
    case: oceanCase,
    title: L("Ocean freight", "海運", "海上輸送", "Vận tải đường biển"),
    seoTitle: L(
      "Ocean freight, FCL and LCL | Northgo",
      "海運整櫃與併櫃｜Northgo",
      "海上輸送 FCL・LCL｜Northgo",
      "Vận tải đường biển FCL và LCL | Northgo"
    ),
    description: L(
      "FCL and LCL ocean freight with carrier contracts, origin and destination teams, and offices in Taiwan, the United States, Japan, and Vietnam.",
      "Northgo 承作整櫃與併櫃海運，向直接合約的船公司訂艙，並由起訖辦公室銜接台灣、美國、日本與越南。詢價請留下港口、貨型與可出貨日。",
      "FCL と LCL の海上輸送です。直接契約の船社と仕出・仕向の拠点で、台湾、米国、日本、ベトナムをつなぎます。見積には港、貨物タイプ、準備日を記入します。",
      "FCL và LCL với hợp đồng hãng tàu, đội gốc và đích, văn phòng tại Đài Loan, Hoa Kỳ, Nhật Bản và Việt Nam."
    ),
    eyebrow: L("Freight", "貨運", "フレイト", "Vận tải"),
    lead: L(
      "Full containers and consolidation, booked against a sailing the destination office can receive.",
      "整櫃與併櫃，訂在目的地辦公室接得住的船期上。",
      "本船は、仕向地の拠点が受け取れる日程で手配します。",
      "Nguyên container hoặc hàng lẻ, đặt trên chuyến mà văn phòng đích nhận được."
    ),
    solves: L(
      "Use ocean freight when the cargo can move by sea and the plan is cost, route, or a receiving window.",
      "貨物走得了海運，而且要比較運費、路線或收貨窗口時，用這項服務。",
      "海上で動かせて、運賃・ルート・受入枠を比べたいときに使います。",
      "Dùng khi hàng đi được bằng biển và cần so chi phí, tuyến hoặc khung nhận."
    ),
    points: [
      point(L("FCL", "整櫃", "FCL", "FCL"), L("A full container, with the carrier and the handover at both ends.", "一整櫃，含船公司與兩端交接。", "コンテナ単位。船社と両端の引き渡しを含みます。", "Một container, gồm hãng tàu và bàn giao hai đầu.")),
      point(L("LCL", "併櫃", "LCL", "LCL"), L("Consolidation when a full box is more than the shipment needs.", "貨量不到一整櫃時併櫃。", "一本に満たない貨物は混載にします。", "Hàng ghép khi không đủ một container.")),
      point(L("Carrier contracts", "船公司合約", "船社契約", "Hợp đồng hãng tàu"), L("Sailings are booked with carriers Northgo contracts directly.", "船期向 Northgo 直接合約的船公司訂。", "本船は Northgo が直接契約する船社で取ります。", "Chuyến được đặt với hãng Northgo ký trực tiếp.")),
      point(L("Both ends", "起訖兩地", "仕出と仕向", "Hai đầu"), L("Origin and destination offices adjust the route before the box is committed.", "訂艙前，起訖辦公室先對路線。", "予約を確定する前に、仕出と仕向でルートを合わせます。", "Văn phòng gốc và đích chốt tuyến trước khi khóa chỗ."))
    ]
  },
  {
    id: "air",
    slug: "services/air-freight",
    child: true,
    parent: "freight",
    case: airCase,
    title: L("Air freight", "空運", "航空輸送", "Vận tải hàng không"),
    seoTitle: L(
      "Air freight with origin and destination desks | Northgo",
      "空運訂位與目的地接貨｜Northgo",
      "航空輸送の予約と仕向地対応｜Northgo",
      "Vận tải hàng không, đặt chỗ và nhận tại đích | Northgo"
    ),
    description: L(
      "Air freight for cargo that cannot wait for a vessel. Taipei, Tokyo, Osaka, and the other Northgo offices book the flight and the release.",
      "趕不及船期的貨物改走空運。台北、東京、大阪與其他 Northgo 辦公室負責訂位、狀態回覆與目的地放貨，報關也可掛在同一票。",
      "本船を待てない貨物の航空輸送です。台北、東京、大阪などの拠点が予約、状況の回答、仕向地のリリースを扱い、通関も同じ案件に載せられます。",
      "Hàng không kịp tàu thì đi đường hàng không. Đài Bắc, Tokyo, Osaka và các văn phòng Northgo đặt chỗ và giao."
    ),
    eyebrow: L("Freight", "貨運", "フレイト", "Vận tải"),
    lead: L(
      "A booked flight, a status the shipper can ask for, and a Northgo office at the destination.",
      "先訂航班，貨主追問得到狀態，目的地有 Northgo 辦公室。",
      "先に便を押さえ、荷主が状況を確認でき、仕向地に Northgo の拠点があります。",
      "Có chuyến đã đặt, chủ hàng hỏi được tình trạng, và có văn phòng Northgo tại đích."
    ),
    solves: L(
      "Use air freight when the receiving date rules out the ocean schedule.",
      "收貨日排不進船期時，改走空運。",
      "受入日が本船の日程に合わないときは航空にします。",
      "Khi ngày nhận không khớp lịch tàu, chuyển sang hàng không."
    ),
    points: [
      point(L("Booking", "訂位", "予約", "Đặt chỗ"), L("Space and the rate are confirmed before pickup.", "提貨前先確認艙位與運價。", "集荷の前にスペースと運賃を確定します。", "Chốt chỗ và giá trước khi lấy hàng.")),
      point(L("Status", "狀態", "状況", "Tình trạng"), L("The office on the file can say where the freight is.", "這一票的辦公室答得了貨物在哪。", "担当拠点が、貨物の位置を答えられます。", "Văn phòng giữ hồ sơ trả lời được hàng đang ở đâu.")),
      point(L("Doors", "到門", "ドア", "Tận nơi"), L("Airport-to-airport, or a truck on either end when the file needs it.", "機場到機場，或視需要加上兩端卡車。", "空港間、または必要なら両端のトラック。", "Sân bay đến sân bay, hoặc thêm xe hai đầu khi hồ sơ cần.")),
      point(L("Clearance", "清關", "通関", "Thông quan"), L("Customs can sit on the same air file.", "報關可以掛在同一票空運上。", "通関は同じ航空案件に載せられます。", "Thông quan có thể nằm trên cùng hồ sơ hàng không."))
    ]
  },
  {
    id: "land",
    slug: "services/land-transport",
    child: true,
    parent: "freight",
    case: landCase,
    title: L("Land transport", "陸運", "陸上輸送", "Vận tải đường bộ"),
    seoTitle: L(
      "Port, airport, and warehouse trucking | Northgo",
      "港口、機場與倉庫卡車運輸｜Northgo",
      "港・空港・倉庫のトラック輸送｜Northgo",
      "Xe tải cảng, sân bay và kho | Northgo"
    ),
    description: L(
      "Trucking that connects a port, airport, or Northgo warehouse to the delivery address, arranged by the local office on the shipment.",
      "由該票貨的當地辦公室安排卡車，把港口、機場或 Northgo 倉庫接到交貨地址。狀態與海運、空運或倉儲留在同一票，不另開工單。",
      "担当拠点がトラックを手配し、港、空港、Northgo の倉庫と配送先をつなぎます。状況は海上、航空、倉庫と同じ案件で報告し、別作業にはしません。",
      "Xe do văn phòng địa phương của lô hàng xếp, nối cảng, sân bay hoặc kho Northgo với địa chỉ giao."
    ),
    eyebrow: L("Freight", "貨運", "フレイト", "Vận tải"),
    lead: L(
      "The road leg stays on the same file as the ocean, air, or warehouse move.",
      "公路這一段留在海運、空運或倉儲的同一票上。",
      "陸上区間は、海上・航空・倉庫と同じ案件に残します。",
      "Chặng đường bộ nằm trên cùng hồ sơ với đường biển, hàng không hoặc kho."
    ),
    solves: L(
      "Use land transport when the cargo is already, or still needs to be, at a port, airport, or warehouse.",
      "貨物已經在港、機場或倉庫，或還要送去那裡時，用陸運。",
      "貨物が港・空港・倉庫にある、またはそこへ向かうときに使います。",
      "Dùng khi hàng đang ở, hoặc cần tới, cảng, sân bay hoặc kho."
    ),
    points: [
      point(L("Port pickup", "港口提櫃", "港でのピックアップ", "Lấy tại cảng"), L("Import boxes leave the terminal on the local office’s truck plan.", "進口櫃依當地辦公室的卡車計畫離站。", "輸入コンテナは現地拠点の配車でターミナルを出ます。", "Container nhập rời cảng theo kế hoạch xe của văn phòng địa phương.")),
      point(L("Airport", "機場", "空港", "Sân bay"), L("The cartage matches the flight the air desk booked.", "拖車對得上航空組訂的航班。", "カートは航空担当が予約した便に合わせます。", "Xe khớp chuyến bay bàn hàng không đã đặt.")),
      point(L("Warehouse", "倉庫", "倉庫", "Kho"), L("Inbound and outbound at Taichung can include the truck.", "台中進出倉可以連卡車一起排。", "台中の入出庫はトラックとまとめて組めます。", "Nhập và xuất kho Đài Trung có thể kèm xe.")),
      point(L("One file", "同一票", "一つの案件", "Một hồ sơ"), L("Status is reported with the rest of the shipment, not as a separate job.", "狀態跟整票一起回報，不另開一張工單。", "状況は別作業にせず、貨物全体と一緒に報告します。", "Tình trạng báo cùng cả lô, không tách thành việc khác."))
    ]
  },
  {
    id: "customs",
    slug: "services/customs-clearance",
    child: true,
    parent: "freight",
    case: customsCase,
    title: L("Customs clearance", "報關", "通関", "Thông quan"),
    seoTitle: L(
      "Customs clearance and HS code checks | Northgo",
      "報關與 HS Code 確認｜Northgo",
      "通関と HS コード確認｜Northgo",
      "Thông quan và kiểm mã HS | Northgo"
    ),
    description: L(
      "Northgo checks the HS code with the shipper and files import or export entries on the same shipment as the transport.",
      "Northgo 先與貨主確認 HS Code，再在同一票海運、空運或專案上辦理進口或出口報關，把稅費問題留在貨物抵港之前。",
      "Northgo は荷主と HS コードを先に確認し、海上・航空・プロジェクトと同じ案件で輸入または輸出を申告します。税額の確認は到着前に行います。",
      "Northgo đối chiếu mã HS với chủ hàng và khai nhập hoặc xuất trên cùng lô vận tải."
    ),
    eyebrow: L("Freight", "貨運", "フレイト", "Vận tải"),
    lead: L(
      "Classification first, then the entry. The transport file and the customs file are the same job.",
      "先確認稅則，再申報。運輸與報關是同一件工作。",
      "先に分類、その後に申告。輸送と通関は同じ仕事です。",
      "Phân loại trước, khai sau. Vận tải và thông quan là một việc."
    ),
    solves: L(
      "Use customs clearance when duty, a permit, or a hold should be known before the cargo arrives.",
      "希望在貨物抵達前就知道稅費、許可或是否會被扣關時，先報關。",
      "到着前に税額、許可、保留の有無を把握したいときに使います。",
      "Dùng khi cần biết thuế, giấy phép hoặc rủi ro giữ hàng trước lúc hàng tới."
    ),
    points: [
      point(L("HS code", "稅則", "HS コード", "Mã HS"), L("The code is checked with the shipper before filing.", "申報前先與貨主核對稅則。", "申告前に荷主とコードを確認します。", "Đối chiếu mã với chủ hàng trước khi khai.")),
      point(L("Import and export", "進出口", "輸出入", "Nhập và xuất"), L("Entries are filed for cargo moving in or out.", "進出的貨物都可以申報。", "出入りする貨物の申告を扱います。", "Khai cho hàng đi vào hoặc đi ra.")),
      point(L("Same shipment", "同一票", "同じ案件", "Cùng lô"), L("Documents follow the ocean, air, road, or project file.", "文件跟著海運、空運、陸運或專案走。", "書類は海上・航空・陸上・プロジェクトの案件に付きます。", "Chứng từ đi theo hồ sơ biển, hàng không, đường bộ hoặc dự án.")),
      point(L("Before arrival", "抵港前", "到着前", "Trước khi tới"), L("Questions about duty are raised before the box is on the terminal.", "稅費問題在貨櫃進站前提出。", "税額の疑問は、コンテナがターミナルに着く前に出します。", "Câu hỏi về thuế được nêu trước khi container vào cảng.") )
    ]
  },
  {
    id: "project",
    slug: "services/project-logistics",
    child: false,
    case: projectCase,
    title: L("Project logistics", "專案物流", "プロジェクト物流", "Logistics dự án"),
    seoTitle: L(
      "Project logistics for heavy and oversized cargo | Northgo",
      "重貨與超尺寸專案物流｜Northgo",
      "重量物・大型貨物のプロジェクト物流｜Northgo",
      "Logistics dự án cho hàng nặng và quá khổ | Northgo"
    ),
    description: L(
      "Project logistics for oversized, heavy, and high-value cargo, including offshore wind components through Taichung port and the Northgo warehouse.",
      "Northgo 承作超尺寸、重貨與高價貨物的專案物流，含經台中港與倉庫轉運的離岸風電構件。路線、文件、租船與內陸運輸由同一窗口處理。",
      "大型・重量・高額貨物のプロジェクト物流です。台中港と倉庫を使う洋上風力部材を含み、ルート、書類、傭船、内陸輸送を同じ窓口が扱います。",
      "Logistics dự án cho hàng quá khổ, hàng nặng và hàng giá trị cao, gồm cấu kiện điện gió qua cảng Đài Trung và kho Northgo."
    ),
    eyebrow: L("Services", "服務", "サービス", "Dịch vụ"),
    lead: L(
      "One desk for the route, the documents, the vessel or barge, and the road that finishes the move.",
      "路線、文件、船舶或駁船，以及最後的公路，由同一組人排。",
      "ルート、書類、本船またはバージ、最後の陸上までを一つの担当が組みます。",
      "Một bàn lo tuyến, chứng từ, tàu hoặc sà lan, và chặng đường bộ cuối."
    ),
    solves: L(
      "Use project logistics when ordinary FCL or a standard truck cannot take the cargo.",
      "一般整櫃或標準卡車載不了時，改走專案物流。",
      "通常の FCL や標準トラックでは載らないときに使います。",
      "Dùng khi FCL thường hoặc xe tiêu chuẩn không chở được."
    ),
    points: [
      point(L("Route", "路線", "ルート", "Tuyến"), L("The path is checked before the cargo is committed, including permits where the road needs them.", "先確認路線，公路需要許可就先處理。", "貨物を確定する前に経路を確認し、必要な道路許可も先に扱います。", "Kiểm tuyến trước khi chốt hàng, gồm giấy phép đường nếu cần.")),
      point(L("Method", "工法", "工法", "Phương án"), L("The file can include a method statement and the drawings the move needs.", "作業可以附工法說明與這趟需要的圖說。", "必要なら工法説明と図面を案件に含めます。", "Hồ sơ có thể kèm thuyết minh phương án và bản vẽ chuyến đi cần.")),
      point(L("Heavy lift", "重吊", "ヘビーリフト", "Nâng hạ nặng"), L("Charter and lift arrangements stay with the same project desk.", "租船與吊運跟同一專案窗口。", "傭船と吊り上げは同じプロジェクト担当です。", "Thuê tàu và nâng hạ nằm cùng bàn dự án.")),
      point(L("HSE", "作業安全", "HSE", "HSE"), L("The move follows Northgo’s health and safety practice, backed by ISO 45001.", "作業依 Northgo 的職業安全作法，並以 ISO 45001 為制度。", "作業は Northgo の安全衛生に沿い、ISO 45001 を制度にしています。", "Thao tác theo thực hành an toàn của Northgo, với ISO 45001.")),
      point(L("Offshore wind", "離岸風電", "洋上風力", "Điện gió ngoài khơi"), L("Wind components are a published focus, with the Taichung warehouse in the plan.", "風電構件是已公開的作業重點，計畫裡包含台中倉庫。", "風力部材は公開している重点で、計画に台中の倉庫を入れます。", "Cấu kiện điện gió là trọng tâm đã công bố, kế hoạch gồm kho Đài Trung.")),
      point(L("Other projects", "其他專案", "その他の案件", "Dự án khác"), L("Marine and infrastructure cargo use the same desk when the pieces are oversized or heavy.", "海事與基礎建設的超尺寸或重貨，也走同一窗口。", "海事やインフラの大型・重量貨物も同じ窓口です。", "Hàng hải và hạ tầng quá khổ hoặc nặng cũng qua bàn này."))
    ]
  },
  {
    id: "warehouse",
    slug: "services/warehouse-logistics",
    child: false,
    case: warehouseCase,
    title: L("Warehouse logistics", "倉儲物流", "倉庫物流", "Kho bãi"),
    seoTitle: L(
      "Taichung port warehousing and offshore equipment | Northgo",
      "台中港倉儲與離岸設備儲運｜Northgo",
      "台中港の倉庫とオフショア機材｜Northgo",
      "Kho cảng Đài Trung và thiết bị ngoài khơi | Northgo"
    ),
    description: L(
      "Warehousing at Taichung port for project and offshore equipment, with inventory records, pick and pack, inspection, and container leasing.",
      "台中港倉儲服務專案與離岸設備，包含庫存紀錄、揀貨包裝、檢驗與 DNV 貨櫃租售。坪數與堆高在報價時確認，不把未核定數字寫成固定規格。",
      "台中港の倉庫で、プロジェクト機材とオフショア機材、在庫記録、ピックアンドパック、検品、DNV コンテナのリースを扱います。床面積と段積みは見積で確認します。",
      "Kho tại cảng Đài Trung cho thiết bị dự án và ngoài khơi, gồm ghi tồn, pick and pack, kiểm hàng và cho thuê container."
    ),
    eyebrow: L("Services", "服務", "サービス", "Dịch vụ"),
    lead: L(
      "Storage at Taichung port, on the same file as the vessel and the truck when the project needs both.",
      "倉在台中港。專案需要時，船舶與卡車寫在同一票。",
      "保管場所は台中港。必要な案件では本船とトラックを同じファイルにします。",
      "Kho tại cảng Đài Trung. Khi dự án cần, tàu và xe nằm trên cùng hồ sơ."
    ),
    solves: L(
      "Use the warehouse when cargo must wait, be prepared, or be staged before a site will take it.",
      "貨物要等待、整理，或在工地能收之前先集中時，用這座倉庫。",
      "貨物を待たせる、準備する、現場が受け取る前に揃えるときに使います。",
      "Dùng kho khi hàng phải chờ, được chuẩn bị, hoặc tập kết trước lúc công trường nhận."
    ),
    points: [
      point(L("Taichung port", "台中港", "台中港", "Cảng Đài Trung"), L("The published facility is at the port, on the sea-freight lane into central Taiwan.", "公開的倉庫在港區，接進中台灣的海運。", "公開している施設は港にあり、台湾中部へ入る海上レーン上です。", "Kho đã công bố nằm tại cảng, trên tuyến biển vào miền Trung Đài Loan.")),
      point(L("Inventory", "庫存", "在庫", "Tồn kho"), L("Stock is recorded so a release can be requested against the file.", "庫存有紀錄，可以按這一票申請出庫。", "在庫を記録し、案件に対して出庫を依頼できます。", "Tồn được ghi để có thể yêu cầu xuất theo hồ sơ.")),
      point(L("Preparation", "出貨準備", "出庫準備", "Chuẩn bị xuất"), L("Pick and pack, labeling, inspection, and repacking are available on request.", "可依需求揀貨、包裝、貼標、檢驗與重包。", "依頼に応じてピック、梱包、ラベル、検品、再梱包ができます。", "Có thể pick and pack, dán nhãn, kiểm và đóng lại khi được yêu cầu.")),
      point(L("Containers", "貨櫃", "コンテナ", "Container"), L("Leasing and sales include DNV-certified containers for offshore and industrial use.", "租售包含離岸與工業用途的 DNV 認證貨櫃。", "リースと販売には、オフショアと産業用途の DNV 認証コンテナを含みます。", "Cho thuê và bán gồm container chứng nhận DNV cho ngoài khơi và công nghiệp.")),
      point(L("Offshore equipment", "離岸設備", "オフショア機材", "Thiết bị ngoài khơi"), L("Wind and marine equipment can be staged here before the site call-off.", "風電與海事設備可在工地叫貨前先放這裡。", "風力・海事機材は、現場の呼び出し前にここで置けます。", "Thiết bị điện gió và hàng hải có thể tập kết tại đây trước khi công trường gọi.")),
      point(L("Capacity", "容量", "容量", "Sức chứa"), L("Floor area and stacking limits are confirmed on the quotation, not published as a standing figure.", "坪數與堆高在報價時確認，不把未核定數字寫成固定規格。", "床面積と段積み上限は見積で確認し、未確定の数字は固定仕様にしません。", "Diện tích và giới hạn xếp chồng được xác nhận lúc báo giá, không đăng như số cố định."))
    ]
  },
  {
    id: "agency",
    slug: "services/shipping-agency",
    child: false,
    case: agencyCase,
    title: L("Shipping agency", "船務代理", "船舶代理", "Đại lý tàu"),
    seoTitle: L(
      "Port agency for bulk, tanker, offshore, and liner calls | Northgo",
      "散裝、油輪、離岸與定線船港代理｜Northgo",
      "バルク・タンカー・オフショア・定期船の港湾代理｜Northgo",
      "Đại lý cảng cho tàu rời, tàu dầu, ngoài khơi và tàu tuyến | Northgo"
    ),
    description: L(
      "Port agency from the Taiwan desks: full, protective, bunkering, dry dock, and husbandry, across bulk, tanker, offshore, container, and car-carrier calls.",
      "台灣據點的港口代理，包含總代理、保護代理、加油、塢修與船務，服務散裝、油輪、離岸、貨櫃與汽車船。抵港前即可把掛靠交給高雄或台北窗口。",
      "台湾拠点の港湾代理です。総代理、保護代理、補油、入渠、ハスバンドリーを、バルク、タンカー、オフショア、コンテナ、自動車船で扱います。入港前に高雄または台北へ依頼できます。",
      "Đại lý cảng từ bàn Đài Loan: đại lý đầy đủ, bảo vệ, tiếp nhiên liệu, ụ khô và husbandry, cho tàu rời, tàu dầu, ngoài khơi, container và tàu chở ô tô."
    ),
    eyebrow: L("Services", "服務", "サービス", "Dịch vụ"),
    lead: L(
      "An agent on the file before arrival, for the port call and the husbandry the owner asks for.",
      "抵港前就有代理進件，處理掛靠與船東交代的船務。",
      "入港前に代理が案件を持ち、寄港と船主依頼のハスバンドリーを扱います。",
      "Có đại lý trên hồ sơ trước khi tàu tới, lo lượt cập và việc husbandry chủ tàu yêu cầu."
    ),
    solves: L(
      "Owners and operators use the agency desk when a vessel needs a Northgo agent at a Taiwan port.",
      "船舶要在台灣港口由 Northgo 代理時，找船務窗口。",
      "台湾の港で Northgo を代理にしたい船主・運航者向けです。",
      "Chủ tàu và người khai thác dùng bàn này khi cần đại lý Northgo tại cảng Đài Loan."
    ),
    points: [
      point(L("Agency types", "代理類型", "代理の種類", "Loại đại lý"), L("Full, protective, bunkering, dry dock, husbandry, and newbuilding delivery.", "總代理、保護代理、加油、塢修、船務與新船交付。", "総代理、保護代理、補油、入渠、ハスバンドリー、新造船の引き渡し。", "Đầy đủ, bảo vệ, tiếp nhiên liệu, ụ khô, husbandry và giao tàu đóng mới.")),
      point(L("Dry bulk and breakbulk", "乾散貨與件雜貨", "乾貨物と在来船", "Hàng rời và hàng rời kiện"), L("Bulk cargoes and project or heavy-lift ships.", "散裝貨，以及專案船、重吊船。", "バルク貨物と、プロジェクト船・ヘビーリフト船。", "Hàng rời và tàu dự án hoặc tàu nâng nặng.")),
      point(L("Tankers", "油輪", "タンカー", "Tàu dầu"), L("Chemical, crude, products, gas, and vegetable-oil tankers.", "化學品、原油、成品油、氣體與植物油輪。", "ケミカル、原油、プロダクト、ガス、植物油のタンカー。", "Tàu hóa chất, dầu thô, sản phẩm, khí và dầu thực vật.")),
      point(L("Offshore and specialist", "離岸與特殊船舶", "オフショアと特殊船", "Ngoài khơi và tàu đặc biệt"), L("Offshore units, cable ships, heavy-lift ships, and submersible or cable-lay barges.", "離岸工作船、佈纜船、重吊船，以及半潛或佈纜駁。", "オフショア船、ケーブル船、ヘビーリフト船、半潜水式や敷設バージ。", "Phương tiện ngoài khơi, tàu cáp, tàu nâng nặng, sà lan nửa chìm hoặc rải cáp.")),
      point(L("Liners", "定線船", "定期船", "Tàu tuyến"), L("Container ships and car carriers, including ferry and ro-ro.", "貨櫃船與汽車船，含渡輪與滾裝船。", "コンテナ船と自動車船。フェリーと RO/RO を含みます。", "Tàu container và tàu chở ô tô, gồm phà và ro-ro.")),
      point(L("On board", "船上事項", "本船まわり", "Việc trên tàu"), L("Spares, crew logistics, survey, underwater cleaning, and emergency response when the owner requests them.", "船東要求時，辦理備件、船員後勤、檢驗、水下清洗與緊急支援。", "船主の依頼で、部品、船員ロジ、検査、船体洗浄、緊急対応を扱います。", "Khi chủ tàu yêu cầu: phụ tùng, hậu cần thuyền viên, giám định, vệ sinh dưới nước và hỗ trợ khẩn.") )
    ]
  }
];

export const industry = {
  id: "offshore",
  slug: "industries/offshore-wind",
  title: L("Offshore wind", "離岸風電", "洋上風力", "Điện gió ngoài khơi"),
  seoTitle: L(
    "Offshore wind logistics through Taichung port | Northgo",
    "經台中港的離岸風電物流｜Northgo",
    "台中港を使う洋上風力の物流｜Northgo",
    "Logistics điện gió ngoài khơi qua cảng Đài Trung | Northgo"
  ),
  description: L(
    "Offshore wind components moved by sea into Taichung port, staged in the Northgo warehouse, and released inland under one project file.",
    "離岸風電構件以海運進入台中港，先在 Northgo 倉庫集中，工地可收貨時再依同一專案出庫，並安排內陸運輸與必要的道路許可。",
    "洋上風力の部材を海上で台中港へ入れ、Northgo の倉庫で揃えます。現場が受け取れる時点で同じ案件から出庫し、必要な道路許可も含めて内陸へ送ります。",
    "Cấu kiện điện gió vào cảng Đài Trung bằng đường biển, tập kết tại kho Northgo và xuất nội địa trên một hồ sơ dự án."
  ),
  eyebrow: L("Industry", "產業", "産業", "Ngành"),
  lead: L(
    "A wind component move is a project file: vessel, Taichung warehouse, and the road to the site.",
    "風電構件是一張專案：船舶、台中倉庫，以及到工地的公路。",
    "風力部材は一つのプロジェクトです。本船、台中の倉庫、現場までの道路。",
    "Cấu kiện điện gió là một hồ sơ dự án: tàu, kho Đài Trung và đường ra công trường."
  ),
  solves: L(
    "Developers and contractors use this when components cannot sit in a standard container lane.",
    "構件無法走一般貨櫃航線時，開發商與承包商用這條作業。",
    "部材が通常のコンテナ航路に載らないとき、開発事業者と施工者が使います。",
    "Chủ đầu tư và nhà thầu dùng khi cấu kiện không đi được tuyến container thông thường."
  ),
  points: [
    point(L("Sea leg", "海運段", "海上区間", "Chặng biển"), L("The project desk books the vessel or the space the pieces need.", "專案窗口訂構件需要的船或艙位。", "プロジェクト担当が、部材に必要な本船またはスペースを手配します。", "Bàn dự án đặt tàu hoặc chỗ mà cấu kiện cần.")),
    point(L("Port warehouse", "港口倉庫", "港の倉庫", "Kho cảng"), L("Taichung is the staging point already published for offshore equipment.", "台中是已公開的離岸設備集中點。", "台中は、オフショア機材の集約点として公開しています。", "Đài Trung là điểm tập kết thiết bị ngoài khơi đã được công bố.")),
    point(L("Call-off", "叫貨出庫", "呼び出し出庫", "Xuất theo lệnh"), L("Inventory stays recorded until the site asks for the pieces.", "工地叫貨前，庫存保持有紀錄。", "現場が求めるまで、在庫は記録されたままです。", "Tồn vẫn được ghi cho đến khi công trường gọi cấu kiện.")),
    point(L("Inland", "內陸", "内陸", "Nội địa"), L("The road move, including permits when the size needs them, stays on the same file.", "公路運輸含必要許可，留在同一票。", "寸法上必要な許可を含む陸上輸送も同じ案件です。", "Chặng đường bộ, kể cả giấy phép khi kích thước đòi hỏi, nằm trên cùng hồ sơ."))
  ],
  case: projectCase
};

export const cases = { ocean: oceanCase, air: airCase, land: landCase, customs: customsCase, project: projectCase, warehouse: warehouseCase, agency: agencyCase };
