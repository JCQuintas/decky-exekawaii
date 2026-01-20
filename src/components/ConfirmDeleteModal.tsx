import {
  DialogBody,
  DialogButton,
  DialogHeader,
  Focusable,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
} from "@decky/ui";
import { FaCheck, FaTimes } from "react-icons/fa";

interface ConfirmDeleteModalProps {
  title: string;
  onConfirm: () => void;
  closeModal?: () => void;
}

export function ConfirmDeleteModal({
  title,
  onConfirm,
  ...props
}: ConfirmDeleteModalProps) {
  const { closeModal } = props;
  const handleConfirm = () => {
    onConfirm();
    closeModal?.();
  };

  return (
    <ModalRoot {...props}>
      <DialogHeader>Delete Command</DialogHeader>
      <DialogBody>
        <Focusable>
          <PanelSection>
            <PanelSectionRow>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                Are you sure you want to delete "{title}"?
              </div>
            </PanelSectionRow>
          </PanelSection>

          <PanelSection>
            <Focusable flow-children="horizontal" style={{ display: "flex", gap: "8px" }}>
              <div style={{ flexGrow: 1 }}>
                <DialogButton onClick={handleConfirm}>
                  <FaCheck style={{ marginRight: "8px" }} />
                  Delete
                </DialogButton>
              </div>
              <DialogButton
                aria-label="Cancel"
                style={{ minWidth: 0, width: "30%", paddingLeft: 0, paddingRight: 0 }}
                onClick={closeModal}
              >
                <FaTimes />
              </DialogButton>
            </Focusable>
          </PanelSection>
        </Focusable>
      </DialogBody>
    </ModalRoot>
  );
}
