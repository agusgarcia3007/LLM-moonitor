import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";
import { useSetActiveOrganization } from "@/services/organizations/mutations";
import {
  useGetOrganization,
  useGetOrganizationsList,
} from "@/services/organizations/query";

type Organization = { id: string; name: string; logo?: string | null };

interface OrgSelectorProps {
  onCreateProject: () => void;
  onEditOrg: (org: Organization) => void;
  onDeleteOrg: (org: Organization) => void;
}

export function OrgSelector({
  onCreateProject,
  onEditOrg,
  onDeleteOrg,
}: OrgSelectorProps) {
  const { t } = useTranslation();
  const {
    data: organizations,
    isLoading: organizationsLoading,
    isFetching: organizationsFetching,
  } = useGetOrganizationsList();
  const {
    data: activeOrganization,
    isLoading: activeOrgLoading,
    isFetching: activeOrgFetching,
  } = useGetOrganization();
  const { mutate: setActiveOrganization, isPending: isChangingOrg } =
    useSetActiveOrganization();

  const handleOrgChange = (org: { id: string }) => {
    setActiveOrganization(org.id);
  };

  const isLoading = useMemo(
    () =>
      organizationsLoading ||
      activeOrgLoading ||
      isChangingOrg ||
      organizationsFetching ||
      activeOrgFetching,
    [
      organizationsLoading,
      activeOrgLoading,
      isChangingOrg,
      organizationsFetching,
      activeOrgFetching,
    ]
  );

  const isEmpty = useMemo(
    () => !organizations || organizations.length === 0,
    [organizations]
  );

  const skeletonContent = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-sm" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ),
    []
  );

  const emptyContent = useMemo(
    () => (
      <>
        <Plus className="w-4 h-4" />
        <span className="font-semibold">{t("organization.empty_action")}</span>
      </>
    ),
    [t]
  );

  const activeOrgContent = useMemo(
    () => (
      <>
        <span className="font-semibold text-sm">
          {activeOrganization?.name}
        </span>
        <ChevronsUpDown className="size-3" />
      </>
    ),
    [activeOrganization?.name]
  );

  const skeletonDropdownContent = useMemo(
    () => (
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-16" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="size-5 rounded-sm" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    ),
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start gap-2">
          {isLoading
            ? skeletonContent
            : isEmpty
            ? emptyContent
            : activeOrgContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-64" align="start">
        {isLoading ? (
          skeletonDropdownContent
        ) : isEmpty ? (
          <DropdownMenuItem className="gap-2 p-2" onClick={onCreateProject}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">
              {t("organization.add_project")}
            </div>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("organization.organizations")}
            </DropdownMenuLabel>
            {organizations?.map((org: Organization) => (
              <div
                key={org.id}
                className="flex items-center justify-between group"
              >
                <DropdownMenuItem
                  onClick={() => handleOrgChange(org)}
                  className="gap-2 p-2 flex-1"
                >
                  <Avatar className="size-5 rounded-sm flex text-xs bg-sidebar-primary text-white">
                    <AvatarImage src={org.logo || undefined} />
                    <AvatarFallback className="text-xs bg-sidebar-primary text-white">
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {org.id}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      onClick={(e) => e.stopPropagation()}
                      title="Organization actions"
                      type="button"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditOrg(org)}>
                      {t("organization.editAction")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteOrg(org)}
                      className="text-destructive"
                    >
                      {t("organization.deleteAction")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
