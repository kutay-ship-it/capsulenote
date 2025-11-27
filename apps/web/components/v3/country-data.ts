/**
 * International address configuration for V3 address form
 * Complete list of 249 countries/territories with postal validation support
 */

export interface StateOption {
  value: string
  label: string
}

export interface CountryConfig {
  code: string
  name: string
  flag: string
  stateLabel: string | null // null = no state field shown
  postalLabel: string
  postalPlaceholder: string
  requiresState: boolean
  states?: StateOption[]
}

export interface CountryGroup {
  label: string
  countries: CountryConfig[]
}

// ============================================================================
// STATE/PROVINCE DATA FOR COUNTRIES REQUIRING THEM
// ============================================================================

const US_STATES: StateOption[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington DC" },
]

const CA_PROVINCES: StateOption[] = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
]

const AU_STATES: StateOption[] = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
]

const JP_PREFECTURES: StateOption[] = [
  { value: "01", label: "Hokkaido" },
  { value: "02", label: "Aomori" },
  { value: "03", label: "Iwate" },
  { value: "04", label: "Miyagi" },
  { value: "05", label: "Akita" },
  { value: "06", label: "Yamagata" },
  { value: "07", label: "Fukushima" },
  { value: "08", label: "Ibaraki" },
  { value: "09", label: "Tochigi" },
  { value: "10", label: "Gunma" },
  { value: "11", label: "Saitama" },
  { value: "12", label: "Chiba" },
  { value: "13", label: "Tokyo" },
  { value: "14", label: "Kanagawa" },
  { value: "15", label: "Niigata" },
  { value: "16", label: "Toyama" },
  { value: "17", label: "Ishikawa" },
  { value: "18", label: "Fukui" },
  { value: "19", label: "Yamanashi" },
  { value: "20", label: "Nagano" },
  { value: "21", label: "Gifu" },
  { value: "22", label: "Shizuoka" },
  { value: "23", label: "Aichi" },
  { value: "24", label: "Mie" },
  { value: "25", label: "Shiga" },
  { value: "26", label: "Kyoto" },
  { value: "27", label: "Osaka" },
  { value: "28", label: "Hyogo" },
  { value: "29", label: "Nara" },
  { value: "30", label: "Wakayama" },
  { value: "31", label: "Tottori" },
  { value: "32", label: "Shimane" },
  { value: "33", label: "Okayama" },
  { value: "34", label: "Hiroshima" },
  { value: "35", label: "Yamaguchi" },
  { value: "36", label: "Tokushima" },
  { value: "37", label: "Kagawa" },
  { value: "38", label: "Ehime" },
  { value: "39", label: "Kochi" },
  { value: "40", label: "Fukuoka" },
  { value: "41", label: "Saga" },
  { value: "42", label: "Nagasaki" },
  { value: "43", label: "Kumamoto" },
  { value: "44", label: "Oita" },
  { value: "45", label: "Miyazaki" },
  { value: "46", label: "Kagoshima" },
  { value: "47", label: "Okinawa" },
]

const MX_STATES: StateOption[] = [
  { value: "AGU", label: "Aguascalientes" },
  { value: "BCN", label: "Baja California" },
  { value: "BCS", label: "Baja California Sur" },
  { value: "CAM", label: "Campeche" },
  { value: "CHP", label: "Chiapas" },
  { value: "CHH", label: "Chihuahua" },
  { value: "CMX", label: "Ciudad de Mexico" },
  { value: "COA", label: "Coahuila" },
  { value: "COL", label: "Colima" },
  { value: "DUR", label: "Durango" },
  { value: "GUA", label: "Guanajuato" },
  { value: "GRO", label: "Guerrero" },
  { value: "HID", label: "Hidalgo" },
  { value: "JAL", label: "Jalisco" },
  { value: "MEX", label: "Mexico" },
  { value: "MIC", label: "Michoacan" },
  { value: "MOR", label: "Morelos" },
  { value: "NAY", label: "Nayarit" },
  { value: "NLE", label: "Nuevo Leon" },
  { value: "OAX", label: "Oaxaca" },
  { value: "PUE", label: "Puebla" },
  { value: "QUE", label: "Queretaro" },
  { value: "ROO", label: "Quintana Roo" },
  { value: "SLP", label: "San Luis Potosi" },
  { value: "SIN", label: "Sinaloa" },
  { value: "SON", label: "Sonora" },
  { value: "TAB", label: "Tabasco" },
  { value: "TAM", label: "Tamaulipas" },
  { value: "TLA", label: "Tlaxcala" },
  { value: "VER", label: "Veracruz" },
  { value: "YUC", label: "Yucatan" },
  { value: "ZAC", label: "Zacatecas" },
]

