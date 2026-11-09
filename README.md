# chatterino-gpui

A Twitch chat client that looks and behaves like [Chatterino 2](https://chatterino.com), written in
React with [react-native-gpui](https://github.com/felipe-software/react-native-gpui). No browser or
Electron: the UI is drawn natively on the GPU (Vulkan on Linux, Metal on macOS).

Not an official Chatterino project.

![chatterino-gpui on Linux](docs/screenshots/main-tab.png)

## Requirements

- [Bun](https://bun.sh) 1.4+ and Node.js 18+
- Linux x64/arm64 with Vulkan and `libjavascriptcoregtk-4.1-0`, or macOS on Apple Silicon

## Run

```sh
git clone https://github.com/felipe-software/chatterino-gpui.git
cd chatterino-gpui
bun install
bun run start
```

## Test

```sh
bun test
bun run typecheck
```

Development notes, feature list and known differences: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## License

MIT, see [LICENSE](LICENSE). Icons, sounds and avatars in `assets/` and `src/ui/assets/` come from
Chatterino 2.5.5 under its [MIT license](assets/CHATTERINO-LICENSE.txt).
