export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "YOLO",
    url: "https://yolo.co",
    logo: "https://yolo.co/logo.png",
    image: "https://yolo.co/og.jpg",
    description: "YOLO Cameroun — Avenue Kennedy, Yaoundé. Premium electronics, apparel & lifestyle. Prix en FCFA.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Avenue Kennedy",
      addressLocality: "Yaoundé",
      addressRegion: "Centre",
      addressCountry: "CM",
    },
    geo: { "@type": "GeoCoordinates", latitude: 3.8481, longitude: 11.5023 },
    telephone: "+237699000000",
    email: "hello@yolo.co",
    priceRange: "FCFA",
    currenciesAccepted: "XAF",
    paymentAccepted: "Visa, Orange Money, MTN MoMo, Cash",
    openingHours: "Mo-Sa 09:00-19:00",
    sameAs: ["https://wa.me/237699000000"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ProductJsonLd({ product }: { product: { name: string; description: string; slug: string; price: number; images: string[]; rating?: number; reviewCount?: number; category: string } }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.images,
    url: `https://yolo.co/products/${product.slug}`,
    brand: { "@type": "Brand", name: "YOLO" },
    offers: {
      "@type": "Offer",
      price: Math.round(product.price * 620),
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "YOLO" },
      url: `https://yolo.co/products/${product.slug}`,
    },
    aggregateRating: product.rating
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount ?? 1, bestRating: 5, worstRating: 1 }
      : undefined,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
