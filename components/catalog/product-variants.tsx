"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addAttribute, addVariantValue } from "@/lib/catalog/actions";
import { formatMoney } from "@/lib/money/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VariantValue {
  id: string;
  value: string;
  extra_price: number;
}

interface Attribute {
  id: string;
  name: string;
  product_variant_values: VariantValue[];
}

export function ProductVariants({
  productId,
  attributes,
}: {
  productId: string;
  attributes: Attribute[] | null;
}) {
  const router = useRouter();
  const [addingAttribute, setAddingAttribute] = useState(false);
  const [attrState, attrAction] = useActionState(addAttribute, undefined);
  const [handledAttrState, setHandledAttrState] = useState(attrState);

  if (attrState !== handledAttrState) {
    setHandledAttrState(attrState);
    if (attrState && !attrState.error) {
      setAddingAttribute(false);
    }
  }

  useEffect(() => {
    if (attrState && !attrState.error) {
      router.refresh();
    }
  }, [attrState, router]);

  return (
    <div className="space-y-3">
      {attributes?.map((attribute) => (
        <div key={attribute.id} className="rounded-md border p-3">
          <p className="text-sm font-medium">{attribute.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {attribute.product_variant_values.map((v) => (
              <Badge key={v.id} variant="outline">
                {v.value} (+{formatMoney(v.extra_price)})
              </Badge>
            ))}
          </div>
          <AddVariantValueForm attributeId={attribute.id} />
        </div>
      ))}

      {addingAttribute ? (
        <form action={attrAction} className="flex items-center gap-2">
          <input type="hidden" name="productId" value={productId} />
          <Input name="name" placeholder="Attribute name e.g. Brand" autoFocus className="h-8 w-48" />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAddingAttribute(true)}>
          + Attribute
        </Button>
      )}
    </div>
  );
}

function AddVariantValueForm({ attributeId }: { attributeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(addVariantValue, undefined);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state && !state.error) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (state && !state.error) {
      router.refresh();
    }
  }, [state, router]);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOpen(true)}>
        + Value
      </Button>
    );
  }

  return (
    <form action={action} className="mt-2 flex items-center gap-2">
      <input type="hidden" name="attributeId" value={attributeId} />
      <Input name="value" placeholder="e.g. Odoo" className="h-8 w-32" autoFocus />
      <Input name="extraPrice" type="number" step="0.01" placeholder="Extra price" className="h-8 w-28" />
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}
