import { DialogButton, Focusable } from '@decky/ui';
import { useRef, useState } from 'react';
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { ConfigField } from '../plugin-types';

interface SelectFieldProps {
  field: Extract<ConfigField, { type: "select"; }>;
  value: string;
  onChange: (value: string) => void;
  addBottomSeparator?: boolean;
}
export function SelectField({ field, value, onChange, addBottomSeparator }: SelectFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedOption = field.options.find((opt) => opt.value === value);
  const mainInputRef = useRef<HTMLDivElement>(null);
  const [hasFocusInside, setHasFocusInside] = useState(false);

  return (
    <Focusable onFocus={() => setHasFocusInside(true)} onBlur={() => setHasFocusInside(false)} style={{ display: 'flex', flexDirection: 'column', padding: 0, margin: "0px -16px", background: hasFocusInside ? "rgba(255, 255, 255, 0.2)" : "transparent", borderBottom: addBottomSeparator ? "1px solid #333" : "none" }}>
      <div style={{ display: "flex", flexDirection: "column", paddingBottom: "8px", margin: "0px 16px" }}>
        <div style={{ marginBottom: "8px", fontWeight: "500" }}>{field.title}</div>
        <DialogButton ref={mainInputRef} onClick={() => setExpanded(!expanded)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{selectedOption?.label || value || "Select..."}</span>
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </DialogButton>
        {expanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
            {field.options.map((opt) => (
              <DialogButton
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setExpanded(false);
                  mainInputRef.current?.focus();
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{opt.label}</span>
                  {opt.value === value && <FaCheck />}
                </div>
              </DialogButton>
            ))}
          </div>
        )}
        {field.description && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#8b929a" }}>
            {field.description}
          </div>
        )}
      </div>
    </Focusable >
  );
}
