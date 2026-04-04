import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";

import {
  accountTypeBadgeColors,
  accountTypeLabels,
  accountTypes,
  onboardingAccountStarters,
  type OnboardingAccountDraft,
} from "~/lib/onboarding";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

type AccountSetupStepProps = {
  accounts: OnboardingAccountDraft[];
  error: string | null;
  onAddStarter: (starterId: string) => void;
  onAddBlankAccount: () => void;
  onUpdateAccount: (
    accountId: string,
    field: "name" | "type" | "balance",
    value: string,
  ) => void;
  onRemoveAccount: (accountId: string) => void;
};

export function AccountSetupStep({
  accounts,
  error,
  onAddStarter,
  onAddBlankAccount,
  onUpdateAccount,
  onRemoveAccount,
}: AccountSetupStepProps) {
  return (
    <div className="space-y-10">
      <section className="space-y-5 border-b border-zinc-950/8 pb-8 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Subheading>Quick starters</Subheading>
            <Text>
              Add the usual account shapes first, then tailor the names and
              opening balances.
            </Text>
          </div>
          <Button plain onClick={onAddBlankAccount}>
            <PlusIcon data-slot="icon" />
            Blank account
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {onboardingAccountStarters.map((starter) => (
            <button
              key={starter.id}
              type="button"
              onClick={() => onAddStarter(starter.id)}
              className="inline-flex items-center gap-3 rounded-full border border-zinc-950/10 bg-white/80 px-4 py-2 text-left text-zinc-950 transition hover:border-zinc-950/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20"
            >
              <span className="text-sm font-semibold">{starter.name}</span>
              <Badge color={accountTypeBadgeColors[starter.type]}>
                {accountTypeLabels[starter.type]}
              </Badge>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <Subheading>Account list</Subheading>
          <Text>
            Keep at least one account here so transaction entry has somewhere to
            land on day one.
          </Text>
        </div>

        {error ? (
          <Text className="text-rose-600 dark:text-rose-400">{error}</Text>
        ) : null}

        <div className="overflow-hidden rounded-[1.75rem] border border-zinc-950/8 bg-white/75 dark:border-white/10 dark:bg-white/4">
          <div className="hidden grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_9rem_5rem] gap-4 border-b border-zinc-950/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:grid dark:border-white/10 dark:text-zinc-400">
            <div>Name</div>
            <div>Type</div>
            <div>Balance</div>
            <div />
          </div>

          <div>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="grid gap-4 border-b border-zinc-950/8 px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_9rem_5rem] dark:border-white/10"
              >
                <div className="space-y-2">
                  <Input
                    value={account.name}
                    onChange={(event) =>
                      onUpdateAccount(account.id, "name", event.target.value)
                    }
                    placeholder="Account name"
                    aria-label="Account name"
                  />
                  <Text>This is the label shown across the workspace.</Text>
                </div>

                <div className="space-y-2">
                  <Select
                    value={account.type}
                    onChange={(event) =>
                      onUpdateAccount(account.id, "type", event.target.value)
                    }
                    aria-label="Account type"
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {accountTypeLabels[type]}
                      </option>
                    ))}
                  </Select>
                  <Text>Choose the closest balance behavior.</Text>
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={account.balance}
                    onChange={(event) =>
                      onUpdateAccount(account.id, "balance", event.target.value)
                    }
                    placeholder="0.00"
                    aria-label="Opening balance"
                  />
                  <Text>Negative balances work for debt.</Text>
                </div>

                <div className="flex items-start justify-end pt-1">
                  <Button
                    plain
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                    onClick={() => onRemoveAccount(account.id)}
                  >
                    <TrashIcon data-slot="icon" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
