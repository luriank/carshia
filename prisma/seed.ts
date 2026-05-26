import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { brand } from "../brand.config";
import { PrismaClient } from "../generated/prisma/client";

const DEMO_EMAIL = `demo@${brand.emailDomain}`;
const ADMIN_EMAIL = `admin@${brand.emailDomain}`;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORIES = [
  { slug: "filigree-silver", name: "Filigree & Silver" },
  { slug: "traditional-wear", name: "Traditional Wear" },
  { slug: "home-decor", name: "Home & Décor" },
  { slug: "souvenirs-prints", name: "Souvenirs & Prints" },
  { slug: "flags-pennants", name: "Flags & Pennants" },
  { slug: "artisan-pantry", name: "Artisan Pantry" },
];

const BRANDS = [
  "Autentika Gjakovë",
  "Çarshia e Madhe",
  "Filigran Gjakova",
  "Ergon Atelier",
  "Kulla Craft",
  "Dukagjini Artisans",
];

type Seed = {
  title: string;
  titleEn: string;
  category: string;
  brand: string;
  price: number;
  discount?: number;
  stock: number;
  rating: number;
  thumb: string;
  gallery?: string[];
  featured?: boolean;
  description: string;
  descriptionEn: string;
};

const P = (s: string) => `/products/${s}`;

