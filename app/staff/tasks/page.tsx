"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, task: "Follow up with Beta Solutions (Invoice INV-01456)", relatedTo: "Invoice", priority: "High", priorityColor: "bg-red-100 text-red-700 border-red-200", dueDate: "Oct 31, 2026", status: "Overdue", statusColor: "bg-red-100 text-red-700 border-red-200", done: false },
    { id: 2, task: "Send quotation to GreenLeaf Co.", relatedTo: "Quotation", priority: "Medium", priorityColor: "bg-amber-100 text-amber-700 border-amber-200", dueDate: "Today", status: "In Progress", statusColor: "bg-blue-100 text-blue-700 border-blue-200", done: false },
    { id: 3, task: "Confirm subscription for Metro Digital", relatedTo: "Subscription", priority: "Medium", priorityColor: "bg-amber-100 text-amber-700 border-amber-200", dueDate: "Today", status: "In Progress", statusColor: "bg-blue-100 text-blue-700 border-blue-200", done: false },
    { id: 4, task: "Payment follow-up – Sunrise Tech (₹3,540)", relatedTo: "Payment", priority: "Medium", priorityColor: "bg-amber-100 text-amber-700 border-amber-200", dueDate: "Tomorrow", status: "Pending", statusColor: "bg-orange-100 text-orange-700 border-orange-200", done: false },
    { id: 5, task: "Prepare renewal for Nova Systems", relatedTo: "Renewal", priority: "Low", priorityColor: "bg-green-100 text-green-700 border-green-200", dueDate: "Nov 07, 2026", status: "Pending", statusColor: "bg-orange-100 text-orange-700 border-orange-200", done: false },
  ]);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ task: "", relatedTo: "Invoice", priority: "Medium", dueDate: "Today" });

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.task.toLowerCase().includes(search.toLowerCase()) || t.relatedTo.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [tasks, search, priorityFilter, statusFilter]);

  const handleToggleDone = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const next = !t.done;
        if (next) toast.success(`Task completed: "${t.task}"`);
        else toast.info(`Task marked pending`);
        return { ...t, done: next, status: next ? "Completed" : "Pending", statusColor: next ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200" };
      }
      return t;
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.task) {
      toast.error("Please enter a task description");
      return;
    }
    const created = {
      id: Date.now(),
      task: newTask.task,
      relatedTo: newTask.relatedTo,
      priority: newTask.priority,
      priorityColor: newTask.priority === "High" ? "bg-red-100 text-red-700 border-red-200" : newTask.priority === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200",
      dueDate: newTask.dueDate,
      status: "In Progress",
      statusColor: "bg-blue-100 text-blue-700 border-blue-200",
      done: false,
    };
    setTasks([created, ...tasks]);
    setShowAddModal(false);
    setNewTask({ task: "", relatedTo: "Invoice", priority: "Medium", dueDate: "Today" });
    toast.success("New task assigned successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
          <p className="text-gray-500 text-xs mt-1">Tasks assigned to you by the Admin and automated renewal system.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main Table Card with Outline */}
      <div className="bg-white rounded-2xl shadow-xs border border-blue-200/80 overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-blue-100 bg-blue-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/70 rounded-xl bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-blue-200/70 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">All Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-blue-200/70 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Overdue">Overdue</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 w-8"></th>
                <th className="px-3 py-3">Task</th>
                <th className="px-5 py-3">Related To</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleDone(t.id)}
                      className="w-4 h-4 rounded text-blue-600 border-blue-300 focus:ring-blue-400 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-gray-900">
                    <span className={t.done ? "line-through text-gray-400 font-normal" : ""}>{t.task}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{t.relatedTo}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${t.priorityColor}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{t.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${t.statusColor}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleDone(t.id)}
                      className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold transition"
                    >
                      {t.done ? "Undo" : "Complete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Add New Task</h2>
            <p className="text-xs text-gray-500 mb-4">Create a task assignment for the staff workflow.</p>
            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Task Description *</label>
                <input
                  type="text"
                  required
                  value={newTask.task}
                  onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  placeholder="e.g. Follow up on overdue invoice INV-01455"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Related To</label>
                  <select
                    value={newTask.relatedTo}
                    onChange={(e) => setNewTask({ ...newTask, relatedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option>Invoice</option>
                    <option>Quotation</option>
                    <option>Subscription</option>
                    <option>Payment</option>
                    <option>Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Due Date</label>
                <input
                  type="text"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  placeholder="e.g. Today, Tomorrow, or Nov 10"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
