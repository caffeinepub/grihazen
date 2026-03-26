import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BudgetTag, ConversionStatus, type Lead, UrgencyTag } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteLead,
  useIsAdmin,
  useLeadStats,
  useLeads,
  useUpdateLeadNotes,
  useUpdateLeadStatus,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const URGENCY_COLORS: Record<string, string> = {
  [UrgencyTag.hot]: "bg-red-100 text-red-700",
  [UrgencyTag.warm]: "bg-amber-100 text-amber-700",
  [UrgencyTag.cold]: "bg-blue-100 text-blue-700",
};

const BUDGET_COLORS: Record<string, string> = {
  [BudgetTag.premium]: "bg-purple-100 text-purple-700",
  [BudgetTag.mid]: "bg-emerald-100 text-emerald-700",
  [BudgetTag.standard]: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS: Record<string, string> = {
  [ConversionStatus.new_]: "bg-blue-50 text-blue-700",
  [ConversionStatus.contacted]: "bg-yellow-50 text-yellow-700",
  [ConversionStatus.qualified]: "bg-indigo-50 text-indigo-700",
  [ConversionStatus.converted]: "bg-green-50 text-green-700",
  [ConversionStatus.lost]: "bg-red-50 text-red-500",
};

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  if (ms === 0) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(leads: Lead[]) {
  const headers = [
    "ID",
    "Name",
    "Phone",
    "Email",
    "Property",
    "Budget Range",
    "Location",
    "Timeline",
    "Budget Tag",
    "Urgency",
    "Status",
    "Created",
  ];
  const rows = leads.map((l) => [
    String(l.id),
    l.name,
    l.phone,
    l.email,
    l.propertyType,
    l.budgetRange,
    l.location,
    l.timeline,
    l.budgetTag,
    l.urgencyTag,
    l.conversionStatus,
    formatDate(l.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `grihazen-leads-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────

function LeadRow({ lead, index }: { lead: Lead; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.notes);
  const updateStatus = useUpdateLeadStatus();
  const updateNotes = useUpdateLeadNotes();
  const deleteLead = useDeleteLead();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: lead.id,
        status: status as ConversionStatus,
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes.mutateAsync({ id: lead.id, notes });
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete lead from ${lead.name}?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <>
      <TableRow
        data-ocid={`leads.item.${index + 1}`}
        className="cursor-pointer hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="font-medium text-sm">{lead.name}</TableCell>
        <TableCell className="text-sm">{lead.phone}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {lead.email}
        </TableCell>
        <TableCell className="text-sm">{lead.propertyType}</TableCell>
        <TableCell className="text-sm">{lead.budgetRange}</TableCell>
        <TableCell className="text-sm">{lead.location}</TableCell>
        <TableCell className="text-sm">{lead.timeline}</TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Badge className={`text-xs ${BUDGET_COLORS[lead.budgetTag] || ""}`}>
            {lead.budgetTag}
          </Badge>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Badge className={`text-xs ${URGENCY_COLORS[lead.urgencyTag] || ""}`}>
            {lead.urgencyTag}
          </Badge>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Select
            value={lead.conversionStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger
              data-ocid={`leads.status.select.${index + 1}`}
              className={`w-32 text-xs h-7 rounded-full border-0 ${STATUS_COLORS[lead.conversionStatus] || ""}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ConversionStatus).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {formatDate(lead.createdAt)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0"
              data-ocid={`leads.expand.${index + 1}`}
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              data-ocid={`leads.delete_button.${index + 1}`}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={13} className="bg-muted/20 p-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Notes
              </p>
              <Textarea
                data-ocid={`leads.notes.${index + 1}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                className="text-sm min-h-[80px] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                size="sm"
                data-ocid={`leads.save_button.${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveNotes();
                }}
                disabled={updateNotes.isPending}
                className="rounded-full bg-gold text-foreground hover:brightness-95 text-xs"
              >
                {updateNotes.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function Dashboard() {
  const { data: leads = [], isLoading } = useLeads();
  const { data: stats } = useLeadStats();
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (budgetFilter !== "all" && l.budgetTag !== budgetFilter) return false;
      if (urgencyFilter !== "all" && l.urgencyTag !== urgencyFilter)
        return false;
      if (statusFilter !== "all" && l.conversionStatus !== statusFilter)
        return false;
      if (
        search &&
        !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.phone.includes(search) &&
        !l.location.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [leads, budgetFilter, urgencyFilter, statusFilter, search]);

  const totalLeads = Number(stats?.total ?? 0);
  const hotLeads = leads.filter((l) => l.urgencyTag === UrgencyTag.hot).length;
  const newLeads = leads.filter(
    (l) => l.conversionStatus === ConversionStatus.new_,
  ).length;
  const converted = leads.filter(
    (l) => l.conversionStatus === ConversionStatus.converted,
  ).length;

  const statCards = [
    { label: "Total Leads", value: totalLeads, color: "text-blue-600" },
    { label: "Hot Leads", value: hotLeads, color: "text-red-500" },
    { label: "New Leads", value: newLeads, color: "text-amber-500" },
    { label: "Converted", value: converted, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((sc) => (
          <div
            key={sc.label}
            className="bg-white rounded-xl border border-border p-5 shadow-xs"
          >
            <p className="text-xs text-muted-foreground tracking-wide mb-1">
              {sc.label}
            </p>
            <p className={`font-display text-3xl font-bold ${sc.color}`}>
              {sc.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            data-ocid="admin.search.search_input"
            placeholder="Search by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full h-9 text-sm w-64"
          />

          <Select value={budgetFilter} onValueChange={setBudgetFilter}>
            <SelectTrigger
              data-ocid="admin.budget.select"
              className="w-36 h-9 text-sm rounded-full"
            >
              <SelectValue placeholder="Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              {Object.values(BudgetTag).map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger
              data-ocid="admin.urgency.select"
              className="w-36 h-9 text-sm rounded-full"
            >
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              {Object.values(UrgencyTag).map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              data-ocid="admin.status.select"
              className="w-36 h-9 text-sm rounded-full"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(ConversionStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            data-ocid="admin.export.button"
            onClick={() => exportCSV(filtered)}
            className="rounded-full ml-auto h-9 text-sm border-gold text-gold hover:bg-gold hover:text-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="leads.loading_state"
          >
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground text-sm"
            data-ocid="leads.empty_state"
          >
            No leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Property</TableHead>
                  <TableHead className="text-xs">Budget</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Timeline</TableHead>
                  <TableHead className="text-xs">Tag</TableHead>
                  <TableHead className="text-xs">Urgency</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead, i) => (
                  <LeadRow key={String(lead.id)} lead={lead} index={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-border p-10 max-w-sm w-full text-center shadow-card">
        <p className="font-display text-3xl font-bold mb-2">
          <span className="text-gold">G</span>RIHAZEN
        </p>
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-8">
          Admin Dashboard
        </p>
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-gold text-xl">🔐</span>
        </div>
        <h1 className="font-display text-xl font-semibold mb-2">
          Sign In Required
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Access the admin dashboard to manage leads and track conversions.
        </p>
        <Button
          data-ocid="admin.login.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full rounded-full bg-gold text-foreground hover:brightness-95 font-semibold"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...
            </>
          ) : (
            "Sign In with Internet Identity"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();

  if (isInitializing || checkingAdmin) {
    return (
      <div
        className="min-h-screen bg-beige flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-4">
        <div
          className="bg-white rounded-2xl border border-border p-10 max-w-sm w-full text-center shadow-card"
          data-ocid="admin.error_state"
        >
          <p className="text-2xl mb-4">🚫</p>
          <h1 className="font-display text-xl font-semibold mb-2">
            Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account does not have admin privileges. Contact the
            administrator.
          </p>
          <Button
            variant="outline"
            onClick={clear}
            className="rounded-full border-border"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      {/* Admin Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-lg font-bold">
              <span className="text-gold">G</span>RIHAZEN
            </a>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            data-ocid="admin.signout.button"
            className="text-xs text-muted-foreground hover:text-foreground rounded-full"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Lead Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all incoming leads
          </p>
        </div>
        <Dashboard />
      </main>
    </div>
  );
}
