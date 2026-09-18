# Overview viewport height

User requested panels expand to the bottom of the viewport and adapt to smaller/larger screens. Shared desktop-density CSS now makes the Overview a flex column with minimum height derived from 100dvh minus topbar and content padding. Header, metrics and footer stay intrinsic; operational panels take remaining space. Right summary cards distribute spare height. Lists retain internal scrolling with a viewport-relative maximum. Existing tablet/mobile stacking remains unchanged below 1280px; short windows can scroll naturally instead of clipping content.

Applied to both demo and live Overview. No colors, typography, data or actions changed. Server backup /tmp/newneo-before-viewport-fill.css.

Published and checked in GAW: at 1920×1080 footer ends at1060px (20px bottom margin), panels at1027.5px; at1366×768 footer ends748px, panels715.5px. At390×844 cards stack into one main column, no horizontal overflow. Viewport override reset. Build passed.
