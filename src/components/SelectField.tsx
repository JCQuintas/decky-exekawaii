import { DialogButton, Field } from '@decky/ui';
import { useRef, useState } from 'react';
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { ConfigField } from '../plugin-types';

interface SelectFieldProps {
  field: Extract<ConfigField, { type: "select"; }>;
  value: string;
  onChange: (value: string) => void;
}
export function SelectField({ field, value, onChange, }: SelectFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedOption = field.options.find((opt) => opt.value === value);
  const mainInputRef = useRef<HTMLDivElement>(null);

  return (
    <Field label={field.title} description={field.description} childrenLayout='below' >
      <div style={{ display: 'flex', flexDirection: 'column', padding: 0, margin: "0px -16px", }}>
        <div style={{ display: "flex", flexDirection: "column", margin: "0px 16px" }}>
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
        </div>
      </div>
    </Field>
  );
}
