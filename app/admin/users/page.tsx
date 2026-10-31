import { createClient } from "@/lib/supabase/server";
import { CreateStaffDialog } from "@/components/admin/create-staff-dialog";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .in("role", ["staff", "admin"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <CreateStaffDialog />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Staff and admin accounts only — customers self-sign-up and are managed under
        Customers.
      </p>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name ?? "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "secondary" : "destructive"}>
                    {user.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <UserRowActions userId={user.id} isActive={user.is_active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!users?.length && <p className="p-4 text-sm text-muted-foreground">No staff yet.</p>}
      </div>
    </div>
  );
}
