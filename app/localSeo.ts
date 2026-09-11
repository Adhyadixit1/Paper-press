import { b2bCategories } from "./catalog";

export type PackagingLocation = {
  slug: string;
  name: string;
  region: string;
  type: "Jaipur locality" | "Rajasthan city" | "industrial hub";
  angle: string;
};

export const packagingLocations: PackagingLocation[] = [
  { slug: "jaipur", name: "Jaipur", region: "Rajasthan", type: "Rajasthan city", angle: "fast-growing food, retail, FMCG and D2C brands" },
  { slug: "vaishali-nagar", name: "Vaishali Nagar", region: "Jaipur", type: "Jaipur locality", angle: "cafes, bakeries, boutiques and homegrown labels" },
  { slug: "mansarovar", name: "Mansarovar", region: "Jaipur", type: "Jaipur locality", angle: "restaurants, coaching brands, clinics and retail stores" },
  { slug: "c-scheme", name: "C-Scheme", region: "Jaipur", type: "Jaipur locality", angle: "premium retail, hospitality and gifting-led businesses" },
  { slug: "malviya-nagar", name: "Malviya Nagar", region: "Jaipur", type: "Jaipur locality", angle: "food outlets, clinics, salons and modern trade teams" },
  { slug: "sitapura", name: "Sitapura", region: "Jaipur", type: "industrial hub", angle: "manufacturers, exporters and institutional buyers" },
  { slug: "vki-area", name: "VKI Area", region: "Jaipur", type: "industrial hub", angle: "bulk production, warehousing and industrial dispatch" },
  { slug: "tonk-road", name: "Tonk Road", region: "Jaipur", type: "Jaipur locality", angle: "hotels, offices, cafes and event-led businesses" },
  { slug: "jagatpura", name: "Jagatpura", region: "Jaipur", type: "Jaipur locality", angle: "new-age cafes, hostels, clinics and service businesses" },
  { slug: "sodala", name: "Sodala", region: "Jaipur", type: "Jaipur locality", angle: "local retail, food businesses and service teams" },
  { slug: "ajmer", name: "Ajmer", region: "Rajasthan", type: "Rajasthan city", angle: "sweet shops, institutions, hotels and distributors" },
  { slug: "jodhpur", name: "Jodhpur", region: "Rajasthan", type: "Rajasthan city", angle: "spice, handicraft, hospitality and retail brands" },
  { slug: "udaipur", name: "Udaipur", region: "Rajasthan", type: "Rajasthan city", angle: "hotel, gifting, beauty and premium retail teams" },
  { slug: "kota", name: "Kota", region: "Rajasthan", type: "Rajasthan city", angle: "coaching institutes, food outlets and healthcare buyers" },
  { slug: "bikaner", name: "Bikaner", region: "Rajasthan", type: "Rajasthan city", angle: "namkeen, sweets, dry snacks and FMCG manufacturers" },
  { slug: "alwar", name: "Alwar", region: "Rajasthan", type: "Rajasthan city", angle: "industrial suppliers, dairies and ecommerce dispatch" },
  { slug: "sikar", name: "Sikar", region: "Rajasthan", type: "Rajasthan city", angle: "institutions, cafes, healthcare and local retail" },
  { slug: "bhilwara", name: "Bhilwara", region: "Rajasthan", type: "Rajasthan city", angle: "textile, garment, trading and office supply needs" },
  { slug: "bharatpur", name: "Bharatpur", region: "Rajasthan", type: "Rajasthan city", angle: "food manufacturers, retailers and institutional buyers" },
  { slug: "pali", name: "Pali", region: "Rajasthan", type: "Rajasthan city", angle: "textile, packaging, dispatch and export supply chains" },
  { slug: "beawar", name: "Beawar", region: "Rajasthan", type: "Rajasthan city", angle: "trading, mineral, industrial and retail businesses" },
  { slug: "neemrana", name: "Neemrana", region: "Rajasthan", type: "industrial hub", angle: "industrial production, warehousing and repeat procurement" },
  { slug: "kishangarh", name: "Kishangarh", region: "Rajasthan", type: "Rajasthan city", angle: "stone, marble, hospitality and business gifting" },
  { slug: "chittorgarh", name: "Chittorgarh", region: "Rajasthan", type: "Rajasthan city", angle: "industrial brands, food businesses and institutional teams" },
  { slug: "sri-ganganagar", name: "Sri Ganganagar", region: "Rajasthan", type: "Rajasthan city", angle: "agri, FMCG, retail and distribution businesses" },
];

export const localSeoCategories = b2bCategories;

export const localSeoPages = localSeoCategories.flatMap((category) =>
  packagingLocations.map((location) => ({ category, location })),
);

export function getLocalSeoPage(categorySlug: string, locationSlug: string) {
  return localSeoPages.find(
    (page) => page.category.slug === categorySlug && page.location.slug === locationSlug,
  );
}

export function localSeoTitle(categoryName: string, locationName: string) {
  return `${categoryName} in ${locationName} | Paper & Press Jaipur`;
}

export function localSeoDescription(categoryName: string, locationName: string) {
  return `Wholesale ${categoryName.toLowerCase()} in ${locationName} with custom sizes, plain and branded options, material guidance, bulk pricing and door-to-door delivery from Paper & Press Jaipur.`;
}

export function categoryKeyword(categoryName: string) {
  return categoryName
    .replace("&", "and")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
