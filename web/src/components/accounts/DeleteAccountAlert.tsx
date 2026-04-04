import type { Account } from "~/lib/schemas";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

type DeleteAccountAlertProps = {
  deleteError: string | null;
  deleteTarget: Account | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountAlert({
  deleteError,
  deleteTarget,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAccountAlertProps) {
  return (
    <Alert open={deleteTarget !== null} onClose={onClose}>
      <AlertTitle>Delete account</AlertTitle>
      <AlertDescription>
        {deleteTarget
          ? `Remove ${deleteTarget.name} from your accounts. This action cannot be undone.`
          : "Remove this account from your accounts."}
      </AlertDescription>
      {deleteError ? (
        <Text className="mt-4 text-red-600 dark:text-red-400">
          {deleteError}
        </Text>
      ) : null}
      <AlertActions>
        <Button plain onClick={onClose} disabled={isDeleting} type="button">
          Cancel
        </Button>
        <Button
          color="red"
          onClick={onConfirm}
          disabled={isDeleting}
          type="button"
        >
          Delete account
        </Button>
      </AlertActions>
    </Alert>
  );
}
