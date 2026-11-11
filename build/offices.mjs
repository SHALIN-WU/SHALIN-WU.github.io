import { L } from "./l10n.mjs";

export const offices = [
  {
    id: "tpe", region: "taiwan", area: "asia", hq: true, country: "TW",
    lat: 25.0575827, lng: 121.5384048,
    tel: "+886-2-2531-8677", fax: "+886-2-2531-8577", email: "info.tpe@northgo.com",
    name: L("Taipei", "台北", "台北", "Đài Bắc"),
    address: L(
      "7F., No. 10, Sec. 3, Minsheng E. Rd., Taipei City 104511, Taiwan",
      "台北市中山區民生東路三段 10 號 7 樓",
      "〒104511 台湾・台北市中山区民生東路三段10号 7階",
      "Tầng 7, số 10, đoạn 3, đường Dân Sinh Đông, Đài Bắc 104511, Đài Loan"
    )
  },
  {
    id: "txg", region: "taiwan", area: "asia", hq: false, country: "TW",
    lat: 24.2712994, lng: 120.5311579,
    tel: "+886-4-2326-2580", fax: "+886-4-2326-0308", email: "info.txg@northgo.com",
    name: L("Taichung", "台中", "台中", "Đài Trung"),
    address: L(
      "No. 4, Zhongheng 11th Rd., Taichung City 435058, Taiwan",
      "台中市梧棲區中橫十一路 4 號",
      "台湾・台中市梧棲区中横十一路4号",
      "Số 4, đường Zhongheng 11, Ngô Thê, Đài Trung 435058, Đài Loan"
    )
  },
  {
    id: "khh", region: "taiwan", area: "asia", hq: false, country: "TW",
    lat: 22.6164858, lng: 120.2934556,
    tel: "+886-7-335-0730", fax: "+886-7-336-4536", email: "info.khh@northgo.com",
    name: L("Kaohsiung", "高雄", "高雄", "Cao Hùng"),
    address: L(
      "19F-2, No. 31 Hai-Pien Rd., Kaohsiung City 802609, Taiwan",
      "高雄市苓雅區海邊路 31 號 19 樓之 2",
      "台湾・高雄市苓雅区海辺路31号 19階之2",
      "Tầng 19-2, số 31 đường Hai-Pien, Linh Nhã, Cao Hùng 802609, Đài Loan"
    )
  },
  {
    id: "tyo", region: "japan", area: "asia", hq: false, country: "JP",
    lat: 35.672801, lng: 139.774142,
    tel: "+81-3-6260-3944", fax: "+81-3-6260-3945", email: "info.tyo@northgo.com",
    name: L("Tokyo", "東京", "東京", "Tokyo"),
    address: L(
      "6F, Gran+Ginza-East, 1-5-1 Shintomi, Chuo-ku, Tokyo 104-0041, Japan",
      "東京都中央區新富 1-5-1 Gran+Ginza-East 6 樓",
      "〒104-0041 東京都中央区新富1-5-1 Gran+Ginza-East 6階",
      "Tầng 6, Gran+Ginza-East, 1-5-1 Shintomi, Chuo-ku, Tokyo 104-0041, Nhật Bản"
    )
  },
  {
    id: "osa", region: "japan", area: "asia", hq: false, country: "JP",
    lat: 34.6974271, lng: 135.4935556,
    tel: "+81-6-6676-8395", fax: "+81-6-6676-8397", email: "info.osa@northgo.com",
    name: L("Osaka", "大阪", "大阪", "Osaka"),
    address: L(
      "3F, Sakura-Bashi Build, 2-6-23 Sonezaki Shinchi, Kita-ku, Osaka 530-0002, Japan",
      "大阪市北區曾根崎新地 2-6-23 櫻橋大樓 3 樓",
      "〒530-0002 大阪市北区曽根崎新地2-6-23 桜橋ビル 3階",
      "Tầng 3, Sakura-Bashi Build, 2-6-23 Sonezaki Shinchi, Kita-ku, Osaka 530-0002, Nhật Bản"
    )
  },
  {
    id: "hcmc", region: "sea", area: "asia", hq: false, country: "VN",
    lat: 10.7909137, lng: 106.7190326,
    tel: "+84-28-9995-7368", fax: "", email: "info.hcmc@northgo.com",
    name: L("Ho Chi Minh City", "胡志明市", "ホーチミン", "TP. Hồ Chí Minh"),
    address: L(
      "5th Floor, No. 92D Nguyen Huu Canh Street, Ward 22, Binh Thanh District, Ho Chi Minh City, Vietnam",
      "胡志明市平盛郡第 22 坊阮友敬路 92D 號 5 樓",
      "ベトナム・ホーチミン市ビンタイン区第22坊 グエン・フー・カイン通り92D 5階",
      "Tầng 5, số 92D đường Nguyễn Hữu Cảnh, Phường 22, quận Bình Thạnh, TP. Hồ Chí Minh"
    )
  },
  {
    id: "lax", region: "na", area: "americas", hq: false, country: "US",
    lat: 34.0622117, lng: -118.1343114,
    tel: "+1-714-853-1088", fax: "", email: "info.lax@northgo.com",
    name: L("Los Angeles", "洛杉磯", "ロサンゼルス", "Los Angeles"),
    address: L(
      "119 S. Atlantic Blvd, Ste #301, Monterey Park, CA 91754, USA",
      "美國加州蒙特利公園市大西洋大道南 119 號 301 室",
      "119 S. Atlantic Blvd, Ste #301, Monterey Park, CA 91754, USA",
      "119 S. Atlantic Blvd, Ste #301, Monterey Park, CA 91754, Hoa Kỳ"
    )
  }
];
