import { MOCK_PRODUCTS } from "../lib/products";

const products = MOCK_PRODUCTS;

const invalidProducts = products.filter(
  (product) => product.category !== "Electronics"
);

if (invalidProducts.length > 0) {
  const list = invalidProducts
    .map((product) => `${product.slug}: ${product.category} (${product.name})`)
    .join("\n");

  console.error("Electronics-only catalog validation failed. Found non-electronics products:\n" + list);
  process.exit(1);
}

console.log(`Catalog validation passed. ${products.length} products checked.`);
