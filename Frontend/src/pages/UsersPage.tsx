import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import { Switch } from "../components/ui/Switch";
import {
  createUserThunk,
  deleteUserThunk,
  fetchUsersSummaryThunk,
  fetchUsersThunk,
  setUsersPage,
  setUsersSearch,
  updateUserStatusThunk,
  updateUserThunk,
} from "../features/users/usersSlice";
import type { UserRole, UserRow } from "../types/api";

const roleTone: Record<UserRole, string> = {
  ADMIN: "bg-[#f7c5f1] text-[#9a1aa3]",
  MANAGER: "bg-[#d6f8dd] text-[#1b9a3b]",
  KITCHEN: "bg-[#fff4bd] text-[#9a8b00]",
  CASHIER: "bg-[#edf8b7] text-[#6b8400]",
  WAITER: "bg-[#d7f3ff] text-[#0d87bf]",
};

const roleOptions: UserRole[] = ["ADMIN", "MANAGER", "KITCHEN", "CASHIER", "WAITER"];

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

const emptyForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "MANAGER",
  isActive: true,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));

function SortGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#222222]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 7 4-4 4 4" />
      <path d="m14 13-4 4-4-4" />
    </svg>
  );
}

function TableHeaderCell({
  children,
  checkbox,
  className,
}: {
  children?: React.ReactNode;
  checkbox?: boolean;
  className?: string;
}) {
  return (
    <th className={`border-b border-r border-[#d8dce2] bg-[#f5f6f8] px-4 py-4 text-left text-[12px] font-medium text-[#24292f] ${className ?? ""}`}>
      <div className={`flex items-center ${checkbox ? "justify-center" : "justify-between"} gap-2`}>
        {children ? <span>{children}</span> : null}
        {!checkbox ? <SortGlyph /> : null}
      </div>
    </th>
  );
}

