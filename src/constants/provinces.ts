/**
 * Province to territory mapping used across the identification flow.
 */

export const PROVINCES_WITH_TERRITORIES: Record<string, string[]> = {
  'Bas-Uele': ['Aketi', 'Ango', 'Bambesa', 'Bondo', 'Buta', 'Poko'],
  Équateur: ['Basankusu', 'Bikoro', 'Bolomba', 'Bomongo', 'Ingende', 'Lukolela', 'Makanza'],
  'Haut-Katanga': ['Kambove', 'Kasenga', 'Kipushi', 'Mitwaba', 'Pweto', 'Sakania'],
  'Haut-Lomami': ['Bukama', 'Kabongo', 'Kamina', 'Kanyama or Kaniama', 'Malemba-Nkulu'],
  'Haut-Uele': ['Dungu', 'Faradje', 'Niangara', 'Rungu', 'Wamba', 'Watsa'],
  Ituri: ['Aru', 'Djugu', 'Irumu', 'Mahagi', 'Mambasa'],
  'Kasaï': ['Dekese', 'Ilebo', 'Kamonia or Tshikapa', 'Luebo', 'Mweka'],
  'Kasaï central': ['Demba', 'Dibaya', 'Dimbelenge', 'Kazumba', 'Luiza'],
  'Kasaï oriental': ['Kabeya-Kamwanga', 'Katanda', 'Lupatapata or Luhatahata', 'Miabi', 'Tshilenge'],
  Kinshasa: ['Kinshasa'],
  'Kongo-Central': ['Kasangulu', 'Kimvula', 'Lukula', 'Luozi', 'Madimba', 'Mbanza-Ngungu', 'Moanda', 'Seke-Banza', 'Songololo', 'Tshela'],
  Kwango: ['Feshi', 'Kahemba', 'Kasongo-Lunda', 'Kenge', 'Popokabaka'],
  Kwilu: ['Bagata', 'Bulungu', 'Gungu', 'Idiofa', 'Masi-Manimba'],
  Lomami: ['Ngandajika', 'Kabinda', 'Kamiji', 'Lubao', 'Luilu'],
  Lualaba: ['Dilolo', 'Kapanga', 'Lubudi', 'Mutshatsha', 'Sandoa'],
  'Mai-Ndombe': ['Bolobo', 'Inongo', 'Kiri', 'Kutu', 'Kwamouth', 'Mushie', 'Oshwe', 'Yumbi'],
  Maniema: ['Kabambare', 'Kailo', 'Kasongo', 'Kibombo', 'Lubutu', 'Pangi', 'Punia'],
  Mongala: ['Bongandanga', 'Bumba', 'Lisala'],
  'Nord-Kivu': ['Beni', 'Lubero', 'Masisi', 'Nyiragongo', 'Rutshuru', 'Walikale'],
  'Nord-Ubangi': ['Bosobolo', 'Businga', 'Mobayi-Mbongo', 'Yakoma'],
  'Sankuru': ['Katako-Kombe', 'Kole', 'Lodja', 'Lomela', 'Lubefu', 'Lusambo'],
  'Sud-Kivu': ['Fizi', 'Idjwi', 'Kabare', 'Kalehe', 'Mwenga', 'Shabunda', 'Uvira', 'Walungu'],
  'Sud-Ubangi': ['Budjala', 'Gemena', 'Kungu', 'Libenge'],
  Tanganyika: ['Kabalo', 'Kalemie', 'Kongolo', 'Manono', 'Moba', 'Nyunzu'],
  Tshopo: ['Bafwasende', 'Banalia', 'Basoko', 'Isangi', 'Opala', 'Ubundu', 'Yahuma'],
  Tshuapa: ['Befale', 'Boende', 'Bokungu', 'Djolu', 'Ikela', 'Monkoto'],
};

export const PROVINCE_OPTIONS = Object.keys(PROVINCES_WITH_TERRITORIES).map((province) => ({
  label: province,
  value: province,
}));

export const getTerritoryOptions = (province: string) =>
  (PROVINCES_WITH_TERRITORIES[province] || []).map((territory) => ({
    label: territory,
    value: territory,
  }));
