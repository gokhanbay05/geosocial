import { useState, useEffect, useRef } from "react";
import { ListFilter, Check, ChevronDown } from "lucide-react";
import "../../css/core/SortSelect.css";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostLiked", label: "Most Liked" },
];

export default function SortSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLabel = OPTIONS.find((opt) => opt.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="sort-select-container" ref={containerRef}>
      <button
        className={`sort-trigger-btn ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ListFilter size={16} />
        <span className="sort-trigger-text">{selectedLabel}</span>
        <ChevronDown size={14} style={{ opacity: 0.5 }} />
      </button>

      {isOpen && (
        <div className="sort-dropdown-menu">
          {OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`sort-dropdown-item ${value === option.value ? "is-selected" : ""
                }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {value === option.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
