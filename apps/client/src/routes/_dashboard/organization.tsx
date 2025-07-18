import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconBuilding,
  IconCopy,
  IconUser,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconMail,
  IconShield,
  IconUserMinus,
  IconDots,
} from "@tabler/icons-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useGetOrganization } from "@/services/organizations/query";
import {
  useUpdateOrganization,
  useDeleteOrganization,
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
  useCancelInvitation,
} from "@/services/organizations/mutations";

export const Route = createFileRoute("/_dashboard/organization")({
  component: OrganizationPage,
});

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: "member" | "admin" | "owner";
  createdAt: Date;
  user: {
    email: string;
    name: string;
    image?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: "member" | "admin" | "owner";
  status: string;
  expiresAt: Date;
  organizationId: string;
  inviterId: string;
}

function OrganizationPage() {
  const { t } = useTranslation();
  const { data: organization, isLoading } = useGetOrganization();

  const { mutate: updateOrganization, isPending: isUpdating } =
    useUpdateOrganization();
  const { mutate: deleteOrganization, isPending: isDeleting } =
    useDeleteOrganization();
  const { mutate: inviteMember, isPending: isInviting } = useInviteMember();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole();
  const { mutate: cancelInvitation, isPending: isCancelling } =
    useCancelInvitation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    logo: "",
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member" as "member" | "admin" | "owner",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("organization.copied"));
  };

  const handleEditOrganization = () => {
    if (!organization) return;
    setEditForm({
      name: organization.name || "",
      slug: organization.slug || "",
      logo: organization.logo || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrganization = () => {
    updateOrganization(
      {
        name: editForm.name,
        slug: editForm.slug,
        logo: editForm.logo,
      },
      {
        onSuccess: () => {
          toast.success("Organization updated successfully");
          setIsEditDialogOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to update organization");
          console.error(error);
        },
      }
    );
  };

  const handleDeleteOrganization = () => {
    if (!organization) return;
    deleteOrganization(organization.id, {
      onSuccess: () => {
        toast.success("Organization deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete organization");
        console.error(error);
      },
    });
  };

  const handleInviteMember = () => {
    inviteMember(
      {
        email: inviteForm.email,
        role: inviteForm.role,
      },
      {
        onSuccess: () => {
          toast.success("Invitation sent successfully");
          setIsInviteDialogOpen(false);
          setInviteForm({ email: "", role: "member" });
        },
        onError: (error) => {
          toast.error("Failed to send invitation");
          console.error(error);
        },
      }
    );
  };

  const handleRemoveMember = (memberIdOrEmail: string) => {
    removeMember(
      { memberIdOrEmail },
      {
        onSuccess: () => {
          toast.success("Member removed successfully");
        },
        onError: (error) => {
          toast.error("Failed to remove member");
          console.error(error);
        },
      }
    );
  };

  const handleUpdateMemberRole = (
    memberId: string,
    role: "member" | "admin" | "owner"
  ) => {
    updateMemberRole(
      { memberId, role },
      {
        onSuccess: () => {
          toast.success("Member role updated successfully");
        },
        onError: (error) => {
          toast.error("Failed to update member role");
          console.error(error);
        },
      }
    );
  };

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitation(invitationId, {
      onSuccess: () => {
        toast.success("Invitation cancelled successfully");
      },
      onError: (error) => {
        toast.error("Failed to cancel invitation");
        console.error(error);
      },
    });
  };

  const membersColumns: ColumnDef<Member>[] = [
    {
      accessorKey: "user",
      header: createSortableHeader("User"),
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.user.image || ""} />
              <AvatarFallback className="text-xs">
                {member.user.name ? (
                  getInitials(member.user.name)
                ) : (
                  <IconUser size={14} />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: createSortableHeader("Role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("Joined"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <span className="text-sm">
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleUpdateMemberRole(member.id, "admin")}
                disabled={isUpdatingRole || member.role === "owner"}
              >
                <IconShield className="h-4 w-4" />
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateMemberRole(member.id, "member")}
                disabled={isUpdatingRole || member.role === "owner"}
              >
                <IconUser className="h-4 w-4" />
                Make Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRemoveMember(member.user.email)}
                disabled={isRemoving || member.role === "owner"}
                className="text-destructive"
              >
                <IconUserMinus className="h-4 w-4" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const invitationsColumns: ColumnDef<Invitation>[] = [
    {
      accessorKey: "email",
      header: createSortableHeader("Email"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: createSortableHeader("Role"),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant="outline">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: createSortableHeader("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "pending" ? "secondary" : "default"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: createSortableHeader("Expires"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("expiresAt"));
        return (
          <span className="text-sm">
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invitation = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCancelInvitation(invitation.id)}
            isLoading={isCancelling}
          >
            Cancel
          </Button>
        );
      },
    },
  ];

  const members: Member[] = organization?.members || [];
  const invitations: Invitation[] = organization?.invitations || [];

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-center py-8">
          <IconBuilding className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No organization found</h3>
          <p className="text-muted-foreground">
            You don't belong to any organization yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("organization.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("organization.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEditOrganization} isLoading={isUpdating}>
            <IconEdit className="h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" isLoading={isDeleting}>
                <IconTrash className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  organization and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrganization}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("organization.organizationInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization.logo || ""} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {organization.name ? (
                  getInitials(organization.name)
                ) : (
                  <IconBuilding size={24} />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{organization.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("organization.slug")}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                  {organization.slug}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(organization.slug)}
                >
                  <IconCopy size={16} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                ID
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                  {organization.id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(organization.id)}
                >
                  <IconCopy size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("organization.members")}</CardTitle>
              <CardDescription>
                {t("organization.membersDescription")}
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsInviteDialogOpen(true)}
              isLoading={isInviting}
            >
              <IconUserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={membersColumns}
            data={members}
            isLoading={false}
          />
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that are waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={invitationsColumns}
              data={invitations}
              isLoading={false}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update your organization details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm({ ...editForm, slug: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={editForm.logo}
                onChange={(e) =>
                  setEditForm({ ...editForm, logo: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization} isLoading={isUpdating}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value: "member" | "admin" | "owner") =>
                  setInviteForm({ ...inviteForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteMember} isLoading={isInviting}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
