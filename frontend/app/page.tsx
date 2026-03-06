"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"

// Left side figures (Global Progressive Figures)
const leftFigures = [
  { name: "Alexandria Ocasio-Cortez", urgency: 10, twitter: "AOC", instagram: "aoc", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alexandria_Ocasio-Cortez_Official_Portrait.jpg/330px-Alexandria_Ocasio-Cortez_Official_Portrait.jpg", topPriority: true },
  { name: "Bernie Sanders", urgency: 9.5, twitter: "BernieSanders", instagram: "berniesanders", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Bernie_Sanders_2023.jpg/330px-Bernie_Sanders_2023.jpg", topPriority: true },
  { name: "Ilhan Omar", urgency: 9, twitter: "IlhanMN", instagram: "ilhanmn", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ilhan_Omar%2C_official_portrait%2C_116th_Congress_%28cropped%29_A.jpg/330px-Ilhan_Omar%2C_official_portrait%2C_116th_Congress_%28cropped%29_A.jpg", topPriority: false },
  { name: "Rashida Tlaib", urgency: 8.5, twitter: "RashidaTlaib", instagram: "rashidatlaib", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tlaib_Rashida_119th_Congress_%283x4_cropped%29.jpg/330px-Tlaib_Rashida_119th_Congress_%283x4_cropped%29.jpg", topPriority: false },
  { name: "Trita Parsi", urgency: 8.5, twitter: "taborparsi", instagram: "tritaparsi", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Trita_Parsi_-_ALTCONF-0174_%284441991863%29_%28cropped%29.jpg/330px-Trita_Parsi_-_ALTCONF-0174_%284441991863%29_%28cropped%29.jpg", topPriority: false },
  { name: "Pramila Jayapal", urgency: 8, twitter: "PramilaJayapal", instagram: "pramila.jayapal", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Pramila_Jayapal%2C_official_portrait%2C_116th_Congress.jpg/330px-Pramila_Jayapal%2C_official_portrait%2C_116th_Congress.jpg", topPriority: false },
  { name: "Ro Khanna", urgency: 7.8, twitter: "RoKhanna", instagram: "rokhanna", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ro_Khanna%2C_official_portrait%2C_115th_Congress_%283x4%29.jpg/330px-Ro_Khanna%2C_official_portrait%2C_115th_Congress_%283x4%29.jpg", topPriority: false },
  { name: "Jamie Raskin", urgency: 7.5, twitter: "RepRaskin", instagram: "repraskin", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Jamie_Raskin_Official_Portrait_2019.jpg/330px-Jamie_Raskin_Official_Portrait_2019.jpg", topPriority: false },
  { name: "Medea Benjamin", urgency: 7.5, twitter: "medeabenjamin", instagram: "codepink", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Medea_Benjamin_1.JPG/330px-Medea_Benjamin_1.JPG", topPriority: false },
  { name: "Sara Haghdoosti", urgency: 7, twitter: "sarahaghdoosti", instagram: "sarahaghdoosti", email: "", image: "https://images.squarespace-cdn.com/content/v1/5e57374d7d08e01bbd1bd10c/1583026642407-PEV5755RL146QAFW3KZ4/DSCF4014.jpg?format=1000w", topPriority: false },
  { name: "Ayanna Pressley", urgency: 7, twitter: "AyannaPressley", instagram: "ayannapressley", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Rep._Ayanna_Pressley%2C_117th_Congress.jpg/330px-Rep._Ayanna_Pressley%2C_117th_Congress.jpg", topPriority: false },
  { name: "Summer Lee", urgency: 6.8, twitter: "SummerForPA", instagram: "summerforpa", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Rep._Summer_Lee_-_118th_Congress_%283x4_cropped%29.jpg/330px-Rep._Summer_Lee_-_118th_Congress_%283x4_cropped%29.jpg", topPriority: false },
  { name: "Cori Bush", urgency: 6.5, twitter: "CoriBush", instagram: "coribush", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Cori_Bush_117th_U.S_Congress.jpg/330px-Cori_Bush_117th_U.S_Congress.jpg", topPriority: false },
  { name: "Maxwell Frost", urgency: 6.5, twitter: "MaxwellFrostFL", instagram: "maxwellfrostfl", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Rep._Maxwell_Frost_-_118th_Congress.jpg/330px-Rep._Maxwell_Frost_-_118th_Congress.jpg", topPriority: false },
  { name: "Jamaal Bowman", urgency: 6.3, twitter: "JamaalBowmanNY", instagram: "jamaalbowman", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jamaal_Bowman_117th_U.S_Congress.jpg/330px-Jamaal_Bowman_117th_U.S_Congress.jpg", topPriority: false },
  { name: "Greg Casar", urgency: 6, twitter: "GregCasar", instagram: "gregcasar", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Rep._Greg_Casar_-_118th_Congress_%283x4_cropped%29.jpg/330px-Rep._Greg_Casar_-_118th_Congress_%283x4_cropped%29.jpg", topPriority: false },
  { name: "Zohran Mamdani", urgency: 6, twitter: "ZohranKMamdani", instagram: "zohranmamdani", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Zohran_Mamdani_05.25.25_%28b%29_%28cropped%29.jpg/330px-Zohran_Mamdani_05.25.25_%28b%29_%28cropped%29.jpg", topPriority: false },
  { name: "Delia Ramirez", urgency: 5.8, twitter: "repdeliaramirez", instagram: "deliaramireztx", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Delia_Ramirez%2C_official_portrait_2025.jpg/330px-Delia_Ramirez%2C_official_portrait_2025.jpg", topPriority: false },
  { name: "Mark Pocan", urgency: 5.5, twitter: "RepMarkPocan", instagram: "repmarkpocan", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Mark_Pocan_headshot.jpg/330px-Mark_Pocan_headshot.jpg", topPriority: false },
  { name: "Jan Schakowsky", urgency: 5.3, twitter: "janschakowsky", instagram: "janschakowsky", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Jan_Schakowsky_official_photo.jpg/330px-Jan_Schakowsky_official_photo.jpg", topPriority: false },
  { name: "Lloyd Doggett", urgency: 5, twitter: "RepDoggett", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Lloyd_Doggett_118h_ID.jpeg/330px-Lloyd_Doggett_118h_ID.jpeg", topPriority: false },
  { name: "Jared Huffman", urgency: 5, twitter: "RepHuffman", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Jared_Huffman_Portrait_118.jpg/330px-Jared_Huffman_Portrait_118.jpg", topPriority: false },
  { name: "Ezra Levin", urgency: 4.8, twitter: "ezralevin", instagram: "ezralevin", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Ezra_Levin_at_the_Treasury_Building_protest.jpg/330px-Ezra_Levin_at_the_Treasury_Building_protest.jpg", topPriority: false },
  { name: "Leah Greenberg", urgency: 4.5, twitter: "Leahgreenb", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Leah_Greenberg_July_2025.png/330px-Leah_Greenberg_July_2025.png", topPriority: false },
  { name: "Alexandra Rojas", urgency: 4.3, twitter: "alexandrasrojas", instagram: "", email: "", image: "https://i.guim.co.uk/img/uploads/2025/05/11/Alexandra_Rojas.jpg?width=700&dpr=1&quality=85", topPriority: false },
  { name: "Stephen Miles", urgency: 4, twitter: "SPMiles42", instagram: "", email: "", image: "https://i0.wp.com/lepoco.org/wp-content/uploads/2022/03/EFC9C361-C78A-42BA-9FAB-5C1E1D59B762_1_201_a.jpeg?ssl=1", topPriority: false },
  { name: "Morgan McGarvey", urgency: 3.8, twitter: "RepMcGarvey", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Rep._Morgan_McGarvey_-_118th_Congress_%28cropped2%29.jpg/330px-Rep._Morgan_McGarvey_-_118th_Congress_%28cropped2%29.jpg", topPriority: false },
  { name: "Lateefah Simon", urgency: 3.5, twitter: "Lateefah", instagram: "lateefah", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Rep._Lateefah_Simon_Official_Portrait.jpg/330px-Rep._Lateefah_Simon_Official_Portrait.jpg", topPriority: false },
]

// Right side figures (Iran Liberation Advocates)
const rightFigures = [
  { name: "Marco Rubio", urgency: 10, twitter: "marcorubio", instagram: "marcorubio", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Official_portrait_of_Secretary_Marco_Rubio_%28cropped%29%282%29.jpg/330px-Official_portrait_of_Secretary_Marco_Rubio_%28cropped%29%282%29.jpg", topPriority: true },
  { name: "JD Vance", urgency: 9.5, twitter: "JDVance", instagram: "jdvance", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/January_2025_Official_Vice_Presidential_Portrait_of_JD_Vance.jpg/330px-January_2025_Official_Vice_Presidential_Portrait_of_JD_Vance.jpg", topPriority: true },
  { name: "Mike Johnson", urgency: 9, twitter: "SpeakerJohnson", instagram: "speakermikejohnson", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Speaker_Mike_Johnson_Official_Portrait_%28cropped%29%28b%29.jpg/330px-Speaker_Mike_Johnson_Official_Portrait_%28cropped%29%28b%29.jpg", topPriority: false },
  { name: "Jared Kushner", urgency: 9, twitter: "jaboredkushner", instagram: "jaredkushner", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Jared_Kushner_2025.jpg/330px-Jared_Kushner_2025.jpg", topPriority: false },
  { name: "Tom Cotton", urgency: 8.5, twitter: "TomCottonAR", instagram: "tomcottonar", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tom_Cotton_official_Senate_photo.jpg/330px-Tom_Cotton_official_Senate_photo.jpg", topPriority: false },
  { name: "Pete Hegseth", urgency: 8.5, twitter: "PeteHegseth", instagram: "petehegseth", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Pete_Hegseth_Official_Portrait.jpg/330px-Pete_Hegseth_Official_Portrait.jpg", topPriority: false },
  { name: "Michael Waltz", urgency: 8, twitter: "michaelgwaltz", instagram: "michaelgwaltz", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Official_Portrait_of_UN_Ambassador_Mike_Waltz_%28cropped_1%29.jpg/330px-Official_Portrait_of_UN_Ambassador_Mike_Waltz_%28cropped_1%29.jpg", topPriority: false },
  { name: "Tulsi Gabbard", urgency: 8, twitter: "TulsiGabbard", instagram: "tulsi", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Director_Tulsi_Gabbard_Official_Portrait.jpg/330px-Director_Tulsi_Gabbard_Official_Portrait.jpg", topPriority: true },
  { name: "John Ratcliffe", urgency: 7.8, twitter: "RepRatcliffe", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/John_Ratcliffe_official_photo.jpg/330px-John_Ratcliffe_official_photo.jpg", topPriority: false },
  { name: "Elise Stefanik", urgency: 7.5, twitter: "EliseStefanik", instagram: "elisestefanik", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Elise_Stefanik%2C_115th_official_photo_%284x5_cropped%29.jpg/330px-Elise_Stefanik%2C_115th_official_photo_%284x5_cropped%29.jpg", topPriority: false },
  { name: "Brian Hook", urgency: 7.5, twitter: "brianhook56", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Brian_Hook_2020_%28cropped%29.jpg/330px-Brian_Hook_2020_%28cropped%29.jpg", topPriority: false },
  { name: "Richard Grenell", urgency: 7.3, twitter: "RichardGrenell", instagram: "richardgrenell", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Richard_Grenell_official_portrait.jpg/330px-Richard_Grenell_official_portrait.jpg", topPriority: false },
  { name: "Robert O'Brien", urgency: 7, twitter: "robertcobrien", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Robert_C._O%27Brien.jpg", topPriority: false },
  { name: "John Thune", urgency: 6.8, twitter: "SenJohnThune", instagram: "senjohnthune", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/John_Thune_117th_Congress_portrait.jpg/330px-John_Thune_117th_Congress_portrait.jpg", topPriority: false },
  { name: "Steve Witkoff", urgency: 6.5, twitter: "", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Steve_Witkoff_%282025%29_%28cropped%29.jpg/330px-Steve_Witkoff_%282025%29_%28cropped%29.jpg", topPriority: false },
  { name: "Roger Wicker", urgency: 6.3, twitter: "SenatorWicker", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/2025_Roger_Wicker_%28cropped%29.jpg/330px-2025_Roger_Wicker_%28cropped%29.jpg", topPriority: false },
  { name: "Jim Risch", urgency: 6, twitter: "SenatorRisch", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bob_Menendez%2C_Jim_Risch_with_Tsihanouskaya_at_Senate_Foreign_%28cropped%29.jpg/330px-Bob_Menendez%2C_Jim_Risch_with_Tsihanouskaya_at_Senate_Foreign_%28cropped%29.jpg", topPriority: false },
  { name: "Mike Rogers", urgency: 5.8, twitter: "RepMikeRogers", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mike_Rogers_119th_Congress.jpg/330px-Mike_Rogers_119th_Congress.jpg", topPriority: false },
  { name: "Brian Mast", urgency: 5.5, twitter: "RepBrianMast", instagram: "repbrianmast", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Brian_Mast_official_115th_Congress_photo.jpg/330px-Brian_Mast_official_115th_Congress_photo.jpg", topPriority: false },
  { name: "Rick Crawford", urgency: 5.3, twitter: "RepRickCrawford", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Crawford_Rick_118th_Congress.jpg/330px-Crawford_Rick_118th_Congress.jpg", topPriority: false },
  { name: "Mark Dubowitz", urgency: 5, twitter: "mdubowitz", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/06.15_%E7%B8%BD%E7%B5%B1%E6%8E%A5%E8%A6%8B%E3%80%8C%E7%BE%8E%E5%9C%8B%E6%99%BA%E5%BA%AB%E3%80%8E%E4%BF%9D%E8%A1%9B%E6%B0%91%E4%B8%BB%E5%9F%BA%E9%87%91%E6%9C%83%E3%80%8F%EF%BC%88FDD%EF%BC%89%E8%BB%8D%E4%BA%8B%E5%AE%89%E5%85%A8%E5%B0%88%E5%AE%B6%E4%BA%A4%E6%B5%81%E5%9C%98%E3%80%8D_%2852976061215%29.jpg/330px-06.15_%E7%B8%BD%E7%B5%B1%E6%8E%A5%E8%A6%8B%E3%80%8C%E7%BE%8E%E5%9C%8B%E6%99%BA%E5%BA%AB%E3%80%8E%E4%BF%9D%E8%A1%9B%E6%B0%91%E4%B8%BB%E5%9F%BA%E9%87%91%E6%9C%83%E3%80%8F%EF%BC%88FDD%EF%BC%89%E8%BB%8D%E4%BA%8B%E5%AE%89%E5%85%A8%E5%B0%88%E5%AE%B6%E4%BA%A4%E6%B5%81%E5%9C%98%E3%80%8D_%2852976061215%29.jpg", topPriority: false },
  { name: "Behnam Ben Taleblu", urgency: 4.8, twitter: "BehnamTaleblu", instagram: "", email: "", image: "https://www.fdd.org/wp-content/uploads/2018/08/Headshot_HighRes_BehnamBenTaleblu.jpg", topPriority: false },
  { name: "Richard Goldberg", urgency: 4.5, twitter: "rich_goldberg", instagram: "", email: "", image: "https://www.fdd.org/wp-content/uploads/2019/09/Headshot_HighRes_RichardGoldberg.jpg", topPriority: false },
  { name: "Saeed Ghasseminejad", urgency: 4.3, twitter: "SGhasseminejad", instagram: "", email: "", image: "https://www.fdd.org/wp-content/uploads/2019/04/Headshot_HighRes_SaeedGhasseminejad.jpg", topPriority: false },
  { name: "Jonathan Schanzer", urgency: 4, twitter: "JSchanzer", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Jonathan_Schanzer_%282023%29.jpg/330px-Jonathan_Schanzer_%282023%29.jpg", topPriority: false },
  { name: "Michael Doran", urgency: 3.8, twitter: "doranbm", instagram: "", email: "", image: "https://www.hudson.org/content/images/michael_doran.jpg", topPriority: false },
  { name: "Zineb Riboua", urgency: 3.5, twitter: "ZinebRiboua", instagram: "", email: "", image: "https://www.hudson.org/content/images/zineb_riboua.jpg", topPriority: false },
  { name: "Joel Rayburn", urgency: 3.3, twitter: "JoelRayburn", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Joel_Rayburn_New_America1_%28cropped%29.jpg/330px-Joel_Rayburn_New_America1_%28cropped%29.jpg", topPriority: false },
  { name: "Rebeccah Heinrichs", urgency: 3, twitter: "RLHeinrichs", instagram: "", email: "", image: "https://www.hudson.org/content/images/rebeccah_heinrichs.jpg", topPriority: false },
  { name: "Victoria Coates", urgency: 2.8, twitter: "VictoriaCoates", instagram: "", email: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Victoria_Coates_NATO.png/330px-Victoria_Coates_NATO.png", topPriority: false },
]

// Normalize radius between 0.6 and 1.4 factor for subtle size differences
function getRadius(urgency: number, maxUrgency: number, minUrgency: number) {
  const normalized = (urgency - minUrgency) / (maxUrgency - minUrgency)
  const factor = 0.6 + normalized * 0.8
  return factor
}

interface Figure {
  name: string
  urgency: number
  twitter: string
  instagram: string
  email: string
  image: string
  topPriority: boolean
}

function FigureCircle({
  figure,
  baseSize,
  radiusFactor,
  onClick,
  variant,
}: {
  figure: Figure
  baseSize: number
  radiusFactor: number
  onClick: () => void
  variant: "left" | "right"
}) {
  const size = baseSize * radiusFactor
  const ringSize = size + 8

  const gradientClass = variant === "left" 
    ? "bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500" 
    : "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400"

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center focus:outline-none"
    >
      {/* Top Priority Badge */}
      {figure.topPriority && (
        <span className={`absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${variant === "left" ? "bg-teal-500" : "bg-pink-500"}`}>
          Top Priority
        </span>
      )}
      
      {/* Ring Container */}
      <div
        className={`flex items-center justify-center rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105 ${gradientClass}`}
        style={{
          width: `${ringSize}px`,
          height: `${ringSize}px`,
        }}
      >
        {/* Inner White Border */}
        <div
          className="flex items-center justify-center rounded-full bg-white p-[2px]"
          style={{
            width: `${size + 4}px`,
            height: `${size + 4}px`,
          }}
        >
          {/* Image Container */}
          <div
            className="overflow-hidden rounded-full bg-neutral-100"
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <img
              src={figure.image}
              alt={figure.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
      
      {/* Name Label */}
      <span className="mt-2 max-w-[100px] text-center text-[11px] font-medium leading-tight text-neutral-700">
        {figure.name}
      </span>
    </button>
  )
}

function EmailPopup({
  figureName,
  onClose,
  variant,
}: {
  figureName: string
  onClose: () => void
  variant: "left" | "right"
}) {
  const emailSubject = "Support for a Free and Democratic Iran"
  const emailBody = `Dear Esteemed ${figureName},

Iran's regime continues to threaten regional and global stability through its support of terror proxies, ballistic missile expansion, and nuclear ambitions. Inaction only strengthens its grip and endangers us all.

President Trump's vision for a liberated Iran offers a path toward lasting change. A democratic future—led by figures like Reza Pahlavi—could transform Iran into a free and responsible nation, no longer bound by theocratic rule.

A free Iran would weaken extremist networks, stabilize energy markets, and create new opportunities for trade and strategic cooperation. Your voice and influence—through public advocacy, digital campaigns, and coalition-building—can help advance this cause.

Now is the time for clarity and leadership. Supporting Trump's liberation of Iran and a democratic Iran under Prince Reza Pahlavi means supporting long-term peace and prosperity.

With hope,
[Your Name]`

  const accentColor = variant === "left" ? "bg-teal-500" : "bg-purple-500"
  const accentColorLight = variant === "left" ? "bg-teal-100" : "bg-purple-100"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS-style Window Controls */}
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <button onClick={onClose} className="h-3 w-3 rounded-full bg-red-400 transition-colors hover:bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-2 text-sm font-medium text-neutral-600">Email Template</span>
        </div>

        <div className="p-6">
          {/* Subject */}
          <div className={`mb-4 rounded-lg ${accentColorLight} p-3`}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Subject</p>
            <p className="mt-1 font-semibold text-neutral-900">{emailSubject}</p>
          </div>

          {/* Email Body */}
          <div className="mb-4 max-h-[300px] overflow-y-auto rounded-lg bg-neutral-50 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700">
              {emailBody}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className={`flex-1 rounded-xl ${accentColor} px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90`}
            >
              Copy to Clipboard
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Open in Email App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function FigureModal({
  figure,
  onClose,
  variant,
}: {
  figure: Figure
  onClose: () => void
  variant: "left" | "right"
}) {
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const accentColor = variant === "left" ? "bg-teal-500" : "bg-purple-500"
  const accentColorLight = variant === "left" ? "bg-teal-50 hover:bg-teal-100" : "bg-purple-50 hover:bg-purple-100"
  const gradientClass = variant === "left" 
    ? "bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500" 
    : "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS-style Window Controls */}
        <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <button onClick={onClose} className="h-3 w-3 rounded-full bg-red-400 transition-colors hover:bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex items-center justify-center rounded-full p-[3px] ${gradientClass}`}>
              <div className="flex items-center justify-center rounded-full bg-white p-[2px]">
                <div className="h-20 w-20 overflow-hidden rounded-full">
                  <img
                    src={figure.image}
                    alt={figure.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{figure.name}</h3>
              <p className="text-sm text-neutral-500">Influence Score: {figure.urgency.toFixed(1)}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            {figure.twitter && (
              <a
                href={`https://x.com/${figure.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${accentColorLight}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accentColor}`}>
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">X (Twitter) Account</p>
                  <p className="text-xs text-neutral-500">@{figure.twitter}</p>
                </div>
              </a>
            )}

            {figure.instagram && (
              <a
                href={`https://instagram.com/${figure.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${accentColorLight}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Instagram Account</p>
                  <p className="text-xs text-neutral-500">@{figure.instagram}</p>
                </div>
              </a>
            )}

            {/* Email row - always shown for all figures */}
            <button
              onClick={() => setShowEmailPopup(true)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${accentColorLight}`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${accentColor}`}>
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-900">Send Email</p>
                <p className="text-xs text-neutral-500">Open pre-written email template</p>
              </div>
            </button>

            {!figure.twitter && !figure.instagram && (
              <p className="text-center text-sm text-neutral-400 py-2">No social media accounts available</p>
            )}
          </div>

          {/* Redirect Notice */}
          {(figure.twitter || figure.instagram) && (
            <p className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Redirecting to external account...
            </p>
          )}
        </div>
      </div>

      {/* Email Popup */}
      {showEmailPopup && (
        <EmailPopup
          figureName={figure.name}
          onClose={() => setShowEmailPopup(false)}
          variant={variant}
        />
      )}
    </div>
  )
}

function FigureColumn({
  figures,
  title,
  subtitle,
  baseSize,
  variant,
}: {
  figures: Figure[]
  title: string
  subtitle: string
  baseSize: number
  variant: "left" | "right"
}) {
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null)

  const sortedFigures = [...figures].sort((a, b) => b.urgency - a.urgency)
  const maxUrgency = Math.max(...figures.map((f) => f.urgency))
  const minUrgency = Math.min(...figures.map((f) => f.urgency))

  const titleColor = variant === "left" ? "text-teal-700" : "text-purple-700"

  return (
    <div className="flex flex-col items-center px-3 py-6 sm:px-4 sm:py-8 md:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className={`text-sm font-bold uppercase tracking-wide ${titleColor}`}>{title}</h2>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {sortedFigures.map((figure) => (
          <FigureCircle
            key={figure.name}
            figure={figure}
            baseSize={baseSize}
            radiusFactor={getRadius(figure.urgency, maxUrgency, minUrgency)}
            onClick={() => setSelectedFigure(figure)}
            variant={variant}
          />
        ))}
      </div>

      {selectedFigure && <FigureModal figure={selectedFigure} onClose={() => setSelectedFigure(null)} variant={variant} />}
    </div>
  )
}

export default function SocialMediaRadar() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-neutral-200/50 bg-white/80 px-4 py-5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-purple-500">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Social Media Radar</h1>
              <p className="text-xs text-neutral-500">Monitoring Global Influence | Advocating for Iran</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-[calc(100vh-180px)]">
          {/* Left Side - Teal Gradient Background */}
          <div className="flex-1 bg-gradient-to-br from-cyan-50/80 via-teal-50/60 to-emerald-50/40">
            <FigureColumn
              figures={leftFigures}
              title="GLOBAL PROGRESSIVE FIGURES"
              subtitle="Influential Social Media Voices"
              baseSize={75}
              variant="left"
            />
          </div>
          
          {/* Separator */}
          <div className="relative flex items-center">
            <div className="h-full w-px bg-gradient-to-b from-teal-300 via-neutral-300 to-purple-300" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 shadow-sm">
              Global Influence Separator
            </div>
          </div>
          
          {/* Right Side - Purple Gradient Background */}
          <div className="flex-1 bg-gradient-to-bl from-purple-50/80 via-pink-50/60 to-rose-50/40">
            <FigureColumn
              figures={rightFigures}
              title="IRAN LIBERATION ADVOCATES"
              subtitle="Most Influential Faces"
              baseSize={75}
              variant="right"
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden px-3 pb-10 pt-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/40 shadow-sm">
            <div className="grid grid-cols-2">
              <div className="bg-gradient-to-br from-cyan-50/80 via-teal-50/60 to-emerald-50/40">
                <FigureColumn
                  figures={leftFigures}
                  title="GLOBAL PROGRESSIVE FIGURES"
                  subtitle="Influential Social Media Voices"
                  baseSize={52}
                  variant="left"
                />
              </div>
              
              <div className="bg-gradient-to-bl from-purple-50/80 via-pink-50/60 to-rose-50/40">
                <FigureColumn
                  figures={rightFigures}
                  title="IRAN LIBERATION ADVOCATES"
                  subtitle="Most Influential Faces"
                  baseSize={52}
                  variant="right"
                />
              </div>
            </div>

            {/* Mobile Vertical Separator */}
            <div className="pointer-events-none absolute inset-y-5 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-teal-300 via-neutral-300 to-purple-300" />
            <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Global Influence Separator
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600">
            <a href="#" className="transition-colors hover:text-neutral-900">About</a>
            <a href="#" className="transition-colors hover:text-neutral-900">Methodology</a>
            <a href="#" className="transition-colors hover:text-neutral-900">Contact</a>
            <a href="#" className="transition-colors hover:text-neutral-900">Comments</a>
          </nav>
          <p className="text-xs text-neutral-400">Social Page</p>
        </div>
      </footer>
    </main>
  )
}
