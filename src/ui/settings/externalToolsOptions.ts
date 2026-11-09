import type { ModernItemRowSpec, ModernSection } from "../modern/settings/modernGeneralPages";
import { check, choice, description, intInput, lineEdit, options, title } from "./generalHelpers";
import type { GeneralItem, SettingsAccess } from "./generalTypes";

const NO_SPAWN = "this runtime cannot start other programs yet.";
const NO_UPLOAD = "the chat input cannot paste images, so there is nothing to upload.";
const NO_SPELLCHECK = "the chat input has no spell checker in this runtime.";
const STREAMLINK_LABEL_WIDTH = 176;
const UPLOADER_LABEL_WIDTH = 108;
const SPELLCHECK_DESCRIPTION =
    "Check the spelling of words in the input box of splits. Chatterino does not include dictionaries - they have to be downloaded or created manually. Chatterino expects Hunspell dictionaries in the Dictionaries folder of its app data directory. Dictionaries are pairs of .aff (affixes) and .dic (dictionary) files.";

function exportUploader(access: SettingsAccess): string {
    const settings = access.settings;
    return JSON.stringify(
        {
            RequestURL: settings.imageUploaderUrl,
            FileFormName: settings.imageUploaderFormField,
            Headers: settings.imageUploaderHeaders,
            URL: settings.imageUploaderLink,
            DeletionURL: settings.imageUploaderDeletionLink,
        },
        null,
        4,
    );
}

export function externalToolsItems(spawnAvailable: boolean): GeneralItem[] {
    const streamlinkNote = spawnAvailable ? undefined : NO_SPAWN;
    const customPath = (access: SettingsAccess) => access.settings.streamlinkUseCustomPath;
    return [
        title("Streamlink"),
        description(
            "streamlink",
            "Streamlink is a command-line utility that pipes video streams from various services into a video player, such as VLC. Make sure to edit the configuration file before you use it!",
        ),
        description("streamlink-links", "Website Download Documentation", [
            { label: "Website", url: "https://streamlink.github.io/" },
            { label: "Download", url: "https://github.com/streamlink/streamlink/releases/latest" },
            { label: "Documentation", url: "https://streamlink.github.io/cli.html#twitch" },
        ]),
        check("streamlinkUseCustomPath", "Use custom path (Enable if using non-standard streamlink installation path)", { unsupported: streamlinkNote }),
        description("streamlink-binary", 'Chatterino expects the executable to be called "streamlink".'),
        lineEdit("streamlinkPath", "Custom streamlink path", {
            placeholder: "Path to folder where Streamlink executable can be found",
            labelWidth: STREAMLINK_LABEL_WIDTH,
            enabled: customPath,
            unsupported: streamlinkNote,
        }),
        choice(
            "streamlinkQuality",
            "Preferred quality",
            options([
                ["choose", "Choose"],
                ["source", "Source"],
                ["high", "High"],
                ["medium", "Medium"],
                ["low", "Low"],
                ["audioOnly", "Audio only"],
            ]),
            { labelWidth: STREAMLINK_LABEL_WIDTH, unsupported: streamlinkNote },
        ),
        lineEdit("streamlinkOptions", "Additional options", { labelWidth: STREAMLINK_LABEL_WIDTH, unsupported: streamlinkNote }),
        title("Custom stream player"),
        description(
            "custom-player",
            'You can open Twitch streams directly in any video player that has built-in Twitch support and has own URI Scheme.\nE.g.: IINA for macOS and Potplayer (with extension) for Windows.\n\nWith this value set, you will get the option to "Open in custom player" when right-clicking a channel header.',
        ),
        lineEdit("customURIScheme", "Custom stream player URI Scheme", {
            placeholder: "custom-player-scheme://",
            unsupported: "the runtime only opens http, https and mailto links, so custom URI schemes cannot be launched.",
        }),
        title("Image Uploader"),
        description("uploader", "You can set custom host for uploading images, like imgur.com or s-ul.eu.\nCheck this guide for help.", [
            { label: "this guide", url: "https://chatterino.com/help/image-uploader" },
        ]),
        check("imageUploaderEnabled", "Enable image uploader", { unsupported: NO_UPLOAD }),
        check("askOnImageUpload", "Ask for confirmation when uploading an image", { unsupported: NO_UPLOAD }),
        lineEdit("imageUploaderUrl", "Request URL", { labelWidth: UPLOADER_LABEL_WIDTH }),
        lineEdit("imageUploaderFormField", "Form field", { labelWidth: UPLOADER_LABEL_WIDTH }),
        lineEdit("imageUploaderHeaders", "Extra Headers", { labelWidth: UPLOADER_LABEL_WIDTH }),
        lineEdit("imageUploaderLink", "Image link", { labelWidth: UPLOADER_LABEL_WIDTH }),
        lineEdit("imageUploaderDeletionLink", "Deletion link", { labelWidth: UPLOADER_LABEL_WIDTH }),
        description(
            "uploader-share",
            "Export your current image uploader settings as JSON to share with others, or import settings from clipboard (compatible with ShareX .sxcu format).",
        ),
        {
            kind: "buttons",
            id: "uploader-buttons",
            buttons: [
                { id: "uploader-import", label: "Import Settings from Clipboard", onPress: (access) => access.importUploader?.() },
                { id: "uploader-export", label: "Export Settings to Clipboard", onPress: (access) => access.copyText?.(exportUploader(access)) },
            ],
        },
        title("Spell checker (experimental)"),
        description("spellcheck", SPELLCHECK_DESCRIPTION),
        check("enableSpellChecking", "Check spelling by default", {
            tooltip: "Check the spelling of words in the input box of all splits by default.",
            unsupported: NO_SPELLCHECK,
        }),
        intInput("nSpellCheckingSuggestions", "Number of suggestions in context menu", -1, 2147483647, 1, {
            tooltip: "When right clicking any word, show this many suggestions. If this is 0, no suggestions will be shown and if it's -1, no limit is set.",
            unsupported: NO_SPELLCHECK,
        }),
    ];
}

