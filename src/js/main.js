// Import fonts from npm packages
import "@fontsource/roboto/400.css";
import "cn-fontsource-fontquan-xin-yi-ji-xiang-song-regular/font.css";

// Import Material Design Web Components
import "@material/web/button/text-button.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/checkbox/checkbox.js";
import "@material/web/textfield/filled-text-field.js";

// Import Typewriter effect and make it globally available
import Typewriter from "typewriter-effect/dist/core";
window.Typewriter = Typewriter;

import { router } from "./router.js";

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
