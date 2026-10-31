import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function CustomersTable({ basePath }: { basePath: string }) {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, email, phone, company")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <CreateCustomerDialog />
      </div>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link href={`${basePath}/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.company ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!customers?.length && (
          <p className="p-4 text-sm text-muted-foreground">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
