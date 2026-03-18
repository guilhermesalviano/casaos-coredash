"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import confetti from "canvas-confetti";
import Image from "next/image";

type Priority = "high" | "medium" | "low";

interface Todo {
  id: number;
  title: string;
  checked: number;
  priority: Priority;
}

interface NewTaskForm {
  title: string;
  priority: Priority;
  recurrence: {
    repeat: boolean;
    weeklyInterval: number;
    weeklyDays: number[];
    weeklyEnd: number | null;
  };
}

const priorityColor: Record<Priority, string> = {
  high: "#FCA5A5",
  medium: "#FDE68A",
  low: "#6EE7B7",
};

const priorityLabel: Record<Priority, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const WEEK_DAYS = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
] as const;

const INITIAL_FORM: NewTaskForm = {
  title: "",
  priority: "medium",
  recurrence: {
    repeat: false,
    weeklyInterval: 1,
    weeklyDays: [0],
    weeklyEnd: null,
  },
};

function TaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (form: NewTaskForm) => void;
}) {
  const [form, setForm] = useState<NewTaskForm>(INITIAL_FORM);

  // Stable callbacks — no inline arrow functions recreated on each keystroke
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, title: e.target.value })),
    []
  );

  const handlePriority = useCallback(
    (p: Priority) => setForm((f) => ({ ...f, priority: p })),
    []
  );

  const handleToggleRepeat = useCallback(
    () =>
      setForm((f) => ({
        ...f,
        recurrence: { ...f.recurrence, repeat: !f.recurrence.repeat },
      })),
    []
  );

  const handleWeeklyIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        recurrence: {
          ...f.recurrence,
          weeklyInterval: Math.max(1, Number(e.target.value)),
        },
      })),
    []
  );

  const handleWeeklyEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        recurrence: {
          ...f.recurrence,
          weeklyEnd: e.target.value ? new Date(e.target.value).getTime() : null,
        },
      })),
    []
  );

  const handleClearWeeklyEnd = useCallback(
    () =>
      setForm((f) => ({
        ...f,
        recurrence: { ...f.recurrence, weeklyEnd: null },
      })),
    []
  );

  const handleSubmit = useCallback(() => {
    if (!form.title.trim()) return;
    onAdd(form);
    onClose();
  }, [form, onAdd, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Memoize the weeklyEnd date string so it's not recomputed each render
  const weeklyEndValue = useMemo(
    () =>
      form.recurrence.weeklyEnd
        ? new Date(form.recurrence.weeklyEnd).toISOString().split("T")[0]
        : "",
    [form.recurrence.weeklyEnd]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4! p-6! flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 px-4 py-2">Nova Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <input
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3! py-2.5! text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            placeholder="Descreva a tarefa..."
            value={form.title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Prioridade</label>
          <div className="flex gap-2">
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <PriorityButton
                key={p}
                priority={p}
                selected={form.priority === p}
                onSelect={handlePriority}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Recorrência</label>

          <button
            type="button"
            onClick={handleToggleRepeat}
            className={`flex items-center gap-2 w-fit px-3! py-2! rounded-lg border text-sm font-medium transition-all ${
              form.recurrence.repeat
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                form.recurrence.repeat ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
              }`}
            >
              {form.recurrence.repeat && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            Repetir semanalmente
          </button>

          {form.recurrence.repeat && (
            <div className="flex flex-col gap-3 pl-3! border-l-2 border-indigo-100">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-500">Dias da semana</span>
                <div className="flex gap-1.5 flex-wrap">
                  {WEEK_DAYS.map((day) => (
                    <WeekDayButton
                      key={day.value}
                      day={day}
                      selected={form.recurrence.weeklyDays.includes(day.value)}
                      weeklyDays={form.recurrence.weeklyDays}
                      setForm={setForm}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">A cada</span>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={form.recurrence.weeklyInterval ?? 1}
                  onChange={handleWeeklyIntervalChange}
                  className="w-16 border border-gray-200 rounded-lg px-2! py-1.5! text-sm text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <span className="text-xs text-gray-500">semana(s)</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-500">Termina em (opcional)</span>
                <input
                  type="date"
                  value={weeklyEndValue}
                  onChange={handleWeeklyEndChange}
                  className="w-full border border-gray-200 rounded-lg px-3! py-2! text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                {form.recurrence.weeklyEnd && (
                  <button
                    type="button"
                    onClick={handleClearWeeklyEnd}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors w-fit cursor-pointer"
                  >
                    Remover data de término
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1!">
          <button
            onClick={onClose}
            className="flex-1 py-2.5! rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="flex-1 py-2.5! rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Extracted sub-components to avoid inline prop recreation ────────────────

const PriorityButton = ({
  priority,
  selected,
  onSelect,
}: {
  priority: Priority;
  selected: boolean;
  onSelect: (p: Priority) => void;
}) => {
  const handleClick = useCallback(() => onSelect(priority), [onSelect, priority]);

  return (
    <button
      onClick={handleClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2! rounded-lg text-sm font-medium border transition-all ${
        selected
          ? "border-transparent shadow-sm scale-105"
          : "border-gray-200 text-gray-500 hover:border-gray-300"
      }`}
      style={selected ? { backgroundColor: priorityColor[priority], color: "#374151" } : {}}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: priorityColor[priority] }}
      />
      {priorityLabel[priority]}
    </button>
  );
};

const WeekDayButton = ({
  day,
  selected,
  weeklyDays,
  setForm,
}: {
  day: (typeof WEEK_DAYS)[number];
  selected: boolean;
  weeklyDays: number[];
  setForm: React.Dispatch<React.SetStateAction<NewTaskForm>>;
}) => {
  const handleClick = useCallback(() => {
    setForm((f) => ({
      ...f,
      recurrence: {
        ...f.recurrence,
        weeklyDays: selected
          ? f.recurrence.weeklyDays.filter((d) => d !== day.value)
          : [...f.recurrence.weeklyDays, day.value],
      },
    }));
  }, [day.value, selected, setForm]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-10 py-1.5! rounded-lg text-xs font-medium border transition-all ${
        selected
          ? "bg-indigo-500 border-indigo-500 text-white shadow-sm"
          : "border-gray-200 text-gray-500 hover:border-indigo-300"
      }`}
    >
      {day.label}
    </button>
  );
};

// ─── TodoItem sub-component to prevent full-list re-renders ──────────────────

const TodoItem = ({
  todo,
  onToggle,
  inactive,
}: {
  todo: Todo;
  onToggle: (id: number, checked: number) => void;
  inactive: boolean;
}) => {
  const handleClick = useCallback(() => {
    console.log(" todo checked " +todo.checked)
    if (!inactive) onToggle(todo.id, todo.checked);
  }, [inactive, onToggle, todo.id, todo.checked]);

  return (
    <div
      className={`todo-item ${todo.checked ? "done" : ""}`}
      onClick={handleClick}
    >
      <div className="todo-checkbox">{todo.checked ? "✓" : ""}</div>
      <span className="todo-text">{todo.title}</span>
      <div
        className="todo-dot"
        style={{ background: priorityColor[todo.priority] }}
      />
    </div>
  );
};

// ─── Main card ────────────────────────────────────────────────────────────────

export default function TodoCard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJewel, setShowJewel] = useState(false);
  const [inactiveTodo, setInactiveTodo] = useState(false);

  // Ref to clear confetti interval on unmount — prevents memory leaks
  const confettiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/todo")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.data)
         setTodos(data.data)
      });

    // Cleanup confetti interval if component unmounts mid-animation
    return () => {
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    };
  }, []);

  const handleFireConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    // Clear any running interval before starting a new one
    if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);

    confettiIntervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiIntervalRef.current!);
        confettiIntervalRef.current = null;
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const jewelHandle = useCallback(() => {
    setShowJewel(true);
    setTimeout(() => setShowJewel(false), 2000);
  }, []);

   const refetch = useCallback(() =>
    fetch("/api/todo")
      .then((res) => res.json())
      .then((data) => setTodos(data.data)),
  []);

  useEffect(() => {
    refetch();
    return () => {
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    };
  }, []);

  const add = useCallback(async (form: NewTaskForm) => {
    const newTask = { id: Date.now(), title: form.title.trim(), checked: false, priority: form.priority };

    const task = {
      repeat: form.recurrence.repeat,
      weeklyInterval: form.recurrence.weeklyInterval,
      weeklyDays: form.recurrence.weeklyDays,
      weeklyEnd: form.recurrence.weeklyEnd,
      ...newTask,
    };

    await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    await refetch();
  }, [refetch]);

  const toggleCheck = useCallback(
    async (id: number, currentStatus: number) => {
      if (inactiveTodo) return;

      console.log("current value "+ currentStatus)

      setInactiveTodo(true);
      const newStatus = (currentStatus === 1? 0 : 1 );

      if (!currentStatus) jewelHandle();

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, checked: newStatus } : t))
      );

      await fetch("/api/todo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, checked: newStatus }),
      }).finally(() => setInactiveTodo(false));
    },
    [inactiveTodo, jewelHandle]
  );

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Memoize derived values so they're not recalculated on every render
  const checked = useMemo(
    () => todos.filter((t) => t.checked).length,
    [todos]
  );

  const progressPercent = useMemo(
    () => Math.round((checked / (todos.length || 1)) * 100),
    [checked, todos.length]
  );

  const progressClass = useMemo(() => {
    const ratio = checked / todos.length;
    if (checked === todos.length)
      return "bg-linear-to-r from-emerald-400 to-cyan-400";
    if (ratio >= 0.66)
      return "bg-linear-to-r from-cyan-500 via-teal-400 to-emerald-400";
    if (ratio >= 0.33)
      return "bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500";
    return "bg-linear-to-r from-slate-700 to-blue-700";
  }, [checked, todos.length]);

  // Fire confetti only when all tasks are newly completed
  const prevCheckedRef = useRef(0);
  useEffect(() => {
    if (
      todos.length >= 1 &&
      checked === todos.length &&
      prevCheckedRef.current !== todos.length
    ) {
      handleFireConfetti();
    }
    prevCheckedRef.current = checked;
  }, [checked, todos.length, handleFireConfetti]);

  return (
    <>
      {modalOpen && <TaskModal onClose={closeModal} onAdd={add} />}

      {showJewel && (
        <div className="fixed left-4 top-4 z-70">
          <Image src="/lets-go.gif" width="300" height="300" alt="jewel" unoptimized />
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-5!">
          <SectionTitle>✅ Tarefas do Dia</SectionTitle>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3! py-1.5! bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nova tarefa
          </button>
        </div>

        <div
          className={`todo-list ${inactiveTodo ? "opacity-50 pointer-events-none select-none" : ""}`}
          aria-disabled={inactiveTodo}
        >
          {inactiveTodo && (
            <div className="relative h-full w-full bg-white z-30">
              <div className="absolute flex items-center justify-center top-20 right-32">
                <div className="w-14 h-14 rounded-full border-4 border-gray-200" />
                <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              </div>
            </div>
          )}

          {todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={toggleCheck}
              inactive={inactiveTodo}
            />
          ))}

          {todos.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma tarefa ainda. Crie a primeira!
            </p>
          )}
        </div>

        <div className="flex justify-between items-center my-2!">
          <div className="w-full mt-4 px-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
              <div
                className={`h-full transition-all duration-700 ease-out ${progressClass}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="todo-summary">
            {checked}/{todos.length} concluídas
          </div>
        </div>
      </Card>
    </>
  );
}