const productGallerySystems:Record<string,string[]>={
  'food-paper':['food-paper','burger-boxes','fries-trays','meal-boxes'],
  'printed-tissue':['packaging-sleeves','garment-boxes','retail-paper-bags','stickers-labels'],
  'cups':['paper-cups','cup-sleeves','cup-carriers','coffee-bags'],
  'coffee-bags':['coffee-bags','stickers-labels','packaging-sleeves','corrugated-mailers'],
  'cotton-totes':['retail-paper-bags','garment-boxes','garment-flyers','stickers-labels'],
  'poly-mailers':['corrugated-mailers','courier-boxes','garment-flyers','stickers-labels'],
  'rigid-boxes':['tea-dryfruit-boxes','chocolate-boxes','cosmetic-cartons','garment-boxes'],
  'gift-boxes':['chocolate-boxes','mithai-boxes','tea-dryfruit-boxes','box-inserts-dividers'],
  'pizza-boxes':['pizza-boxes','food-paper','burger-boxes','meal-boxes'],
  'cup-sleeves':['cup-sleeves','paper-cups','cup-carriers','coffee-bags'],
  'cold-cups':['paper-cups','cup-carriers','cup-sleeves','stickers-labels'],
  'napkins':['food-paper','meal-boxes','fries-trays','stickers-labels'],
  'business-cards':['garment-flyers','office-folders','packaging-sleeves','stickers-labels'],
  'brochures':['office-folders','hospital-files','garment-flyers','packaging-sleeves'],
  'press-kits':['cosmetic-cartons','box-inserts-dividers','garment-flyers','corrugated-mailers'],
  'inserts':['garment-flyers','box-inserts-dividers','stickers-labels','packaging-sleeves'],
  'plain-corrugated-boxes':['plain-corrugated-boxes','plain-corrugated-boxes','plain-corrugated-boxes','plain-corrugated-boxes'],
};

export function productGalleryFor(slug:string){
  return (productGallerySystems[slug]||['packaging-sleeves','box-inserts-dividers','stickers-labels','corrugated-mailers']).map((category,index)=>`/catalog/${category}-${slug==='plain-corrugated-boxes'?String(index+1).padStart(2,'0'):'01'}.webp`);
}

export function productCardGallery(slug:string,primary:string){
  return [...new Set([primary,...productGalleryFor(slug)])].slice(0,4);
}

export function categoryCardGallery(slug:string){
  return [1,2,3,4].map(index=>`/catalog/${slug}-${String(index).padStart(2,'0')}.webp`);
}
