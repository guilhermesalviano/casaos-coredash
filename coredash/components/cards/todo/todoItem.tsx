import { priorityColor, TodoState } from "@/types/task";

export default function TodoItem({
  todo,
  onToggle,
}: {
  todo: TodoState;
  onToggle: (id: number, current: number) => void;
}) {
  const isDone = todo.checked === 1;
  return (
    <div
      className={`todo-item${isDone ? " done" : ""}`}
      onClick={() => onToggle(todo.id, todo.checked)}
    >
      <div
        className="rotate-90 tracking-widest text-gray-500 select-none"
        style={{ cursor: "grab" }}
      >
        ...
      </div>
      <div className="todo-checkbox">{isDone ? "✓" : ""}</div>
      <span className="todo-text">{todo.title}</span>
      <div
        className="todo-dot"
        style={{ background: priorityColor[todo.priority] }}
      />
    </div>
  );
}
