import {
  DialogBody,
  DialogButton,
  DialogHeader,
  Field,
  Focusable,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "@decky/ui";
import { useCallback, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { ConfigField, ConfigFieldValues } from "../plugin-types";
import { SelectField } from "./SelectField";

interface ConfigPanelModalProps {
  title: string;
  fields: ConfigField[];
  values: ConfigFieldValues;
  onSave: (values: ConfigFieldValues) => void;
  closeModal?: () => void;
}

export function ConfigPanelModal({
  title,
  fields,
  values: initialValues,
  onSave,
  ...props
}: ConfigPanelModalProps) {
  const { closeModal } = props;
  const [values, setValues] = useState<ConfigFieldValues>(initialValues);

  const handleChange = useCallback(
    (envVar: string, value: string | number | boolean) => {
      setValues((prev) => ({ ...prev, [envVar]: value }));
    },
    [],
  );

  const handleDone = useCallback(() => {
    onSave(values);
    closeModal?.();
  }, [values, onSave, closeModal]);

  return (
    <ModalRoot {...props}>
      <DialogHeader>{title} - Input</DialogHeader>
      <DialogBody>
        <Focusable>
          <PanelSection>
            {fields.map((field, index) => {
              const key = `config-field-${index}`;

              switch (field.type) {
                case "divider":
                  return (
                    <PanelSectionRow key={key}>
                      <Field
                        label={field.title}
                        description={field.description}
                        bottomSeparator="none"
                        childrenLayout="below"
                      />
                    </PanelSectionRow>
                  );

                case "boolean":
                  return (
                    <PanelSectionRow key={key}>
                      <ToggleField
                        label={field.title}
                        description={field.description}
                        checked={
                          (values[field.envVar] as boolean) ??
                          field.initialValue
                        }
                        onChange={(checked) =>
                          handleChange(field.envVar, checked)
                        }
                      />
                    </PanelSectionRow>
                  );

                case "number":
                  return (
                    <PanelSectionRow key={key}>
                      <SliderField
                        label={field.title}
                        description={field.description}
                        value={
                          (values[field.envVar] as number) ?? field.initialValue
                        }
                        min={field.min}
                        max={field.max}
                        step={field.step ?? 1}
                        onChange={(value) => handleChange(field.envVar, value)}
                        showValue
                      />
                    </PanelSectionRow>
                  );

                case "select":
                  return (
                    <PanelSectionRow key={key}>
                      <SelectField
                        field={field}
                        value={
                          (values[field.envVar] as string) ?? field.initialValue
                        }
                        onChange={(value) => handleChange(field.envVar, value)}
                      />
                    </PanelSectionRow>
                  );

                default:
                  return null;
              }
            })}
          </PanelSection>

          <PanelSection>
            <PanelSectionRow>
              <DialogButton onClick={handleDone}>
                <FaCheck style={{ marginRight: "8px" }} />
                Done
              </DialogButton>
            </PanelSectionRow>
          </PanelSection>
        </Focusable>
      </DialogBody>
    </ModalRoot>
  );
}