const PRODUCTS: Seed[] = [
  // ---- Filigree & Silver ----
  {
    title: "Varëse Filigrani me Shqiponjën Dykrenare",
    titleEn: "Filigree Double-Headed Eagle Pendant",
    featured: true,
    category: "filigree-silver",
    brand: "Filigran Gjakova",
    price: 34.9,
    stock: 24,
    rating: 4.9,
    thumb: "filigree.jpg",
    gallery: ["filigree.jpg", "gjakova-bazaar.jpg"],
    description:
      "Filigran argjendi i përdredhur me dorë, i formësuar në shqiponjën dykrenare — një zanat shekullor që ende praktikohet në Çarshinë e Madhe të Gjakovës. Çdo copë punohet dhe përfundohet tërësisht me dorë.",
    descriptionEn:
      "Hand-twisted sterling silver filigree shaped into the double-headed eagle — a centuries-old craft still practised in Gjakova's Grand Bazaar. Each piece is made and finished entirely by hand.",
  },
  {
    title: "Vathë Filigrani prej Argjendi në Formë Pike",
    titleEn: "Filigree Silver Drop Earrings",
    category: "filigree-silver",
    brand: "Filigran Gjakova",
    price: 28.5,
    discount: 10,
    stock: 30,
    rating: 4.8,
    thumb: "filigree.jpg",
    description:
      "Vathë delikatë në formë pike, të endur prej fijesh të holla argjendi. Të lehtë për t'u mbajtur, tradicionalë në formë dhe pa dyshim gjakovarë.",
    descriptionEn:
      "Delicate teardrop earrings woven from fine silver thread. Light to wear, traditional in form, and unmistakably Gjakova.",
  },
  {
    title: "Karficë Filigrani në Formë Trëndafili",
    titleEn: "Filigree Rosette Brooch",
    category: "filigree-silver",
    brand: "Filigran Gjakova",
    price: 24,
    stock: 18,
    rating: 4.7,
    thumb: "filigree.jpg",
    description:
      "Një karficë në formë trëndafili e ndërtuar nga unaza koncentrike argjendi të mbështjella me dorë — një motiv klasik i punës së filigranit kosovar.",
    descriptionEn:
      "A rosette brooch built from concentric rings of hand-coiled silver — a classic motif of Kosovar filigree work.",
  },
  {
    title: "Unazë Martese Filigrani (Unazë)",
    titleEn: "Filigree Wedding Ring (Unazë)",
    category: "filigree-silver",
    brand: "Autentika Gjakovë",
    price: 19.9,
    stock: 40,
    rating: 4.6,
    thumb: "filigree.jpg",
    description:
      "Një rreth argjendi me rrjetëzim të imët, që tradicionalisht shkëmbehet në dasmat kosovare. Punohet me porosi nga argjendarët e çarshisë.",
    descriptionEn:
      "A finely latticed silver band, traditionally exchanged at Kosovar weddings. Made to order by bazaar silversmiths.",
  },
  {
    title: "Byzylyk Filigrani “Dardania”",
    titleEn: "Filigree Bracelet “Dardania”",
    category: "filigree-silver",
    brand: "Filigran Gjakova",
    price: 39,
    stock: 14,
    rating: 4.9,
    thumb: "filigree.jpg",
    description:
      "Një byzylyk i fuqishëm prej filigrani argjendi të ndërthurur, i emëruar sipas rajonit antik të Dardanisë. I dukshëm, por çuditërisht i lehtë.",
    descriptionEn:
      "A statement cuff of interlaced silver filigree, named for the ancient region of Dardania. Substantial yet remarkably light.",
  },
  {
    title: "Kuti Kujtimesh me Filigran",
    titleEn: "Filigree Keepsake Box",
    category: "filigree-silver",
    brand: "Ergon Atelier",
    price: 45,
    stock: 9,
    rating: 4.8,
    thumb: "filigree.jpg",
    description:
      "Një kuti e vogël me kapak dhe panele filigrani — për unaza, rruaza ose një kujtim nga udhëtimet tuaja nëpër Kosovë.",
    descriptionEn:
      "A small lidded box with filigree panels — for rings, beads, or a keepsake from your travels through Kosovo.",
  },
  {
    title: "Mansheta Filigrani me Shqiponjë",
    titleEn: "Filigree Eagle Cufflinks",
    category: "filigree-silver",
    brand: "Filigran Gjakova",
    price: 22,
    stock: 26,
    rating: 4.5,
    thumb: "filigree.jpg",
    description:
      "Mansheta me motivin e shqiponjës, prej argjendi të punuar me dorë — një prekje e fundit pa zhurmë por atdhetare.",
    descriptionEn:
      "Eagle-motif cufflinks in hand-worked silver — a quietly patriotic finishing touch.",
  },
  {
    title: "Gjerdan i Hollë me Varëse Filigrani",
    titleEn: "Fine Filigree Pendant Necklace",
    category: "filigree-silver",
    brand: "Autentika Gjakovë",
    price: 31,
    discount: 15,
    stock: 0,
    rating: 4.7,
    thumb: "filigree.jpg",
    description:
      "Një medaljon i punuar me thurje në një zinxhir të hollë. Aktualisht i shitur — rifurnizohet ndërsa çdo copë përfundohet me dorë.",
    descriptionEn:
      "An openwork medallion on a fine chain. Currently sold out — restocked as each piece is hand-finished.",
  },

  // ---- Traditional Wear ----
  {
    title: "Plis — Plisi Tradicional i Bardhë prej Leshi",
    titleEn: "Plis — Traditional White Felt Cap",
    featured: true,
    category: "traditional-wear",
    brand: "Dukagjini Artisans",
    price: 18,
    stock: 50,
    rating: 4.8,
    thumb: "plis.jpg",
    gallery: ["plis.jpg", "folk-shop.jpg"],
    description:
      "Plisi: kapelja e bardhë me kube prej leshi të ngjeshur, që e mbajnë burrat shqiptarë brez pas brezi. I formësuar me dorë nga leshi i shtypur, besnik ndaj formës krahinore.",
    descriptionEn:
      "The plis: the white domed felt cap worn by Albanian men for generations. Shaped from pressed wool by hand, true to regional form.",
  },
  {
    title: "Çorape Leshi të Endura me Dorë (Çorape Leshi)",
    titleEn: "Hand-Knit Wool Socks (Çorape Leshi)",
    category: "traditional-wear",
    brand: "Kulla Craft",
    price: 12.5,
    stock: 60,
    rating: 4.7,
    thumb: "folk-shop.jpg",
    description:
      "Çorape të trasha prej leshi malor, të endura me dorë me motive tradicionale gjeometrike. Mjaft të ngrohta për një dimër të Dukagjinit.",
    descriptionEn:
      "Thick mountain-wool socks, hand-knit with traditional geometric patterns. Warm enough for a Dukagjin winter.",
  },
  {
    title: "Jelek Leshi i Qëndisur (Xhamadan)",
    titleEn: "Embroidered Wool Vest (Xhamadan)",
    category: "traditional-wear",
    brand: "Dukagjini Artisans",
    price: 68,
    stock: 8,
    rating: 4.9,
    thumb: "folk-shop.jpg",
    description:
      "Një xhamadan leshi me qëndisje prej fijesh ari të punuar me dorë përgjatë anëve — veshje tradicionale festive, e punuar sipas mënyrës së vjetër.",
    descriptionEn:
      "A wool xhamadan with hand-stitched gold-thread embroidery along the trim — formal traditional wear, made the old way.",
  },
  {
    title: "Shami e Qëndisur për Gra (Shami)",
    titleEn: "Women's Embroidered Shawl (Shami)",
    category: "traditional-wear",
    brand: "Kulla Craft",
    price: 26,
    discount: 10,
    stock: 22,
    rating: 4.6,
    thumb: "folk-shop.jpg",
    description:
      "Një shami e hollë e përfunduar me bordura lulesh të qëndisura me dorë, që mbahet si për festa ashtu edhe përditë.",
    descriptionEn:
      "A fine shawl finished with hand-embroidered floral borders, worn for celebrations and everyday alike.",
  },
  {
    title: "Opinga — Këpucë Tradicionale Lëkure",
    titleEn: "Opinga — Traditional Leather Shoes",
    category: "traditional-wear",
    brand: "Çarshia e Madhe",
    price: 34,
    stock: 16,
    rating: 4.4,
    thumb: "folk-shop.jpg",
    description:
      "Opinga lëkure të qepura me dorë me majën karakteristike të kthyer — dikur këpucët e përditshme të malësisë.",
    descriptionEn:
      "Hand-stitched leather opinga with the characteristic curled toe — once the everyday footwear of the highlands.",
  },
  {
    title: "Brez Malësori (Brez)",
    titleEn: "Highlander Sash (Brez)",
    category: "traditional-wear",
    brand: "Dukagjini Artisans",
    price: 21,
    stock: 19,
    rating: 4.5,
    thumb: "folk-shop.jpg",
    description:
      "Një brez i gjatë leshi i endur, që mbahet në bel në veshjen tradicionale, në ngjyra të kuqe të thellë dhe të zeza.",
    descriptionEn:
      "A long woven wool sash worn at the waist of traditional dress, in deep red and black tones.",
  },
  {
    title: "Plis për Fëmijë (i Vogël)",
    titleEn: "Children's Plis (Small)",
    category: "traditional-wear",
    brand: "Dukagjini Artisans",
    price: 14,
    stock: 35,
    rating: 4.8,
    thumb: "plis.jpg",
    description:
      "Një plis i vogël për fëmijë — i njëjti zanat, i zvogëluar për brezin e ardhshëm.",
    descriptionEn:
      "A small plis for children — the same craft, scaled down for the next generation.",
  },
  {
    title: "Bluzë Liri e Qëndisur",
    titleEn: "Embroidered Linen Blouse",
    category: "traditional-wear",
    brand: "Kulla Craft",
    price: 42,
    stock: 12,
    rating: 4.6,
    thumb: "folk-shop.jpg",
    description:
      "Një bluzë e lehtë prej liri me mansheta dhe jakë të qëndisura me dorë, e frymëzuar nga motivet tradicionale kosovare.",
    descriptionEn:
      "A light linen blouse with hand-embroidered cuffs and collar, drawn from traditional Kosovar patterns.",
  },

  // ---- Home & Décor ----
  {
    title: "Qilim i Endur me Dorë (Shtëllungë)",
    titleEn: "Handwoven Kilim Runner",
    featured: true,
    category: "home-decor",
    brand: "Çarshia e Madhe",
    price: 89,
    stock: 7,
    rating: 4.9,
    thumb: "kilim.jpg",
    gallery: ["kilim.jpg", "kilim-2.jpg"],
    description:
      "Një qilim leshi i endur në vegjë tradicionale, me motive të theksuara gjeometrike dhe ngjyra natyrore. Asnjë copë nuk është e njëjtë me tjetrën.",
    descriptionEn:
      "A wool kilim runner woven on a traditional loom, with bold geometric motifs and natural dyes. No two are identical.",
  },
  {
    title: "Këllëf Jastëku prej Qilimi Leshi",
    titleEn: "Wool Kilim Cushion Cover",
    category: "home-decor",
    brand: "Çarshia e Madhe",
    price: 24,
    stock: 28,
    rating: 4.7,
    thumb: "kilim-2.jpg",
    description:
      "Sille çarshinë në shtëpi: një këllëf jastëku i prerë dhe i qepur prej qilimi të endur me dorë, 45×45 cm.",
    descriptionEn:
      "Bring the bazaar home: a cushion cover cut and bound from handwoven kilim, 45×45 cm.",
  },
  {
    title: "Set Kafeje prej Bakri të Rrahur",
    titleEn: "Hammered Copper Coffee Set",
    featured: true,
    category: "home-decor",
    brand: "Ergon Atelier",
    price: 46,
    discount: 10,
    stock: 15,
    rating: 4.8,
    thumb: "cezve.jpg",
    gallery: ["cezve.jpg", "cezve-2.jpg"],
    description:
      "Një xhezve bakri e rrahur me dorë me dy filxhanë dhe tabaka — i gjithë rituali i kafesë në stilin turk, i punuar në Gjakovë.",
    descriptionEn:
      "A hand-hammered copper xhezve with two cups and tray — the full ritual of Turkish-style coffee, Gjakova-made.",
  },
  {
    title: "Xhezve Bakri (Xhezve), e Vogël",
    titleEn: "Copper Xhezve (Cezve), Small",
    category: "home-decor",
    brand: "Ergon Atelier",
    price: 17.5,
    stock: 32,
    rating: 4.6,
    thumb: "cezve-2.jpg",
    description:
      "Një xhezve bakri për një porcion, e kallajisur me dorë, me dorezë bronzi të farkëtuar. Zanat funksional për përdorim të përditshëm.",
    descriptionEn:
      "A single-serve hand-tinned copper coffee pot with a forged brass handle. Functional craft for daily use.",
  },
  {
    title: "Tabaka Kafeje prej Lisi e Gdhendur",
    titleEn: "Carved Oak Coffee Tray",
    category: "home-decor",
    brand: "Kulla Craft",
    price: 29,
    stock: 17,
    rating: 4.5,
    thumb: "cezve.jpg",
    description:
      "Një tabaka shërbimi prej lisi me buzë të gdhendur me dorë, e përfunduar me vaj natyral — shkon me setin e kafesë prej bakri.",
    descriptionEn:
      "An oak serving tray with a hand-carved rim, finished with natural oil — pairs with the copper coffee set.",
  },
  {
    title: "Qilim Muri për Varje",
    titleEn: "Kilim Wall Hanging",
    category: "home-decor",
    brand: "Çarshia e Madhe",
    price: 110,
    stock: 5,
    rating: 4.9,
    thumb: "kilim-2.jpg",
    description:
      "Një qilim dekorativ më i madh i bërë për t'u varur — një panel i endur me motive krahinore që i jep karakter një dhome.",
    descriptionEn:
      "A larger decorative kilim made to hang — a woven panel of regional motifs that anchors a room.",
  },
  {
    title: "Çifteli — Çiftelia Tradicionale Dyfijëshe",
    titleEn: "Çifteli — Traditional Two-String Lute",
    category: "home-decor",
    brand: "Dukagjini Artisans",
    price: 95,
    stock: 6,
    rating: 4.8,
    thumb: "cifteli.jpg",
    description:
      "Çiftelia: një vegël muzikore me qafë të gjatë dhe dy fije, e gdhendur nga një copë e vetme druri, qendrore për muzikën popullore shqiptare.",
    descriptionEn:
      "The çifteli: a long-necked two-string lute carved from a single block of wood, central to Albanian folk music.",
  },
  {
    title: "Pjatë Shërbimi prej Bakri e Gdhendur",
    titleEn: "Engraved Copper Serving Plate",
    category: "home-decor",
    brand: "Ergon Atelier",
    price: 38,
    stock: 13,
    rating: 4.6,
    thumb: "cezve.jpg",
    description:
      "Një pjatë dekorative prej bakri, e gdhendur me dorë me një motiv trëndafili. Vëre për dukje, ose shërbe ëmbëlsira sipas mënyrës tradicionale.",
    descriptionEn:
      "A decorative copper plate, hand-engraved with a rosette pattern. Display it, or serve sweets the traditional way.",
  },
  {
    title: "Nënvendëse Tavoline prej Qilimi Leshi (Set prej 2)",
    titleEn: "Wool Kilim Table Mats (Set of 2)",
    category: "home-decor",
    brand: "Çarshia e Madhe",
    price: 19,
    stock: 24,
    rating: 4.4,
    thumb: "kilim.jpg",
    description:
      "Dy nënvendëse të vogla të endura me dorë për të sjellë pak nga çarshia në tryezë.",
    descriptionEn:
      "Two small handwoven mats to bring a little of the bazaar to the table.",
  },

  // ---- Souvenirs & Prints ----
  {
    title: "Çarshia e Madhe — Stampë Panoramike (A3)",
    titleEn: "Çarshia e Madhe — Panoramic Print (A3)",
    featured: true,
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 16,
    stock: 40,
    rating: 4.7,
    thumb: "gjakova-carshia-pano.jpg",
    description:
      "Një stampë e gjerë panoramike e Çarshisë së Madhe të Gjakovës, çarshia historike. E shtypur në letër arti mat.",
    descriptionEn:
      "A wide panoramic print of the Grand Bazaar of Gjakova, the historic Çarshia e Madhe. Printed on matte fine-art paper.",
  },
  {
    title: "Çarshia e Vjetër e Gjakovës — Stampë Fotografike (A4)",
    titleEn: "Gjakova Old Bazaar — Photo Print (A4)",
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 11,
    stock: 45,
    rating: 4.5,
    thumb: "gjakova-bazaar.jpg",
    description:
      "Rrugicat me kalldrëm dhe dyqanet prej druri të çarshisë së vjetër, të kapura në një stampë giclée gati për t'u kornizuar.",
    descriptionEn:
      "The cobbled lanes and wooden shopfronts of the old bazaar, captured in a giclée print ready to frame.",
  },
  {
    title: "Xhamia e Hadumit — Stampë e Kornizuar",
    titleEn: "Hadum Mosque — Framed Print",
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 22,
    discount: 10,
    stock: 20,
    rating: 4.8,
    thumb: "hadum-mosque.jpg",
    description:
      "Xhamia e Hadumit e shekullit të 16-të, një nga simbolet e Gjakovës, në një kornizë të hollë druri.",
    descriptionEn:
      "The 16th-century Hadum Mosque, one of Gjakova's landmarks, in a slim wooden frame.",
  },
  {
    title: "Gjakova Natën — Stampë në Kanavacë",
    titleEn: "Gjakova by Night — Canvas Print",
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 34,
    stock: 14,
    rating: 4.7,
    thumb: "gjakova-night.jpg",
    description:
      "Qyteti i vjetër i ndriçuar pas errësirës, i shtypur në kanavacë të tendosur — një pjesë qendrore e ngrohtë për çdo mur.",
    descriptionEn:
      "The old town lit up after dark, printed on stretched canvas — a warm centrepiece for any wall.",
  },
  {
    title: "Rruga e Çarshisë së Vjetër — Set Kartolinash (10)",
    titleEn: "Old Bazaar Street — Postcard Set (10)",
    category: "souvenirs-prints",
    brand: "Çarshia e Madhe",
    price: 6.5,
    stock: 70,
    rating: 4.4,
    thumb: "gjakova-bazaar-street.jpg",
    description:
      "Dhjetë kartolina të rrugëve dhe zanateve të Gjakovës — dërgo një pjesë të çarshisë në shtëpi.",
    descriptionEn:
      "Ten postcards of Gjakova's streets and crafts — send a piece of the bazaar home.",
  },
  {
    title: "Gjakova nga Lart — Poster",
    titleEn: "Gjakova from Above — Poster",
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 13,
    stock: 30,
    rating: 4.3,
    thumb: "gjakova-aerial.jpg",
    description:
      "Një poster ajror i Gjakovës dhe luginës së lumit të saj, në letër mat me peshë të rëndë.",
    descriptionEn:
      "An aerial poster of Gjakova and its river valley, on heavyweight matte stock.",
  },
  {
    title: "Magnet Frigoriferi — Çarshia e Madhe",
    titleEn: "Fridge Magnet — Çarshia e Madhe",
    category: "souvenirs-prints",
    brand: "Çarshia e Madhe",
    price: 3.5,
    stock: 120,
    rating: 4.6,
    thumb: "gjakova-carshia-pano.jpg",
    description:
      "Një magnet frigoriferi me shkëlqim i Çarshisë së Madhe — suveniri klasik i vogël.",
    descriptionEn:
      "A glossy fridge magnet of the Grand Bazaar — the classic small souvenir.",
  },
  {
    title: "Magnet Frigoriferi — Xhamia e Hadumit",
    titleEn: "Fridge Magnet — Hadum Mosque",
    category: "souvenirs-prints",
    brand: "Çarshia e Madhe",
    price: 3.5,
    stock: 120,
    rating: 4.6,
    thumb: "hadum-mosque.jpg",
    description:
      "Një magnet frigoriferi me shkëlqim që paraqet Xhaminë e Hadumit të Gjakovës.",
    descriptionEn:
      "A glossy fridge magnet featuring the Hadum Mosque of Gjakova.",
  },
  {
    title: "Varëse Çelësash prej Druri — Çarshia e Vjetër",
    titleEn: "Wooden Keychain — Old Bazaar",
    category: "souvenirs-prints",
    brand: "Kulla Craft",
    price: 4.5,
    stock: 90,
    rating: 4.5,
    thumb: "gjakova-old-town.jpg",
    description:
      "Një varëse çelësash prej druri ulliri e gdhendur me lazer me një pamje të qytetit të vjetër.",
    descriptionEn:
      "A laser-etched olive-wood keychain with a view of the old town.",
  },
  {
    title: "Filxhan Qeramike — Gjakovë",
    titleEn: "Ceramic Mug — Gjakovë",
    category: "souvenirs-prints",
    brand: "Autentika Gjakovë",
    price: 9,
    stock: 55,
    rating: 4.5,
    thumb: "gjakova-old-town.jpg",
    description:
      "Një filxhan i fortë qeramike i stampuar me siluetën e Gjakovës — për kafenë e bërë në xhezven tuaj të re.",
    descriptionEn:
      "A sturdy ceramic mug printed with the Gjakova skyline — for coffee made in your new xhezve.",
  },

  // ---- Flags & Pennants ----
  {
    title: "Flamuri i Kosovës — 90×150 cm",
    titleEn: "Kosovo Flag — 90×150 cm",
    featured: true,
    category: "flags-pennants",
    brand: "Autentika Gjakovë",
    price: 12,
    stock: 80,
    rating: 4.8,
    thumb: "flag-kosovo-waving.jpg",
    gallery: ["flag-kosovo-waving.jpg", "flag-kosovo.png"],
    description:
      "Flamuri i Republikës së Kosovës prej poliesteri të qëndrueshëm për jashtë, i qepur dyfish me kapëse bronzi.",
    descriptionEn:
      "The flag of the Republic of Kosovo in durable outdoor polyester, double-stitched with brass grommets.",
  },
  {
    title: "Flamuri i Shqipërisë — 90×150 cm",
    titleEn: "Albania Flag — 90×150 cm",
    category: "flags-pennants",
    brand: "Autentika Gjakovë",
    price: 12,
    stock: 80,
    rating: 4.8,
    thumb: "flag-albania-waving.jpg",
    gallery: ["flag-albania-waving.jpg", "flag-albania.png"],
    description:
      "Shqiponja dykrenare e kuqe e zezë e Shqipërisë, prej poliesteri rezistent ndaj motit.",
    descriptionEn:
      "The red-and-black double-headed eagle of Albania, in weatherproof polyester.",
  },
  {
    title: "Flamur Tavoline i Kosovës me Bazë",
    titleEn: "Kosovo Table Flag with Base",
    category: "flags-pennants",
    brand: "Çarshia e Madhe",
    price: 7.5,
    stock: 60,
    rating: 4.5,
    thumb: "flag-kosovo.png",
    description:
      "Një flamur i vogël zyre i Kosovës mbi një bazë druri të lëmuar — për zyrën ose raftin.",
    descriptionEn:
      "A small Kosovo desk flag on a polished wooden base — for the office or shelf.",
  },
  {
    title: "Flamur Tavoline i Shqipërisë me Bazë",
    titleEn: "Albania Table Flag with Base",
    category: "flags-pennants",
    brand: "Çarshia e Madhe",
    price: 7.5,
    stock: 60,
    rating: 4.5,
    thumb: "flag-albania.png",
    description:
      "Një flamur i vogël zyre i Shqipërisë mbi një bazë druri të lëmuar.",
    descriptionEn:
      "A small Albania desk flag on a polished wooden base.",
  },
  {
    title: "Flamur Veture i Kosovës",
    titleEn: "Kosovo Car Flag",
    category: "flags-pennants",
    brand: "Çarshia e Madhe",
    price: 5,
    stock: 75,
    rating: 4.3,
    thumb: "flag-kosovo-waving.jpg",
    description:
      "Një flamur dritareje veture me kapëse — tunde ditën e ndeshjes.",
    descriptionEn:
      "A clip-on car window flag — wave it on match day.",
  },
  {
    title: "Distinktiv Jakës me Shqiponjën e Shqipërisë",
    titleEn: "Albania Eagle Lapel Pin",
    category: "flags-pennants",
    brand: "Filigran Gjakova",
    price: 4,
    stock: 110,
    rating: 4.6,
    thumb: "flag-albania.png",
    description:
      "Një distinktiv me shqiponjën dykrenare prej emaili për xhaketë ose çantë.",
    descriptionEn:
      "An enamelled double-headed eagle pin for jacket or bag.",
  },
  {
    title: "Flamurkë Miqësie Kosovë–Shqipëri",
    titleEn: "Kosovo–Albania Friendship Pennant",
    category: "flags-pennants",
    brand: "Autentika Gjakovë",
    price: 6,
    discount: 10,
    stock: 40,
    rating: 4.4,
    thumb: "flag-kosovo.png",
    description:
      "Një flamurkë e varur që bashkon të dy flamujt — një kujtim i popullarizuar i trashëgimisë së përbashkët.",
    descriptionEn:
      "A hanging pennant joining both flags — a popular keepsake of the shared heritage.",
  },
  {
    title: "Set Flamujsh Dore (Kosovë + Shqipëri)",
    titleEn: "Hand Flag Set (Kosovo + Albania)",
    category: "flags-pennants",
    brand: "Çarshia e Madhe",
    price: 5.5,
    stock: 65,
    rating: 4.5,
    thumb: "flag-albania-waving.jpg",
    description:
      "Një palë flamuj të vegjël dore për t'u tundur, mbi shkopinj druri.",
    descriptionEn:
      "A pair of small hand-waving flags on wooden sticks.",
  },

  // ---- Artisan Pantry ----
  {
    title: "Mjaltë Mali Lulesh të Egra (450g)",
    titleEn: "Wildflower Mountain Honey (450g)",
    featured: true,
    category: "artisan-pantry",
    brand: "Dukagjini Artisans",
    price: 9.5,
    stock: 48,
    rating: 4.9,
    thumb: "honey.jpg",
    description:
      "Mjaltë i papërpunuar dhe i pafiltruar nga livadhet alpine të Bjeshkëve të Nemuna, i mbushur në kavanoza nga bletarët e vegjël të Dukagjinit.",
    descriptionEn:
      "Raw, unfiltered honey from the alpine meadows of the Accursed Mountains, jarred by small Dukagjin beekeepers.",
  },
  {
    title: "Ajvar Shtëpie — i Butë (550g)",
    titleEn: "Homemade Ajvar — Mild (550g)",
    category: "artisan-pantry",
    brand: "Autentika Gjakovë",
    price: 6,
    stock: 52,
    rating: 4.8,
    thumb: "ajvar.jpg",
    description:
      "Ajvar me speca të kuq të pjekur, gatuar ngadalë sipas mënyrës tradicionale — i pranishëm në çdo tryezë kosovare.",
    descriptionEn:
      "Roasted red-pepper relish cooked the slow, traditional way — a staple of every Kosovar table.",
  },
  {
    title: "Ajvar Shtëpie — Djegës (550g)",
    titleEn: "Homemade Ajvar — Hot (550g)",
    category: "artisan-pantry",
    brand: "Autentika Gjakovë",
    price: 6,
    stock: 52,
    rating: 4.7,
    thumb: "ajvar.jpg",
    description:
      "I njëjti ajvar me speca të pjekur ngadalë, me një therje zjarri për ata që e duan djegës.",
    descriptionEn:
      "The same slow-roasted pepper ajvar, with a fiery kick for those who like it hot.",
  },
  {
    title: "Kavanoz Hoje Pylli (400g)",
    titleEn: "Forest Honeycomb Jar (400g)",
    category: "artisan-pantry",
    brand: "Dukagjini Artisans",
    price: 13,
    discount: 10,
    stock: 18,
    rating: 4.8,
    thumb: "honey.jpg",
    description:
      "Një kavanoz me copë hoje të zhytur në mjaltë lulesh të egra — drejt e nga zgjoi.",
    descriptionEn:
      "A jar of cut comb suspended in wildflower honey — straight from the hive.",
  },
  {
    title: "Pastë Specash të Pjekur (Pinxhur)",
    titleEn: "Roasted Pepper Spread (Pindjur)",
    category: "artisan-pantry",
    brand: "Autentika Gjakovë",
    price: 5.5,
    stock: 44,
    rating: 4.5,
    thumb: "ajvar.jpg",
    description:
      "Një pastë e lëmuar dhe e tymosur prej specash e domatesh — pinxhuri, kushëriri më pak i njohur i ajvarit.",
    descriptionEn:
      "A smooth, smoky pepper-and-tomato spread — pindjur, the lesser-known cousin of ajvar.",
  },
  {
    title: "Mjaltë Lulebliri (450g)",
    titleEn: "Linden Blossom Honey (450g)",
    category: "artisan-pantry",
    brand: "Dukagjini Artisans",
    price: 10,
    stock: 30,
    rating: 4.7,
    thumb: "honey.jpg",
    description:
      "Mjaltë lulebliri i çelët dhe aromatik, i mbledhur në fillim të verës — delikat dhe me aromë lulesh.",
    descriptionEn:
      "Pale, fragrant linden honey collected in early summer — delicate and floral.",
  },
];

