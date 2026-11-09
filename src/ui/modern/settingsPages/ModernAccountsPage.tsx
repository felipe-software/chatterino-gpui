import { useApp } from "../../state/AppContext";
import { useStore } from "../../state/useStore";
import { Button } from "../controls/Button";
import { Note } from "../controls/Note";
import { Tag } from "../controls/Tag";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { SettingsCard } from "../settings/SettingsCard";
import { AccountRow } from "./AccountRow";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";

const ANONYMOUS_DESCRIPTION = "Read chat without logging in. You can't send messages";
const STORAGE_NOTE = "Login tokens are saved only on this computer, with the rest of the app's data.";

export function ModernAccountsPage() {
    const { core, openOverlay } = useApp();
    const tokens = useModernTokens();
    const state = useStore(core.accounts);
    const anonymous = !state.current;
    return (
        <SettingsPageFrame testID="settings-accounts" gap={28}>
            <PageHeader
                title="Accounts"
                description="Switch between Twitch accounts, or read chat without logging in."
                actions={
                    <Button
                        testID="accounts-add"
                        label="Add account"
                        variant="primary"
                        icon={MODERN_ICONS.plus}
                        onPress={() => openOverlay({ kind: "addAccount" })}
                    />
                }
            />
            <SettingsCard tokens={tokens}>
                {state.accounts.map((account, index) => (
                    <AccountRow
                        key={account.login}
                        testID={`account-${account.login}`}
                        name={account.login}
                        avatarName={account.login}
                        avatarColor={tokens.text2}
                        description="Twitch account"
                        current={state.current === account.login}
                        tag={state.current === account.login ? <Tag label="Current" /> : undefined}
                        first={index === 0}
                        onSwitch={() => core.selectAccount(account.login)}
                        onRemove={() => core.removeAccount(account.login)}
                    />
                ))}
                <AccountRow
                    testID="account-anonymous"
                    name="Anonymous"
                    avatarName="?"
                    avatarColor={tokens.text3}
                    description={ANONYMOUS_DESCRIPTION}
                    current={anonymous}
                    tag={anonymous ? <Tag label="Current" /> : undefined}
                    first={state.accounts.length === 0}
                    onSwitch={() => core.selectAccount(undefined)}
                />
            </SettingsCard>
            <Note icon={PAGE_ICONS.lock} text={STORAGE_NOTE} />
        </SettingsPageFrame>
    );
}
