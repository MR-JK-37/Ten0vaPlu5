import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { CreateProductDialog } from "@/components/catalog/create-product-dialog";
import { ProductVariants } from "@/components/catalog/product-variants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const instant = false;

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, type, sales_price, cost_price, is_active, product_attributes(id, name, product_variant_values(id, value, extra_price))"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <CreateProductDialog />
      </div>
      <div className="mt-6 space-y-4">
        {products?.length ? (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {product.name}
                    <Badge variant="secondary" className="capitalize">
                      {product.type}
                    </Badge>
                    {!product.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sales {formatMoney(product.sales_price)} · Cost {formatMoney(product.cost_price)}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <ProductVariants productId={product.id} attributes={product.product_attributes} />
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No products yet.</p>
        )}
      </div>
    </div>
  );
}