export type ModernToolSection = { section: ModernSection; links: Array<{ label: string; url: string }> };

function toolRow(id: string, label: string, extra: Omit<ModernItemRowSpec, "kind" | "id" | "label"> = {}): ModernItemRowSpec {
    return { kind: "item", id, label, ...extra };
}

export const MODERN_EXTERNAL_TOOLS: ModernToolSection[] = [
    {
        section: {
            title: "Streamlink",
            description: "Opens streams in a video player like VLC. Edit its config file before first use.",
            blocks: [
                {
                    kind: "rows",
                    rows: [
                        toolRow("streamlinkUseCustomPath", "Use a custom install path", { hint: "The executable must be called streamlink" }),
                        toolRow("streamlinkPath", "Streamlink folder", { placeholder: "Folder that holds the executable", wide: true }),
                        toolRow("streamlinkQuality", "Preferred quality", { relabel: { choose: "Ask each time" } }),
                        toolRow("streamlinkOptions", "Extra options", { placeholder: "--player-args …", wide: true }),
                    ],
                },
            ],
        },
        links: [
            { label: "Website", url: "https://streamlink.github.io/" },
            { label: "Download", url: "https://github.com/streamlink/streamlink/releases/latest" },
            { label: "Docs", url: "https://streamlink.github.io/cli.html#twitch" },
        ],
    },
    {
        section: {
            title: "Custom stream player",
            description:
                "Any player with Twitch support and its own link scheme, like IINA on macOS or PotPlayer on Windows. Adds Open in custom player to the split header menu.",
            blocks: [{ kind: "rows", rows: [toolRow("customURIScheme", "Player link scheme", { placeholder: "custom-player-scheme://", wide: true })] }],
        },
        links: [],
    },
    {
        section: {
            title: "Image uploader",
            description: "Paste an image into the input to upload it to your own host. ShareX .sxcu settings work too.",
            blocks: [
                {
                    kind: "rows",
                    rows: [
                        toolRow("imageUploaderEnabled", "Upload pasted images"),
                        toolRow("askOnImageUpload", "Ask before each upload"),
                        toolRow("imageUploaderUrl", "Request URL", { placeholder: "https://your-host.example/upload", wide: true }),
                        toolRow("imageUploaderFormField", "Form field", { placeholder: "file" }),
                        toolRow("imageUploaderHeaders", "Extra headers", { placeholder: "Authorization: …", wide: true }),
                        toolRow("imageUploaderLink", "Image link", { hint: "Where to find the link in the response", placeholder: "{link}" }),
                        toolRow("imageUploaderDeletionLink", "Deletion link", { placeholder: "{delete}" }),
                        toolRow("uploader-buttons", "Settings", {
                            buttonLabels: { "uploader-import": "Import from clipboard", "uploader-export": "Export to clipboard" },
                        }),
                    ],
                },
            ],
        },
        links: [{ label: "Setup guide", url: "https://chatterino.com/help/image-uploader" }],
    },
    {
        section: {
            title: "Spell checker",
            description: "Experimental. Uses Hunspell dictionaries, a .aff and .dic pair, that you add to the dictionaries folder.",
            blocks: [
                {
                    kind: "rows",
                    rows: [toolRow("enableSpellChecking", "Check spelling by default"), toolRow("nSpellCheckingSuggestions", "Suggestions in the context menu")],
                },
            ],
        },
        links: [],
    },
];
