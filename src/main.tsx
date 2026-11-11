import { render } from "@felipe-software/react-native-gpui";
import { App } from "./ui/App";
import { savedWindowGeometry } from "./ui/state/windowGeometry";

render(<App />, savedWindowGeometry());
