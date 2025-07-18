import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { IconBuilding, IconCopy, IconUser } from "@tabler/icons-react";

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
import { toast } from "sonner";
import { useGetOrganization } from "@/services/organizations/query";

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

function OrganizationPage() {
  const { t } = useTranslation();
  const { data: organization, isLoading } = useGetOrganization();

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
  ];

  const members: Member[] = organization?.members || [];

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("organization.title")}
        </h1>
        <p className="text-muted-foreground">{t("organization.description")}</p>
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
          <CardTitle>{t("organization.members")}</CardTitle>
          <CardDescription>
            {t("organization.membersDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={membersColumns}
            data={members}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