function RolePill({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-medium ${roleTone[role]}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

export function UsersPage() {
  const dispatch = useAppDispatch();
  const { summary, rows, pagination, search, mutating } = useAppSelector((state) => state.users);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  useEffect(() => {
    void dispatch(fetchUsersSummaryThunk());
  }, [dispatch]);

  useEffect(() => {
    void dispatch(
      fetchUsersThunk({
        search,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  }, [dispatch, pagination.limit, pagination.page, search]);

  const visibleSelectedIds = useMemo(
    () => selectedIds.filter((id) => rows.some((row) => row.id === id)),
    [rows, selectedIds]
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setForm({
      name: user.user,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.status,
    });
    setModalOpen(true);
  };

  const refreshUsers = async () => {
    await dispatch(fetchUsersSummaryThunk());
    await dispatch(
      fetchUsersThunk({
        search,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  const handleSubmit = async () => {
    if (editingUser) {
      await dispatch(
        updateUserThunk({
          id: editingUser.id,
          data: {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            ...(form.password ? { password: form.password } : {}),
          },
        })
      );
    } else {
      await dispatch(
        createUserThunk({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        })
      );
    }

    await refreshUsers();
    setModalOpen(false);
  };

  const handleDeleteSelected = async () => {
    for (const id of visibleSelectedIds) {
      await dispatch(deleteUserThunk(id));
    }
    setSelectedIds([]);
    await refreshUsers();
  };

  const summaryCards = useMemo(
    () => [
      { title: "Admin", value: summary?.admin ?? 0 },
      { title: "Manager", value: summary?.manager ?? 0 },
      { title: "Kitchen", value: summary?.kitchen ?? 0 },
      { title: "Cashier", value: summary?.cashier ?? 0 },
      { title: "Waiter", value: summary?.waiter ?? 0 },
    ],
    [summary]
  );

  const showingLabel = useMemo(() => {
    if (pagination.total === 0) return "Showing 0 Out of 0";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + rows.length - 1, pagination.total);
    return `Showing ${start}-${end} Out of ${pagination.total}`;
  }, [pagination.limit, pagination.page, pagination.total, rows.length]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle="Manage staff accounts, roles, and access control"
        action={<Button onClick={openCreate}>+ Add User</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <MetricCard key={card.title} title={card.title} value={`${card.value}`} note="Active staff" />
        ))}
      </section>

      <section className="rounded-[16px] bg-white px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 w-full max-w-[540px] items-center rounded-[8px] border border-[#d0d0d0] bg-white px-4 text-[#7d766d]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#7d766d]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <Input
              value={search}
              onChange={(event) => dispatch(setUsersSearch(event.target.value))}
              placeholder="Search by name ,phone"
              className="h-full border-0 bg-transparent px-4 text-[14px] placeholder:text-[#8f8a82] focus:bg-transparent"
            />
          </label>

          <button
            type="button"
            disabled={visibleSelectedIds.length === 0 || mutating}
            onClick={() => void handleDeleteSelected()}
            className="inline-flex h-11 min-w-[172px] items-center justify-center gap-3 rounded-[6px] border border-[#ff4f4f] bg-white px-5 text-[15px] font-medium text-[#ff3f3f] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 13H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
            Delete
          </button>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[#d8dce2]">
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <TableHeaderCell checkbox className="w-[48px] px-2">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && rows.every((row) => visibleSelectedIds.includes(row.id))}
                      onChange={() =>
                        setSelectedIds(rows.every((row) => selectedIds.includes(row.id)) ? [] : rows.map((row) => row.id))
                      }
                      className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="w-[255px]">User</TableHeaderCell>
                  <TableHeaderCell className="w-[250px]">Email</TableHeaderCell>
                  <TableHeaderCell className="w-[210px]">Role</TableHeaderCell>
                  <TableHeaderCell className="w-[170px]">Created</TableHeaderCell>
                  <TableHeaderCell className="w-[120px]">Status</TableHeaderCell>
                  <TableHeaderCell className="w-[115px] text-center">Action</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {rows.map((row, index) => {
                  const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;

                  return (
                    <tr key={row.id} className="h-[58px] transition hover:bg-[#fcfcfd]">
                      <td className="border-b border-r border-[#d8dce2] px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={visibleSelectedIds.includes(row.id)}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.includes(row.id) ? current.filter((item) => item !== row.id) : [...current, row.id]
                            )
                          }
                          className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                        />
                      </td>
                      <td className="border-b border-r border-[#d8dce2] px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-left leading-5 transition hover:opacity-80"
                        >
                          <p className="text-[14px] font-medium text-[#262626]">{row.user}</p>
                          <p className="text-[12px] text-[#8d8880]">ID: {rowNumber}</p>
                        </button>
                      </td>
                      <td className="border-b border-r border-[#d8dce2] px-4 py-3 text-[#2f2f2f]">{row.email}</td>
                      <td className="border-b border-r border-[#d8dce2] px-4 py-3">
                        <RolePill role={row.role} />
                      </td>
                      <td className="border-b border-r border-[#d8dce2] px-4 py-3 text-[#2f2f2f]">{formatDate(row.created)}</td>
                      <td className="border-b border-r border-[#d8dce2] px-4 py-3">
                        <div className="flex items-center justify-start">
                          <Switch
                            checked={row.status}
                            onChange={(checked) => void dispatch(updateUserStatusThunk({ id: row.id, isActive: checked }))}
                          />
                        </div>
                      </td>
                      <td className="border-b border-[#d8dce2] px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#efefef] text-[#383838] transition hover:bg-[#e6e6e6]"
                            aria-label="Edit user"
                          >
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await dispatch(deleteUserThunk(row.id));
                              await refreshUsers();
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#efefef] text-[#ff5a5a] transition hover:bg-[#f8efef]"
                            aria-label="Delete user"
                          >
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 13H6L5 6" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#857f76]">
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#7e786f] md:flex-row md:items-center md:justify-between">
          <span>{showingLabel}</span>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={(page) => dispatch(setUsersPage(page))}
          />
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Edit User" : "Add User"}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#5f5a53]">Name</label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#5f5a53]">Email</label>
            <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#5f5a53]">
              {editingUser ? "New Password (optional)" : "Password"}
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#5f5a53]">Role</label>
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-[#ece3d7] bg-[#fbfaf8] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#2f2b26]">Account status</p>
              <p className="text-[12px] text-[#7e786f]">Disable access without deleting the user.</p>
            </div>
            <Switch checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="danger" className="h-11 px-8" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button className="h-11 px-8" disabled={mutating} onClick={() => void handleSubmit()}>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
