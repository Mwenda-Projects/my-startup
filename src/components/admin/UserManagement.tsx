import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, ShieldCheck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role?: string;
}

interface UserManagementProps {
  users: UserProfile[];
  onRefresh: () => void;
}

const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      // First, remove existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Then add new role - cast to the enum type
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole as "admin" | "moderator" | "user",
      });

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `User role changed to ${newRole}`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4 text-red-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {user.full_name || "Unknown"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {getRoleBadge(user.role)}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role || "user"}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={isUpdating === user.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
