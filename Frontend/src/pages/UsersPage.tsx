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
  ADMIN: "bg-[#f6d2fa] text-[#9821a6]",
  MANAGER: "bg-[#d8f7df] text-[#1f9a41]",
  KITCHEN: "bg-[#fff3bf] text-[#9b8400]",
  CASHIER: "bg-[#edf9b7] text-[#6d8500]",
  WAITER: "bg-[#d6f1ff] text-[#0b86bf]",
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
    if (pagination.total === 0) return "Showing 0 users";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + rows.length - 1, pagination.total);
    return `Showing ${start}-${end} of ${pagination.total} users`;
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

      <section className="rounded-[28px] border border-[#e9e0d4] bg-white p-5 shadow-[0_18px_50px_rgba(52,39,21,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(event) => dispatch(setUsersSearch(event.target.value))}
            placeholder="Search by name or email"
            className="w-full md:max-w-[380px] bg-white"
          />
          <Button
            variant="danger"
            disabled={visibleSelectedIds.length === 0 || mutating}
            onClick={() => void handleDeleteSelected()}
          >
            Delete
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#e7dfd4]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#fbfaf8] text-[12px] font-semibold text-[#5d584f]">
                <tr>
                  <th className="w-12 border-b border-[#e7dfd4] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && rows.every((row) => visibleSelectedIds.includes(row.id))}
                      onChange={() =>
                        setSelectedIds(
                          rows.every((row) => selectedIds.includes(row.id)) ? [] : rows.map((row) => row.id)
                        )
                      }
                    />
                  </th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">User</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Email</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Role</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Created</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Status</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fcfaf6]">
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <input
                        type="checkbox"
                        checked={visibleSelectedIds.includes(row.id)}
                        onChange={() =>
                          setSelectedIds((current) =>
                            current.includes(row.id)
                              ? current.filter((item) => item !== row.id)
                              : [...current, row.id]
                          )
                        }
                      />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-medium">{row.user}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.email}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <span className={`inline-flex rounded-full px-4 py-2 text-[12px] font-semibold ${roleTone[row.role]}`}>
                        {row.role.charAt(0) + row.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{formatDate(row.created)}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <Switch
                        checked={row.status}
                        onChange={(checked) => void dispatch(updateUserStatusThunk({ id: row.id, isActive: checked }))}
                      />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="h-9 px-3" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="h-9 px-3"
                          onClick={async () => {
                            await dispatch(deleteUserThunk(row.id));
                            await refreshUsers();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#857f76]">
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
      >
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
            <Select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
            >
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
