import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { PageLink, PageTitle } from "../../../../../_metronic/layout/core";
import { UsersListWrapper } from "./users-list/UsersList";


const usersBreadcrumbs: Array<PageLink> = [
  {
    title: "User Management",
    path: "/apps/user-management/users",
    isSeparator: false,
    isActive: false,
  },
  {
    title: "",
    path: "",
    isSeparator: true,
    isActive: false,
  },
];

export function UserManagement () {
  return (
    <>
      {/* <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle> */}
      <UsersListWrapper />
    </>
  );
};