const BR_STATES: StateOption[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" },
  { value: "MA", label: "Maranhao" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" },
  { value: "PB", label: "Paraiba" },
  { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piaui" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const IN_STATES: StateOption[] = [
  { value: "AN", label: "Andaman and Nicobar Islands" },
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CH", label: "Chandigarh" },
  { value: "CT", label: "Chhattisgarh" },
  { value: "DN", label: "Dadra and Nagar Haveli" },
  { value: "DD", label: "Daman and Diu" },
  { value: "DL", label: "Delhi" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JK", label: "Jammu and Kashmir" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "LA", label: "Ladakh" },
  { value: "LD", label: "Lakshadweep" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OR", label: "Odisha" },
  { value: "PY", label: "Puducherry" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TG", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UT", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
]

const CN_PROVINCES: StateOption[] = [
  { value: "AH", label: "Anhui" },
  { value: "BJ", label: "Beijing" },
  { value: "CQ", label: "Chongqing" },
  { value: "FJ", label: "Fujian" },
  { value: "GS", label: "Gansu" },
  { value: "GD", label: "Guangdong" },
  { value: "GX", label: "Guangxi" },
  { value: "GZ", label: "Guizhou" },
  { value: "HI", label: "Hainan" },
  { value: "HE", label: "Hebei" },
  { value: "HL", label: "Heilongjiang" },
  { value: "HA", label: "Henan" },
  { value: "HK", label: "Hong Kong" },
  { value: "HB", label: "Hubei" },
  { value: "HN", label: "Hunan" },
  { value: "JS", label: "Jiangsu" },
  { value: "JX", label: "Jiangxi" },
  { value: "JL", label: "Jilin" },
  { value: "LN", label: "Liaoning" },
  { value: "MO", label: "Macau" },
  { value: "NM", label: "Inner Mongolia" },
  { value: "NX", label: "Ningxia" },
  { value: "QH", label: "Qinghai" },
  { value: "SN", label: "Shaanxi" },
  { value: "SD", label: "Shandong" },
  { value: "SH", label: "Shanghai" },
  { value: "SX", label: "Shanxi" },
  { value: "SC", label: "Sichuan" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tianjin" },
  { value: "XJ", label: "Xinjiang" },
  { value: "XZ", label: "Tibet" },
  { value: "YN", label: "Yunnan" },
  { value: "ZJ", label: "Zhejiang" },
]

// ============================================================================
// COUNTRY GROUPS - Organized by region
// ============================================================================

export const COUNTRY_GROUPS: CountryGroup[] = [
  {
    label: "North America",
    countries: [
      { code: "US", name: "United States", flag: "🇺🇸", stateLabel: "State", postalLabel: "ZIP Code", postalPlaceholder: "94102", requiresState: true, states: US_STATES },
      { code: "CA", name: "Canada", flag: "🇨🇦", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "A1A 1A1", requiresState: true, states: CA_PROVINCES },
      { code: "MX", name: "Mexico", flag: "🇲🇽", stateLabel: "State", postalLabel: "Codigo Postal", postalPlaceholder: "06600", requiresState: true, states: MX_STATES },
      { code: "BZ", name: "Belize", flag: "🇧🇿", stateLabel: "District", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "CR", name: "Costa Rica", flag: "🇨🇷", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "10101", requiresState: false },
      { code: "SV", name: "El Salvador", flag: "🇸🇻", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "1101", requiresState: false },
      { code: "GT", name: "Guatemala", flag: "🇬🇹", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "01001", requiresState: false },
      { code: "HN", name: "Honduras", flag: "🇭🇳", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "11101", requiresState: false },
      { code: "NI", name: "Nicaragua", flag: "🇳🇮", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "11001", requiresState: false },
      { code: "PA", name: "Panama", flag: "🇵🇦", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "0801", requiresState: false },
    ],
  },
  {
    label: "Caribbean",
    countries: [
      { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "BS", name: "Bahamas", flag: "🇧🇸", stateLabel: "Island", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "BB", name: "Barbados", flag: "🇧🇧", stateLabel: "Parish", postalLabel: "Postal Code", postalPlaceholder: "BB11000", requiresState: false },
      { code: "CU", name: "Cuba", flag: "🇨🇺", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "10100", requiresState: false },
      { code: "DM", name: "Dominica", flag: "🇩🇲", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "DO", name: "Dominican Republic", flag: "🇩🇴", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "10101", requiresState: false },
      { code: "GD", name: "Grenada", flag: "🇬🇩", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "HT", name: "Haiti", flag: "🇭🇹", stateLabel: "Department", postalLabel: "Code Postal", postalPlaceholder: "HT1110", requiresState: false },
      { code: "JM", name: "Jamaica", flag: "🇯🇲", stateLabel: "Parish", postalLabel: "Postal Code", postalPlaceholder: "JMAAW01", requiresState: false },
      { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "LC", name: "Saint Lucia", flag: "🇱🇨", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "VC", name: "Saint Vincent", flag: "🇻🇨", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "PR", name: "Puerto Rico", flag: "🇵🇷", stateLabel: null, postalLabel: "ZIP Code", postalPlaceholder: "00901", requiresState: false },
      { code: "VI", name: "U.S. Virgin Islands", flag: "🇻🇮", stateLabel: null, postalLabel: "ZIP Code", postalPlaceholder: "00801", requiresState: false },
    ],
  },
  {
    label: "South America",
    countries: [
      { code: "AR", name: "Argentina", flag: "🇦🇷", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "C1000", requiresState: false },
      { code: "BO", name: "Bolivia", flag: "🇧🇴", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "", requiresState: false },
      { code: "BR", name: "Brazil", flag: "🇧🇷", stateLabel: "State", postalLabel: "CEP", postalPlaceholder: "01310-100", requiresState: true, states: BR_STATES },
      { code: "CL", name: "Chile", flag: "🇨🇱", stateLabel: "Region", postalLabel: "Codigo Postal", postalPlaceholder: "7500000", requiresState: false },
      { code: "CO", name: "Colombia", flag: "🇨🇴", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "110111", requiresState: false },
      { code: "EC", name: "Ecuador", flag: "🇪🇨", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "170150", requiresState: false },
      { code: "GY", name: "Guyana", flag: "🇬🇾", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "PY", name: "Paraguay", flag: "🇵🇾", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "1209", requiresState: false },
      { code: "PE", name: "Peru", flag: "🇵🇪", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "15001", requiresState: false },
      { code: "SR", name: "Suriname", flag: "🇸🇷", stateLabel: "District", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "UY", name: "Uruguay", flag: "🇺🇾", stateLabel: "Department", postalLabel: "Codigo Postal", postalPlaceholder: "11000", requiresState: false },
      { code: "VE", name: "Venezuela", flag: "🇻🇪", stateLabel: "State", postalLabel: "Codigo Postal", postalPlaceholder: "1010", requiresState: false },
    ],
  },
  {
    label: "Western Europe",
    countries: [
      { code: "GB", name: "United Kingdom", flag: "🇬🇧", stateLabel: "County", postalLabel: "Postcode", postalPlaceholder: "SW1A 1AA", requiresState: false },
      { code: "IE", name: "Ireland", flag: "🇮🇪", stateLabel: "County", postalLabel: "Eircode", postalPlaceholder: "D02 XY00", requiresState: false },
      { code: "FR", name: "France", flag: "🇫🇷", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "75001", requiresState: false },
      { code: "DE", name: "Germany", flag: "🇩🇪", stateLabel: null, postalLabel: "PLZ", postalPlaceholder: "10115", requiresState: false },
      { code: "AT", name: "Austria", flag: "🇦🇹", stateLabel: null, postalLabel: "PLZ", postalPlaceholder: "1010", requiresState: false },
      { code: "CH", name: "Switzerland", flag: "🇨🇭", stateLabel: "Canton", postalLabel: "PLZ", postalPlaceholder: "8001", requiresState: false },
      { code: "NL", name: "Netherlands", flag: "🇳🇱", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "1012 AB", requiresState: false },
      { code: "BE", name: "Belgium", flag: "🇧🇪", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "1000", requiresState: false },
      { code: "LU", name: "Luxembourg", flag: "🇱🇺", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "1111", requiresState: false },
      { code: "MC", name: "Monaco", flag: "🇲🇨", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "98000", requiresState: false },
      { code: "LI", name: "Liechtenstein", flag: "🇱🇮", stateLabel: null, postalLabel: "PLZ", postalPlaceholder: "9490", requiresState: false },
      { code: "AD", name: "Andorra", flag: "🇦🇩", stateLabel: null, postalLabel: "Codi Postal", postalPlaceholder: "AD500", requiresState: false },
    ],
  },
  {
    label: "Northern Europe",
    countries: [
      { code: "SE", name: "Sweden", flag: "🇸🇪", stateLabel: null, postalLabel: "Postnummer", postalPlaceholder: "111 22", requiresState: false },
      { code: "NO", name: "Norway", flag: "🇳🇴", stateLabel: null, postalLabel: "Postnummer", postalPlaceholder: "0010", requiresState: false },
      { code: "DK", name: "Denmark", flag: "🇩🇰", stateLabel: null, postalLabel: "Postnummer", postalPlaceholder: "1000", requiresState: false },
      { code: "FI", name: "Finland", flag: "🇫🇮", stateLabel: null, postalLabel: "Postinumero", postalPlaceholder: "00100", requiresState: false },
      { code: "IS", name: "Iceland", flag: "🇮🇸", stateLabel: null, postalLabel: "Postnumer", postalPlaceholder: "101", requiresState: false },
      { code: "EE", name: "Estonia", flag: "🇪🇪", stateLabel: null, postalLabel: "Postiindeks", postalPlaceholder: "10111", requiresState: false },
      { code: "LV", name: "Latvia", flag: "🇱🇻", stateLabel: null, postalLabel: "Pasta Indekss", postalPlaceholder: "LV-1001", requiresState: false },
      { code: "LT", name: "Lithuania", flag: "🇱🇹", stateLabel: null, postalLabel: "Pasto Kodas", postalPlaceholder: "01001", requiresState: false },
    ],
  },
  {
    label: "Southern Europe",
    countries: [
      { code: "ES", name: "Spain", flag: "🇪🇸", stateLabel: "Province", postalLabel: "Codigo Postal", postalPlaceholder: "28001", requiresState: false },
      { code: "PT", name: "Portugal", flag: "🇵🇹", stateLabel: null, postalLabel: "Codigo Postal", postalPlaceholder: "1000-001", requiresState: false },
      { code: "IT", name: "Italy", flag: "🇮🇹", stateLabel: "Province", postalLabel: "CAP", postalPlaceholder: "00100", requiresState: false },
      { code: "GR", name: "Greece", flag: "🇬🇷", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "104 31", requiresState: false },
      { code: "MT", name: "Malta", flag: "🇲🇹", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "VLT 1000", requiresState: false },
      { code: "CY", name: "Cyprus", flag: "🇨🇾", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "SM", name: "San Marino", flag: "🇸🇲", stateLabel: null, postalLabel: "CAP", postalPlaceholder: "47890", requiresState: false },
      { code: "VA", name: "Vatican City", flag: "🇻🇦", stateLabel: null, postalLabel: "CAP", postalPlaceholder: "00120", requiresState: false },
      { code: "GI", name: "Gibraltar", flag: "🇬🇮", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "GX11 1AA", requiresState: false },
    ],
  },
  {
    label: "Eastern Europe",
    countries: [
      { code: "PL", name: "Poland", flag: "🇵🇱", stateLabel: null, postalLabel: "Kod Pocztowy", postalPlaceholder: "00-001", requiresState: false },
      { code: "CZ", name: "Czech Republic", flag: "🇨🇿", stateLabel: null, postalLabel: "PSC", postalPlaceholder: "110 00", requiresState: false },
      { code: "SK", name: "Slovakia", flag: "🇸🇰", stateLabel: null, postalLabel: "PSC", postalPlaceholder: "811 01", requiresState: false },
      { code: "HU", name: "Hungary", flag: "🇭🇺", stateLabel: null, postalLabel: "Iranyitoszam", postalPlaceholder: "1000", requiresState: false },
      { code: "RO", name: "Romania", flag: "🇷🇴", stateLabel: "County", postalLabel: "Cod Postal", postalPlaceholder: "010001", requiresState: false },
      { code: "BG", name: "Bulgaria", flag: "🇧🇬", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "HR", name: "Croatia", flag: "🇭🇷", stateLabel: null, postalLabel: "Postanski Broj", postalPlaceholder: "10000", requiresState: false },
      { code: "SI", name: "Slovenia", flag: "🇸🇮", stateLabel: null, postalLabel: "Postna Stevilka", postalPlaceholder: "1000", requiresState: false },
      { code: "RS", name: "Serbia", flag: "🇷🇸", stateLabel: null, postalLabel: "Postanski Broj", postalPlaceholder: "11000", requiresState: false },
      { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", stateLabel: null, postalLabel: "Postanski Broj", postalPlaceholder: "71000", requiresState: false },
      { code: "ME", name: "Montenegro", flag: "🇲🇪", stateLabel: null, postalLabel: "Postanski Broj", postalPlaceholder: "81000", requiresState: false },
      { code: "MK", name: "North Macedonia", flag: "🇲🇰", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "AL", name: "Albania", flag: "🇦🇱", stateLabel: null, postalLabel: "Kodi Postar", postalPlaceholder: "1001", requiresState: false },
      { code: "XK", name: "Kosovo", flag: "🇽🇰", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "10000", requiresState: false },
      { code: "UA", name: "Ukraine", flag: "🇺🇦", stateLabel: "Oblast", postalLabel: "Postal Code", postalPlaceholder: "01001", requiresState: false },
      { code: "BY", name: "Belarus", flag: "🇧🇾", stateLabel: "Oblast", postalLabel: "Postal Code", postalPlaceholder: "220000", requiresState: false },
      { code: "MD", name: "Moldova", flag: "🇲🇩", stateLabel: null, postalLabel: "Cod Postal", postalPlaceholder: "MD-2000", requiresState: false },
      { code: "RU", name: "Russia", flag: "🇷🇺", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "101000", requiresState: false },
    ],
  },
  {
    label: "Middle East",
    countries: [
      { code: "TR", name: "Turkey", flag: "🇹🇷", stateLabel: "Province", postalLabel: "Posta Kodu", postalPlaceholder: "34000", requiresState: false },
      { code: "IL", name: "Israel", flag: "🇮🇱", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "6100000", requiresState: false },
      { code: "PS", name: "Palestine", flag: "🇵🇸", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "JO", name: "Jordan", flag: "🇯🇴", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "11110", requiresState: false },
      { code: "LB", name: "Lebanon", flag: "🇱🇧", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "1100", requiresState: false },
      { code: "SY", name: "Syria", flag: "🇸🇾", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "IQ", name: "Iraq", flag: "🇮🇶", stateLabel: "Governorate", postalLabel: "Postal Code", postalPlaceholder: "10001", requiresState: false },
      { code: "IR", name: "Iran", flag: "🇮🇷", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "1111111111", requiresState: false },
      { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "11564", requiresState: false },
      { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", stateLabel: "Emirate", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "QA", name: "Qatar", flag: "🇶🇦", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "BH", name: "Bahrain", flag: "🇧🇭", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "KW", name: "Kuwait", flag: "🇰🇼", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "12345", requiresState: false },
      { code: "OM", name: "Oman", flag: "🇴🇲", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "100", requiresState: false },
      { code: "YE", name: "Yemen", flag: "🇾🇪", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
    ],
  },
  {
    label: "Central Asia",
    countries: [
      { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "010000", requiresState: false },
      { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "100000", requiresState: false },
      { code: "TM", name: "Turkmenistan", flag: "🇹🇲", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "744000", requiresState: false },
      { code: "TJ", name: "Tajikistan", flag: "🇹🇯", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "734000", requiresState: false },
      { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "720000", requiresState: false },
      { code: "AF", name: "Afghanistan", flag: "🇦🇫", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "1001", requiresState: false },
      { code: "MN", name: "Mongolia", flag: "🇲🇳", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "14200", requiresState: false },
    ],
  },
  {
    label: "South Asia",
    countries: [
      { code: "IN", name: "India", flag: "🇮🇳", stateLabel: "State", postalLabel: "PIN Code", postalPlaceholder: "110001", requiresState: true, states: IN_STATES },
      { code: "PK", name: "Pakistan", flag: "🇵🇰", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "44000", requiresState: false },
      { code: "BD", name: "Bangladesh", flag: "🇧🇩", stateLabel: "Division", postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "LK", name: "Sri Lanka", flag: "🇱🇰", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "00100", requiresState: false },
      { code: "NP", name: "Nepal", flag: "🇳🇵", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "44600", requiresState: false },
      { code: "BT", name: "Bhutan", flag: "🇧🇹", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "11001", requiresState: false },
      { code: "MV", name: "Maldives", flag: "🇲🇻", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "20001", requiresState: false },
    ],
  },
  {
    label: "East Asia",
    countries: [
      { code: "CN", name: "China", flag: "🇨🇳", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "100000", requiresState: true, states: CN_PROVINCES },
      { code: "JP", name: "Japan", flag: "🇯🇵", stateLabel: "Prefecture", postalLabel: "Postal Code", postalPlaceholder: "100-0001", requiresState: true, states: JP_PREFECTURES },
      { code: "KR", name: "South Korea", flag: "🇰🇷", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "06236", requiresState: false },
      { code: "KP", name: "North Korea", flag: "🇰🇵", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "TW", name: "Taiwan", flag: "🇹🇼", stateLabel: "County/City", postalLabel: "Postal Code", postalPlaceholder: "100", requiresState: false },
      { code: "HK", name: "Hong Kong", flag: "🇭🇰", stateLabel: "District", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "MO", name: "Macau", flag: "🇲🇴", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
    ],
  },
  {
    label: "Southeast Asia",
    countries: [
      { code: "SG", name: "Singapore", flag: "🇸🇬", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "018956", requiresState: false },
      { code: "MY", name: "Malaysia", flag: "🇲🇾", stateLabel: "State", postalLabel: "Postcode", postalPlaceholder: "50000", requiresState: false },
      { code: "ID", name: "Indonesia", flag: "🇮🇩", stateLabel: "Province", postalLabel: "Kode Pos", postalPlaceholder: "10110", requiresState: false },
      { code: "TH", name: "Thailand", flag: "🇹🇭", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "10100", requiresState: false },
      { code: "VN", name: "Vietnam", flag: "🇻🇳", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "100000", requiresState: false },
      { code: "PH", name: "Philippines", flag: "🇵🇭", stateLabel: "Province", postalLabel: "ZIP Code", postalPlaceholder: "1000", requiresState: false },
      { code: "MM", name: "Myanmar", flag: "🇲🇲", stateLabel: "State/Region", postalLabel: "Postal Code", postalPlaceholder: "11181", requiresState: false },
      { code: "KH", name: "Cambodia", flag: "🇰🇭", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "12000", requiresState: false },
      { code: "LA", name: "Laos", flag: "🇱🇦", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "01000", requiresState: false },
      { code: "BN", name: "Brunei", flag: "🇧🇳", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "BS8811", requiresState: false },
      { code: "TL", name: "Timor-Leste", flag: "🇹🇱", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
    ],
  },
  {
    label: "Oceania",
    countries: [
      { code: "AU", name: "Australia", flag: "🇦🇺", stateLabel: "State", postalLabel: "Postcode", postalPlaceholder: "2000", requiresState: true, states: AU_STATES },
      { code: "NZ", name: "New Zealand", flag: "🇳🇿", stateLabel: null, postalLabel: "Postcode", postalPlaceholder: "1010", requiresState: false },
      { code: "FJ", name: "Fiji", flag: "🇫🇯", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "111", requiresState: false },
      { code: "SB", name: "Solomon Islands", flag: "🇸🇧", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "VU", name: "Vanuatu", flag: "🇻🇺", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "NC", name: "New Caledonia", flag: "🇳🇨", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "98800", requiresState: false },
      { code: "PF", name: "French Polynesia", flag: "🇵🇫", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "98713", requiresState: false },
      { code: "WS", name: "Samoa", flag: "🇼🇸", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "TO", name: "Tonga", flag: "🇹🇴", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "KI", name: "Kiribati", flag: "🇰🇮", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "FM", name: "Micronesia", flag: "🇫🇲", stateLabel: "State", postalLabel: "ZIP Code", postalPlaceholder: "96941", requiresState: false },
      { code: "MH", name: "Marshall Islands", flag: "🇲🇭", stateLabel: null, postalLabel: "ZIP Code", postalPlaceholder: "96960", requiresState: false },
      { code: "PW", name: "Palau", flag: "🇵🇼", stateLabel: null, postalLabel: "ZIP Code", postalPlaceholder: "96940", requiresState: false },
      { code: "NR", name: "Nauru", flag: "🇳🇷", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "TV", name: "Tuvalu", flag: "🇹🇻", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "GU", name: "Guam", flag: "🇬🇺", stateLabel: null, postalLabel: "ZIP Code", postalPlaceholder: "96910", requiresState: false },
    ],
  },
  {
    label: "North Africa",
    countries: [
      { code: "EG", name: "Egypt", flag: "🇪🇬", stateLabel: "Governorate", postalLabel: "Postal Code", postalPlaceholder: "11511", requiresState: false },
      { code: "LY", name: "Libya", flag: "🇱🇾", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "TN", name: "Tunisia", flag: "🇹🇳", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "1000", requiresState: false },
      { code: "DZ", name: "Algeria", flag: "🇩🇿", stateLabel: "Province", postalLabel: "Code Postal", postalPlaceholder: "16000", requiresState: false },
      { code: "MA", name: "Morocco", flag: "🇲🇦", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "10000", requiresState: false },
      { code: "SD", name: "Sudan", flag: "🇸🇩", stateLabel: "State", postalLabel: "Postal Code", postalPlaceholder: "11111", requiresState: false },
      { code: "SS", name: "South Sudan", flag: "🇸🇸", stateLabel: "State", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
    ],
  },
  {
    label: "West Africa",
    countries: [
      { code: "NG", name: "Nigeria", flag: "🇳🇬", stateLabel: "State", postalLabel: "Postal Code", postalPlaceholder: "100001", requiresState: false },
      { code: "GH", name: "Ghana", flag: "🇬🇭", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "GA000", requiresState: false },
      { code: "CI", name: "Ivory Coast", flag: "🇨🇮", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "SN", name: "Senegal", flag: "🇸🇳", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "10000", requiresState: false },
      { code: "ML", name: "Mali", flag: "🇲🇱", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "BF", name: "Burkina Faso", flag: "🇧🇫", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "NE", name: "Niger", flag: "🇳🇪", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "GM", name: "Gambia", flag: "🇬🇲", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "GN", name: "Guinea", flag: "🇬🇳", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "SL", name: "Sierra Leone", flag: "🇸🇱", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "LR", name: "Liberia", flag: "🇱🇷", stateLabel: "County", postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "TG", name: "Togo", flag: "🇹🇬", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "BJ", name: "Benin", flag: "🇧🇯", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "MR", name: "Mauritania", flag: "🇲🇷", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "CV", name: "Cape Verde", flag: "🇨🇻", stateLabel: null, postalLabel: "Codigo Postal", postalPlaceholder: "1000", requiresState: false },
    ],
  },
  {
    label: "Central Africa",
    countries: [
      { code: "CM", name: "Cameroon", flag: "🇨🇲", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "CD", name: "DR Congo", flag: "🇨🇩", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "CG", name: "Congo", flag: "🇨🇬", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "CF", name: "Central African Republic", flag: "🇨🇫", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "TD", name: "Chad", flag: "🇹🇩", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "GA", name: "Gabon", flag: "🇬🇦", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "", requiresState: false },
      { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "ST", name: "Sao Tome and Principe", flag: "🇸🇹", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "AO", name: "Angola", flag: "🇦🇴", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
    ],
  },
  {
    label: "East Africa",
    countries: [
      { code: "KE", name: "Kenya", flag: "🇰🇪", stateLabel: "County", postalLabel: "Postal Code", postalPlaceholder: "00100", requiresState: false },
      { code: "TZ", name: "Tanzania", flag: "🇹🇿", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "UG", name: "Uganda", flag: "🇺🇬", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "RW", name: "Rwanda", flag: "🇷🇼", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "BI", name: "Burundi", flag: "🇧🇮", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "ET", name: "Ethiopia", flag: "🇪🇹", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "1000", requiresState: false },
      { code: "ER", name: "Eritrea", flag: "🇪🇷", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "DJ", name: "Djibouti", flag: "🇩🇯", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "SO", name: "Somalia", flag: "🇸🇴", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "MG", name: "Madagascar", flag: "🇲🇬", stateLabel: "Region", postalLabel: "Code Postal", postalPlaceholder: "101", requiresState: false },
      { code: "MU", name: "Mauritius", flag: "🇲🇺", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "SC", name: "Seychelles", flag: "🇸🇨", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "KM", name: "Comoros", flag: "🇰🇲", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "RE", name: "Reunion", flag: "🇷🇪", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "97400", requiresState: false },
      { code: "YT", name: "Mayotte", flag: "🇾🇹", stateLabel: null, postalLabel: "Code Postal", postalPlaceholder: "97600", requiresState: false },
    ],
  },
  {
    label: "Southern Africa",
    countries: [
      { code: "ZA", name: "South Africa", flag: "🇿🇦", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "2000", requiresState: false },
      { code: "NA", name: "Namibia", flag: "🇳🇦", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "10001", requiresState: false },
      { code: "BW", name: "Botswana", flag: "🇧🇼", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "ZM", name: "Zambia", flag: "🇿🇲", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "10101", requiresState: false },
      { code: "MW", name: "Malawi", flag: "🇲🇼", stateLabel: "Region", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "MZ", name: "Mozambique", flag: "🇲🇿", stateLabel: "Province", postalLabel: "Postal Code", postalPlaceholder: "", requiresState: false },
      { code: "SZ", name: "Eswatini", flag: "🇸🇿", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "H100", requiresState: false },
      { code: "LS", name: "Lesotho", flag: "🇱🇸", stateLabel: null, postalLabel: "Postal Code", postalPlaceholder: "100", requiresState: false },
    ],
  },
]

// ============================================================================
// FLATTENED COUNTRY LIST
// ============================================================================

export const ALL_COUNTRIES: (CountryConfig & { group: string })[] = COUNTRY_GROUPS.flatMap(
  (group) => group.countries.map((country) => ({ ...country, group: group.label }))
)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get country config by code
 */
export function getCountryConfig(code: string): CountryConfig | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code)
}

/**
 * Check if country has dropdown states
 */
export function hasStateDropdown(code: string): boolean {
  const config = getCountryConfig(code)
  return !!(config?.states && config.states.length > 0)
}

/**
 * Get states for a country (returns empty array if no states)
 */
export function getStatesForCountry(code: string): StateOption[] {
  const config = getCountryConfig(code)
  return config?.states || []
}

/**
 * Default country (US)
 */
export const DEFAULT_COUNTRY = "US"

/**
 * Legacy export for backwards compatibility
 */
export const SUPPORTED_COUNTRIES = ALL_COUNTRIES