async function main() {
  console.log("Seeding Autentika Gjakovë catalog…");

  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const categoryId = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categoryId.set(c.slug, row.id);
  }
  console.log(`Categories: ${CATEGORIES.length}`);

  const brandId = new Map<string, string>();
  for (const name of BRANDS) {
    const row = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    brandId.set(name, row.id);
  }
  console.log(`Brands: ${BRANDS.length}`);

  const data = PRODUCTS.map((p, i) => {
    const gallery = (p.gallery ?? [p.thumb]).map(P);
    return {
      title: p.title,
      titleEn: p.titleEn,
      slug: `${slugify(p.titleEn)}-${i + 1}`,
      description: p.description,
      descriptionEn: p.descriptionEn,
      price: p.price,
      discountPercentage: p.discount ?? 0,
      stockQuantity: p.stock,
      thumbnail: P(p.thumb),
      images: gallery,
      rating: p.rating,
      isFeatured: p.featured ?? false,
      categoryId: categoryId.get(p.category)!,
      brandId: brandId.get(p.brand)!,
    };
  });
  await prisma.product.createMany({ data });
  console.log(`Products: ${data.length}`);

  const [demoHash, adminHash] = await Promise.all([
    bcrypt.hash("demo1234", 10),
    bcrypt.hash("admin1234", 10),
  ]);

  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      phone: "+38349555123",
      passwordHash: demoHash,
      isVerified: true,
    },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      phone: "+38349555123",
      passwordHash: demoHash,
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      passwordHash: adminHash,
      isVerified: true,
      isAdmin: true,
    },
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      isVerified: true,
      isAdmin: true,
    },
  });
  console.log("Users: demo + admin");

  await prisma.address.deleteMany({ where: { userId: demo.id } });
  await prisma.address.create({
    data: {
      userId: demo.id,
      fullName: "Demo User",
      street: "Çarshia e Madhe 14",
      city: "Gjakovë",
      postalCode: "50000",
      type: "Home",
      isDefault: true,
    },
  });
  console.log("Sample address: Gjakovë");
  console.log("Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
