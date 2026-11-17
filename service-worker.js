/* ==========================================
   COMPENDIO DI PREGHIERE
   SERVICE WORKER
========================================== */

const CACHE_NAME = "compendio-v9.0.37";
const UPDATE_CACHE_NAME = CACHE_NAME + "-update";
const STAGING_CACHE_NAME = CACHE_NAME + "-staging";
const BACKUP_CACHE_NAME = CACHE_NAME + "-backup";

/* ==========================================
   FILES TO CACHE (Relative paths)
========================================== */

const APP_FILES = [
    "about.html",
    "adoration.html",
    "angelus.html",
    "app-config.json",
    "assets/icon.png",
    "basic-prayers.html",
    "cache-manager.html",
    "COLAB GOOGLE 2026.txt",
    "costituzioni.html",
    "css/cache-manager.css",
    "css/draggable-tuner.css",
    "css/guitar-tuner.css",
    "css/overlay.css",
    "css/religiosi.css",
    "css/songbook.css",
    "css/songbook-viewer.css",
    "css/style.css",
    "css/subcss.css",
    "dat/about.htm",
    "dat/about_files/colorschememapping.xml",
    "dat/about_files/filelist.xml",
    "dat/about_files/image003.png",
    "dat/about_files/image004.png",
    "dat/about_files/themedata.thmx",
    "dat/costituzioni.xlsx",
    "dat/dat-rel.xlsx",
    "dat/dat-rel-web.xlsx",
    "dat/direttorio.xlsx",
    "devotions.html",
    "direttorio.html",
    "evening-prayer.html",
    "favicon.ico",
    "guitar-tuner.html",
    "icons/app-icon.png",
    "icons/app-icon-192.png",
    "icons/app-icon-512.png",
    "icons/app-icon-org.png",
    "icons/logo.png",
    "icons/splash.png",
    "images/logo.png",
    "index.html",
    "js/aggiornamenti.js",
    "js/app.js",
    "js/cache-manager.js",
    "js/constitution.js",
    "js/draggable-tuner.js",
    "js/guitar-tuner working detection.js",
    "js/guitar-tuner.js",
    "js/mass-songbook.js",
    "js/overlay.js",
    "js/pdf-songbook-viewer.js",
    "js/religiosi.js",
    "js/songbook.js",
    "js/songbook-viewer.js",
    "js/songs-generated.js",
    "js/xlsx.full.min.js",
    "manifest.webmanifest",
    "mass-guide.html",
    "morning-prayer.html",
    "night-prayer.html",
    "pdfjs/build/pdf.js",
    "pdfjs/build/pdf.js.map",
    "pdfjs/build/pdf.sandbox.js",
    "pdfjs/build/pdf.sandbox.js.map",
    "pdfjs/build/pdf.worker.js",
    "pdfjs/build/pdf.worker.js.map",
    "pdfjs/LICENSE",
    "pdfjs/web/cmaps/78-EUC-H.bcmap",
    "pdfjs/web/cmaps/78-EUC-V.bcmap",
    "pdfjs/web/cmaps/78-H.bcmap",
    "pdfjs/web/cmaps/78ms-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/78ms-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/78-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/78-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/78-V.bcmap",
    "pdfjs/web/cmaps/83pv-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90msp-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90msp-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/90ms-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90ms-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/90pv-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/90pv-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Add-H.bcmap",
    "pdfjs/web/cmaps/Add-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/Add-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Add-V.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-6.bcmap",
    "pdfjs/web/cmaps/Adobe-CNS1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-GB1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-3.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-4.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-5.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-6.bcmap",
    "pdfjs/web/cmaps/Adobe-Japan1-UCS2.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-0.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-1.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-2.bcmap",
    "pdfjs/web/cmaps/Adobe-Korea1-UCS2.bcmap",
    "pdfjs/web/cmaps/B5-H.bcmap",
    "pdfjs/web/cmaps/B5pc-H.bcmap",
    "pdfjs/web/cmaps/B5pc-V.bcmap",
    "pdfjs/web/cmaps/B5-V.bcmap",
    "pdfjs/web/cmaps/CNS1-H.bcmap",
    "pdfjs/web/cmaps/CNS1-V.bcmap",
    "pdfjs/web/cmaps/CNS2-H.bcmap",
    "pdfjs/web/cmaps/CNS2-V.bcmap",
    "pdfjs/web/cmaps/CNS-EUC-H.bcmap",
    "pdfjs/web/cmaps/CNS-EUC-V.bcmap",
    "pdfjs/web/cmaps/ETen-B5-H.bcmap",
    "pdfjs/web/cmaps/ETen-B5-V.bcmap",
    "pdfjs/web/cmaps/ETenms-B5-H.bcmap",
    "pdfjs/web/cmaps/ETenms-B5-V.bcmap",
    "pdfjs/web/cmaps/ETHK-B5-H.bcmap",
    "pdfjs/web/cmaps/ETHK-B5-V.bcmap",
    "pdfjs/web/cmaps/EUC-H.bcmap",
    "pdfjs/web/cmaps/EUC-V.bcmap",
    "pdfjs/web/cmaps/Ext-H.bcmap",
    "pdfjs/web/cmaps/Ext-RKSJ-H.bcmap",
    "pdfjs/web/cmaps/Ext-RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Ext-V.bcmap",
    "pdfjs/web/cmaps/GB-EUC-H.bcmap",
    "pdfjs/web/cmaps/GB-EUC-V.bcmap",
    "pdfjs/web/cmaps/GB-H.bcmap",
    "pdfjs/web/cmaps/GBK2K-H.bcmap",
    "pdfjs/web/cmaps/GBK2K-V.bcmap",
    "pdfjs/web/cmaps/GBK-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBK-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBKp-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBKp-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBT-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-H.bcmap",
    "pdfjs/web/cmaps/GBTpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/GBTpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/GBT-V.bcmap",
    "pdfjs/web/cmaps/GB-V.bcmap",
    "pdfjs/web/cmaps/H.bcmap",
    "pdfjs/web/cmaps/Hankaku.bcmap",
    "pdfjs/web/cmaps/Hiragana.bcmap",
    "pdfjs/web/cmaps/HKdla-B5-H.bcmap",
    "pdfjs/web/cmaps/HKdla-B5-V.bcmap",
    "pdfjs/web/cmaps/HKdlb-B5-H.bcmap",
    "pdfjs/web/cmaps/HKdlb-B5-V.bcmap",
    "pdfjs/web/cmaps/HKgccs-B5-H.bcmap",
    "pdfjs/web/cmaps/HKgccs-B5-V.bcmap",
    "pdfjs/web/cmaps/HKm314-B5-H.bcmap",
    "pdfjs/web/cmaps/HKm314-B5-V.bcmap",
    "pdfjs/web/cmaps/HKm471-B5-H.bcmap",
    "pdfjs/web/cmaps/HKm471-B5-V.bcmap",
    "pdfjs/web/cmaps/HKscs-B5-H.bcmap",
    "pdfjs/web/cmaps/HKscs-B5-V.bcmap",
    "pdfjs/web/cmaps/Katakana.bcmap",
    "pdfjs/web/cmaps/KSC-EUC-H.bcmap",
    "pdfjs/web/cmaps/KSC-EUC-V.bcmap",
    "pdfjs/web/cmaps/KSC-H.bcmap",
    "pdfjs/web/cmaps/KSC-Johab-H.bcmap",
    "pdfjs/web/cmaps/KSC-Johab-V.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-H.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-HW-H.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-HW-V.bcmap",
    "pdfjs/web/cmaps/KSCms-UHC-V.bcmap",
    "pdfjs/web/cmaps/KSCpc-EUC-H.bcmap",
    "pdfjs/web/cmaps/KSCpc-EUC-V.bcmap",
    "pdfjs/web/cmaps/KSC-V.bcmap",
    "pdfjs/web/cmaps/LICENSE",
    "pdfjs/web/cmaps/NWP-H.bcmap",
    "pdfjs/web/cmaps/NWP-V.bcmap",
    "pdfjs/web/cmaps/RKSJ-H.bcmap",
    "pdfjs/web/cmaps/RKSJ-V.bcmap",
    "pdfjs/web/cmaps/Roman.bcmap",
    "pdfjs/web/cmaps/UniCNS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniCNS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniGB-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniJIS2004-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UCS2-HW-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniJISPro-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-HW-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-HW-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniJIS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/UniJISX02132004-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJISX02132004-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniJISX0213-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniJISX0213-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UCS2-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UCS2-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF16-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF16-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF32-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF32-V.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF8-H.bcmap",
    "pdfjs/web/cmaps/UniKS-UTF8-V.bcmap",
    "pdfjs/web/cmaps/V.bcmap",
    "pdfjs/web/cmaps/WP-Symbol.bcmap",
    "pdfjs/web/compressed.tracemonkey-pldi-09.pdf",
    "pdfjs/web/debugger.css",
    "pdfjs/web/debugger.js",
    "pdfjs/web/images/altText_add.svg",
    "pdfjs/web/images/altText_done.svg",
    "pdfjs/web/images/annotation-check.svg",
    "pdfjs/web/images/annotation-comment.svg",
    "pdfjs/web/images/annotation-help.svg",
    "pdfjs/web/images/annotation-insert.svg",
    "pdfjs/web/images/annotation-key.svg",
    "pdfjs/web/images/annotation-newparagraph.svg",
    "pdfjs/web/images/annotation-noicon.svg",
    "pdfjs/web/images/annotation-note.svg",
    "pdfjs/web/images/annotation-paperclip.svg",
    "pdfjs/web/images/annotation-paragraph.svg",
    "pdfjs/web/images/annotation-pushpin.svg",
    "pdfjs/web/images/cursor-editorFreeText.svg",
    "pdfjs/web/images/cursor-editorInk.svg",
    "pdfjs/web/images/findbarButton-next.svg",
    "pdfjs/web/images/findbarButton-previous.svg",
    "pdfjs/web/images/gv-toolbarButton-download.svg",
    "pdfjs/web/images/gv-toolbarButton-openinapp.svg",
    "pdfjs/web/images/loading.svg",
    "pdfjs/web/images/loading-dark.svg",
    "pdfjs/web/images/loading-icon.gif",
    "pdfjs/web/images/secondaryToolbarButton-documentProperties.svg",
    "pdfjs/web/images/secondaryToolbarButton-firstPage.svg",
    "pdfjs/web/images/secondaryToolbarButton-handTool.svg",
    "pdfjs/web/images/secondaryToolbarButton-lastPage.svg",
    "pdfjs/web/images/secondaryToolbarButton-rotateCcw.svg",
    "pdfjs/web/images/secondaryToolbarButton-rotateCw.svg",
    "pdfjs/web/images/secondaryToolbarButton-scrollHorizontal.svg",
    "pdfjs/web/images/secondaryToolbarButton-scrollPage.svg",
    "pdfjs/web/images/secondaryToolbarButton-scrollVertical.svg",
    "pdfjs/web/images/secondaryToolbarButton-scrollWrapped.svg",
    "pdfjs/web/images/secondaryToolbarButton-selectTool.svg",
    "pdfjs/web/images/secondaryToolbarButton-spreadEven.svg",
    "pdfjs/web/images/secondaryToolbarButton-spreadNone.svg",
    "pdfjs/web/images/secondaryToolbarButton-spreadOdd.svg",
    "pdfjs/web/images/toolbarButton-bookmark.svg",
    "pdfjs/web/images/toolbarButton-currentOutlineItem.svg",
    "pdfjs/web/images/toolbarButton-download.svg",
    "pdfjs/web/images/toolbarButton-editorFreeText.svg",
    "pdfjs/web/images/toolbarButton-editorInk.svg",
    "pdfjs/web/images/toolbarButton-editorStamp.svg",
    "pdfjs/web/images/toolbarButton-menuArrow.svg",
    "pdfjs/web/images/toolbarButton-openFile.svg",
    "pdfjs/web/images/toolbarButton-pageDown.svg",
    "pdfjs/web/images/toolbarButton-pageUp.svg",
    "pdfjs/web/images/toolbarButton-presentationMode.svg",
    "pdfjs/web/images/toolbarButton-print.svg",
    "pdfjs/web/images/toolbarButton-search.svg",
    "pdfjs/web/images/toolbarButton-secondaryToolbarToggle.svg",
    "pdfjs/web/images/toolbarButton-sidebarToggle.svg",
    "pdfjs/web/images/toolbarButton-viewAttachments.svg",
    "pdfjs/web/images/toolbarButton-viewLayers.svg",
    "pdfjs/web/images/toolbarButton-viewOutline.svg",
    "pdfjs/web/images/toolbarButton-viewThumbnail.svg",
    "pdfjs/web/images/toolbarButton-zoomIn.svg",
    "pdfjs/web/images/toolbarButton-zoomOut.svg",
    "pdfjs/web/images/treeitem-collapsed.svg",
    "pdfjs/web/images/treeitem-expanded.svg",
    "pdfjs/web/locale/ach/viewer.properties",
    "pdfjs/web/locale/af/viewer.properties",
    "pdfjs/web/locale/an/viewer.properties",
    "pdfjs/web/locale/ar/viewer.properties",
    "pdfjs/web/locale/ast/viewer.properties",
    "pdfjs/web/locale/az/viewer.properties",
    "pdfjs/web/locale/be/viewer.properties",
    "pdfjs/web/locale/bg/viewer.properties",
    "pdfjs/web/locale/bn/viewer.properties",
    "pdfjs/web/locale/bo/viewer.properties",
    "pdfjs/web/locale/br/viewer.properties",
    "pdfjs/web/locale/brx/viewer.properties",
    "pdfjs/web/locale/bs/viewer.properties",
    "pdfjs/web/locale/ca/viewer.properties",
    "pdfjs/web/locale/cak/viewer.properties",
    "pdfjs/web/locale/ckb/viewer.properties",
    "pdfjs/web/locale/cs/viewer.properties",
    "pdfjs/web/locale/cy/viewer.properties",
    "pdfjs/web/locale/da/viewer.properties",
    "pdfjs/web/locale/de/viewer.properties",
    "pdfjs/web/locale/dsb/viewer.properties",
    "pdfjs/web/locale/el/viewer.properties",
    "pdfjs/web/locale/en-CA/viewer.properties",
    "pdfjs/web/locale/en-GB/viewer.properties",
    "pdfjs/web/locale/en-US/viewer.properties",
    "pdfjs/web/locale/eo/viewer.properties",
    "pdfjs/web/locale/es-AR/viewer.properties",
    "pdfjs/web/locale/es-CL/viewer.properties",
    "pdfjs/web/locale/es-ES/viewer.properties",
    "pdfjs/web/locale/es-MX/viewer.properties",
    "pdfjs/web/locale/et/viewer.properties",
    "pdfjs/web/locale/eu/viewer.properties",
    "pdfjs/web/locale/fa/viewer.properties",
    "pdfjs/web/locale/ff/viewer.properties",
    "pdfjs/web/locale/fi/viewer.properties",
    "pdfjs/web/locale/fr/viewer.properties",
    "pdfjs/web/locale/fur/viewer.properties",
    "pdfjs/web/locale/fy-NL/viewer.properties",
    "pdfjs/web/locale/ga-IE/viewer.properties",
    "pdfjs/web/locale/gd/viewer.properties",
    "pdfjs/web/locale/gl/viewer.properties",
    "pdfjs/web/locale/gn/viewer.properties",
    "pdfjs/web/locale/gu-IN/viewer.properties",
    "pdfjs/web/locale/he/viewer.properties",
    "pdfjs/web/locale/hi-IN/viewer.properties",
    "pdfjs/web/locale/hr/viewer.properties",
    "pdfjs/web/locale/hsb/viewer.properties",
    "pdfjs/web/locale/hu/viewer.properties",
    "pdfjs/web/locale/hy-AM/viewer.properties",
    "pdfjs/web/locale/hye/viewer.properties",
    "pdfjs/web/locale/ia/viewer.properties",
    "pdfjs/web/locale/id/viewer.properties",
    "pdfjs/web/locale/is/viewer.properties",
    "pdfjs/web/locale/it/viewer.properties",
    "pdfjs/web/locale/ja/viewer.properties",
    "pdfjs/web/locale/ka/viewer.properties",
    "pdfjs/web/locale/kab/viewer.properties",
    "pdfjs/web/locale/kk/viewer.properties",
    "pdfjs/web/locale/km/viewer.properties",
    "pdfjs/web/locale/kn/viewer.properties",
    "pdfjs/web/locale/ko/viewer.properties",
    "pdfjs/web/locale/lij/viewer.properties",
    "pdfjs/web/locale/lo/viewer.properties",
    "pdfjs/web/locale/locale.properties",
    "pdfjs/web/locale/lt/viewer.properties",
    "pdfjs/web/locale/ltg/viewer.properties",
    "pdfjs/web/locale/lv/viewer.properties",
    "pdfjs/web/locale/meh/viewer.properties",
    "pdfjs/web/locale/mk/viewer.properties",
    "pdfjs/web/locale/mr/viewer.properties",
    "pdfjs/web/locale/ms/viewer.properties",
    "pdfjs/web/locale/my/viewer.properties",
    "pdfjs/web/locale/nb-NO/viewer.properties",
    "pdfjs/web/locale/ne-NP/viewer.properties",
    "pdfjs/web/locale/nl/viewer.properties",
    "pdfjs/web/locale/nn-NO/viewer.properties",
    "pdfjs/web/locale/oc/viewer.properties",
    "pdfjs/web/locale/pa-IN/viewer.properties",
    "pdfjs/web/locale/pl/viewer.properties",
    "pdfjs/web/locale/pt-BR/viewer.properties",
    "pdfjs/web/locale/pt-PT/viewer.properties",
    "pdfjs/web/locale/rm/viewer.properties",
    "pdfjs/web/locale/ro/viewer.properties",
    "pdfjs/web/locale/ru/viewer.properties",
    "pdfjs/web/locale/sat/viewer.properties",
    "pdfjs/web/locale/sc/viewer.properties",
    "pdfjs/web/locale/scn/viewer.properties",
    "pdfjs/web/locale/sco/viewer.properties",
    "pdfjs/web/locale/si/viewer.properties",
    "pdfjs/web/locale/sk/viewer.properties",
    "pdfjs/web/locale/skr/viewer.properties",
    "pdfjs/web/locale/sl/viewer.properties",
    "pdfjs/web/locale/son/viewer.properties",
    "pdfjs/web/locale/sq/viewer.properties",
    "pdfjs/web/locale/sr/viewer.properties",
    "pdfjs/web/locale/sv-SE/viewer.properties",
    "pdfjs/web/locale/szl/viewer.properties",
    "pdfjs/web/locale/ta/viewer.properties",
    "pdfjs/web/locale/te/viewer.properties",
    "pdfjs/web/locale/tg/viewer.properties",
    "pdfjs/web/locale/th/viewer.properties",
    "pdfjs/web/locale/tl/viewer.properties",
    "pdfjs/web/locale/tr/viewer.properties",
    "pdfjs/web/locale/trs/viewer.properties",
    "pdfjs/web/locale/uk/viewer.properties",
    "pdfjs/web/locale/ur/viewer.properties",
    "pdfjs/web/locale/uz/viewer.properties",
    "pdfjs/web/locale/vi/viewer.properties",
    "pdfjs/web/locale/wo/viewer.properties",
    "pdfjs/web/locale/xh/viewer.properties",
    "pdfjs/web/locale/zh-CN/viewer.properties",
    "pdfjs/web/locale/zh-TW/viewer.properties",
    "pdfjs/web/standard_fonts/FoxitDingbats.pfb",
    "pdfjs/web/standard_fonts/FoxitFixed.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedBold.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedBoldItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitFixedItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSerif.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifBold.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifBoldItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSerifItalic.pfb",
    "pdfjs/web/standard_fonts/FoxitSymbol.pfb",
    "pdfjs/web/standard_fonts/LiberationSans-Bold.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-BoldItalic.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-Italic.ttf",
    "pdfjs/web/standard_fonts/LiberationSans-Regular.ttf",
    "pdfjs/web/standard_fonts/LICENSE_FOXIT",
    "pdfjs/web/standard_fonts/LICENSE_LIBERATION",
    "pdfjs/web/viewer.css",
    "pdfjs/web/viewer.html",
    "pdfjs/web/viewer.js",
    "pdfjs/web/viewer.js.map",
    "pdf-songbook-viewer.html",
    "religiosi.html",
    "rosary.html",
    "sesta-nona.html",
    "songbook.html",
    "songbook/01 Ingresso/1. Acclamate al Signore.htm",
    "songbook/01 Ingresso/10. Noi veniamo a Te.htm",
    "songbook/01 Ingresso/11. Ora siamo arrivati (G. Serapiglia).htm",
    "songbook/01 Ingresso/12. Santa Chiesa di Dio  (Capo II).htm",
    "songbook/01 Ingresso/13. Veniamo da Te o Signore.htm",
    "songbook/01 Ingresso/2. ALZATI E RISPLENDI (DDML-EDC).htm",
    "songbook/01 Ingresso/3. Ascolta Signore.htm",
    "songbook/01 Ingresso/4. Canto dei tre giovani.htm",
    "songbook/01 Ingresso/5. Il tuo popolo in cammino (Capo II).htm",
    "songbook/01 Ingresso/6. Jesus Christ you are my life.htm",
    "songbook/01 Ingresso/7. Laudato Sii, Signore mio (Cantico della creazione).htm",
    "songbook/01 Ingresso/8. Lodate il Signore dai cieli.htm",
    "songbook/01 Ingresso/9. Mia forza e mio canto (P. Comi EDC).htm",
    "songbook/02 Kyrie/I. Signore Pietà (F. Buttazzo).htm",
    "songbook/02 Kyrie/II. Signore Pietà (GEN).htm",
    "songbook/02 Kyrie/III. Kyrie Eleison.htm",
    "songbook/02 Kyrie/IV. LORD HAVE MERCY (ACTS AND POTENCIES).htm",
    "songbook/03 Gloria/IX. GLORIA A DIO (G. SERAPIGLIA).htm",
    "songbook/03 Gloria/V. GLORIA.htm",
    "songbook/03 Gloria/VI. GLORIA (GIOMBINI).htm",
    "songbook/03 Gloria/VII. GLORIA (RITIRO CANTORI 2012) (CAPO II).htm",
    "songbook/03 Gloria/VIII. Gloria (Buttazzo).htm",
    "songbook/04 Alleluia/X. Alleluia.htm",
    "songbook/04 Alleluia/XI. Alleluia (WYD’95).htm",
    "songbook/04 Alleluia/XII. Alleluia, Da chi andremo.htm",
    "songbook/04 Alleluia/XIII. Alleluia, Passerano i cieli (NCDP).htm",
    "songbook/04 Alleluia/XIV. Alleluia, Cantate al Signore.htm",
    "songbook/04 Alleluia/XIX. LODE A TE O CRISTO (QUARESIMA).htm",
    "songbook/04 Alleluia/XV. ALLELUIA, LA NOSTRA FESTA.htm",
    "songbook/04 Alleluia/XVI. ALLELUIA (J. NEZ MARCELO).htm",
    "songbook/04 Alleluia/XVII. ALLELUIA, OGGI È NATO IL SALVATORE (NATALE).htm",
    "songbook/04 Alleluia/XVIII. Canta Alleluia.htm",
    "songbook/04 Alleluia/XX. Lode a Te o Cristo (Quaresima).htm",
    "songbook/05 Offertorio/14. Accogli I Nostri Doni.htm",
    "songbook/05 Offertorio/15. BENEDETTO TU SIGNORE.htm",
    "songbook/05 Offertorio/16. COSA OFFRIRTI.htm",
    "songbook/05 Offertorio/17. Davanti a Te.htm",
    "songbook/05 Offertorio/18. DONACCI TE STESSO.htm",
    "songbook/05 Offertorio/19. Ecco quel che abbiamo.htm",
    "songbook/05 Offertorio/20. FRUTTO DELLA NOSTRA TERRA.htm",
    "songbook/05 Offertorio/21. IL SACRIFICIO DELLA LODE.htm",
    "songbook/05 Offertorio/22. IO TI OFFRO.htm",
    "songbook/05 Offertorio/23. NOI CON TE.htm",
    "songbook/05 Offertorio/24. PANE DI VITA SEI.htm",
    "songbook/05 Offertorio/25. PANE E VINO DI OFFRIAMO.htm",
    "songbook/05 Offertorio/26. PER QUESTI DONI.htm",
    "songbook/05 Offertorio/27. SE M’ACCOGLI.htm",
    "songbook/05 Offertorio/28. Segni del Tuo amore (GEN VERDE, GEN ROSSO).htm",
    "songbook/05 Offertorio/29. Su quest’altare.htm",
    "songbook/06 Santo/XVIII. Santo (Frisina).htm",
    "songbook/06 Santo/XXI. Santo.htm",
    "songbook/06 Santo/XXII. Santo (GEN).htm",
    "songbook/06 Santo/XXIII. SANTO.htm",
    "songbook/06 Santo/XXIV. SANTO (COME FUOCO VIVO).htm",
    "songbook/06 Santo/XXIX. SANTO (F. BUTAZZO).htm",
    "songbook/06 Santo/XXV. SANTO (G. SERAPIGLIA).htm",
    "songbook/06 Santo/XXVI. SANTO (GEN VERDE).htm",
    "songbook/06 Santo/XXVII. SANTO (LADISPOLI).htm",
    "songbook/06 Santo/XXX. Acclamazione.htm",
    "songbook/07 Agnus Dei/XXXI. AGNUS DEI.htm",
    "songbook/07 Agnus Dei/XXXII. AGNELLO DI DIO.htm",
    "songbook/07 Agnus Dei/XXXIII. AGNELLO DI DIO (FRISINA).htm",
    "songbook/07 Agnus Dei/XXXIV. Agnello di Dio.htm",
    "songbook/07 Agnus Dei/XXXV. AGNELLO DI DIO (RNS).htm",
    "songbook/08 Comunione/30. ACCOGLIMI (EDC).htm",
    "songbook/08 Comunione/31. AL SIGNORE CANTERÒ.htm",
    "songbook/08 Comunione/32. CERCO LA TUA VOCE.htm",
    "songbook/08 Comunione/33. CHI CI SEPARERÀ (RNS).htm",
    "songbook/08 Comunione/34. COME FUOCO VIVO (GEN VERDE, GEN ROSSO).htm",
    "songbook/08 Comunione/35. CON AMORE INFINITO.htm",
    "songbook/08 Comunione/36. DACCI IL TUO PANE.htm",
    "songbook/08 Comunione/37. DALL’AURORA AL TRAMONTO.htm",
    "songbook/08 Comunione/38. DOV’È CARITÀ E AMORE.htm",
    "songbook/08 Comunione/39. DOVE DUE O TRE.htm",
    "songbook/08 Comunione/40. E SONO SOLO UN UOMO (EDC).htm",
    "songbook/08 Comunione/41. ECCOMI, SIGNORE.htm",
    "songbook/08 Comunione/42. FRATELLO SOLE, SORELLA LUNA.htm",
    "songbook/08 Comunione/43. L’UNICO MAESTRO..htm",
    "songbook/08 Comunione/44. LA VERA VITE.htm",
    "songbook/08 Comunione/45. MI BASTA IL TUO AMORE GESÙ.htm",
    "songbook/08 Comunione/46. NELLE TUE MANI.htm",
    "songbook/08 Comunione/47. OGNI MIA PAROLA.htm",
    "songbook/08 Comunione/48. ORA CHE SEI IN MEZZO A NOI (G. SERAPIGLIA).htm",
    "songbook/08 Comunione/49. PANE DEL CIELO.htm",
    "songbook/08 Comunione/50. PANE DI VITA NUOVA.htm",
    "songbook/08 Comunione/51. POPOLI TUTTI.htm",
    "songbook/08 Comunione/52. QUANDO GUARDO ALLA TUA SANTITÀ.htm",
    "songbook/08 Comunione/53. RESTA ANCORA MIO SIGNORE.htm",
    "songbook/08 Comunione/54. RESTA QUI CON NOI.htm",
    "songbook/08 Comunione/55. SEI PER NOI CIBO DI ETERNITÀ.htm",
    "songbook/08 Comunione/56. SOLO TU O SIGNORE.htm",
    "songbook/08 Comunione/57. TE AL CENTRO DEL MIO CUORE.htm",
    "songbook/08 Comunione/58. TU SEI.htm",
    "songbook/08 Comunione/59. TU SEI LA MIA VITA (SYMBOLUM 77).htm",
    "songbook/08 Comunione/60. TU SEI LA PERLA PREZIOSA.htm",
    "songbook/08 Comunione/61. VERBUM PANIS.htm",
    "songbook/08 Comunione/62. VIENI E SEGUIMI.htm",
    "songbook/08 Comunione/63. VIVERE CON TE.htm",
    "songbook/08 Comunione/64. VOI SIETE DI DIO.htm",
    "songbook/09 Finale/65. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/66. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/67. ALLEANZA DI PACE.htm",
    "songbook/09 Finale/68. ANDATE PER LE STRADE (EDC).htm",
    "songbook/09 Finale/69. CANZONE DELL’AMICIZIA (G. FONTANA).htm",
    "songbook/09 Finale/70. E’ BELLO LODARTI.htm",
    "songbook/09 Finale/71. EMMANUEL.htm",
    "songbook/09 Finale/72. GETTA LE TUE RETI.htm",
    "songbook/09 Finale/73. IN ETERNO CANTERÒ.htm",
    "songbook/09 Finale/74. LA TUA DIMORA.htm",
    "songbook/09 Finale/75. LE TUE MERAVIGLIE.htm",
    "songbook/09 Finale/76. LODE AL NOME TUO.htm",
    "songbook/09 Finale/77. MI DICHIARO PER CRISTO.htm",
    "songbook/09 Finale/78. PACE SIA, PACE A VOI (GEN VERDE-ROSSO).htm",
    "songbook/09 Finale/79. RE DEI RE.htm",
    "songbook/09 Finale/80. SERVO PER AMORE.htm",
    "songbook/09 Finale/81. SPLENDI GESÙ.htm",
    "songbook/09 Finale/82. VI AMO COSÌ.htm",
    "songbook/10 Adorazione/83. ANIMA CHRISTI.htm",
    "songbook/10 Adorazione/84. CANONE DI TAIZÈ.htm",
    "songbook/10 Adorazione/85. DIO GRANDEI DIO.htm",
    "songbook/10 Adorazione/86. DIO HA TANTO AMATO IL MONDO.htm",
    "songbook/10 Adorazione/87. DONAMI IL TUO AMORE.htm",
    "songbook/10 Adorazione/88. GRANDE È IL SIGNORE (DDML).htm",
    "songbook/10 Adorazione/89. MAESTÀ (DDML).htm",
    "songbook/10 Adorazione/90. MI BASTA LA TUA GRAZIA.htm",
    "songbook/10 Adorazione/91. SONO QUI A LODARTI (HILLSONG).htm",
    "songbook/10 Adorazione/92. STAI CON ME.htm",
    "songbook/10 Adorazione/93. TU SEI SANTO, TU SEI RE (CAPO II).htm",
    "songbook/10 Adorazione/94. TUTTO CIÒ CHE SONO.htm",
    "songbook/11 Spirito Santo/100. VIENI, VIENI SPIRITO D’AMORE.htm",
    "songbook/11 Spirito Santo/95. DEL TUO SPIRITO SIGNORE.htm",
    "songbook/11 Spirito Santo/96. ECCO L’ACQUA.htm",
    "songbook/11 Spirito Santo/97. INVOCHIAMO LA TUA PRESENZA.htm",
    "songbook/11 Spirito Santo/98. VIENI SANTO SPIRITO (NEL MIO CUORE).htm",
    "songbook/11 Spirito Santo/99. VIENI SANTO SPIRITO DI DIO.htm",
    "songbook/12 Mariano/101. AVE MARIA (VERBUM PANIS).htm",
    "songbook/12 Mariano/102. CANTO A TE MARIA.htm",
    "songbook/12 Mariano/103. GIOISCI FIGLIA DI SION.htm",
    "songbook/12 Mariano/104. GIOISCI FIGLIA DI SION.htm",
    "songbook/12 Mariano/105. GRANDI COSE.htm",
    "songbook/12 Mariano/106. LA MIA ANIMA CANTA.htm",
    "songbook/12 Mariano/107. MADRE, IO VORREI.htm",
    "songbook/12 Mariano/108. MAGNIFICAT.htm",
    "songbook/12 Mariano/109. MARIA TU SEI.htm",
    "songbook/12 Mariano/110. MARIA VOGLIAMO AMARTI.htm",
    "songbook/12 Mariano/111. MERAVIGLIE IN TE.htm",
    "songbook/12 Mariano/112. O DONNA GLORIOSA.htm",
    "songbook/12 Mariano/113. SALVE REGINA.htm",
    "songbook/12 Mariano/114. SANTA MARIA DEL CAMMINO.htm",
    "songbook/12 Mariano/115. VIENI MARIA.htm",
    "songbook/13 Avvento/116. ALZATI E RISPLENDI (F. PALMA).htm",
    "songbook/13 Avvento/119. CON L’OFFERTA DI GESÙ.htm",
    "songbook/13 Avvento/120. DAL TRONCO DI IESSE.htm",
    "songbook/13 Avvento/121. EMMAUEL TU SEI (F. BUTTAZZO).htm",
    "songbook/13 Avvento/122. INNALZIAMO LO SGUARDO.htm",
    "songbook/13 Avvento/123. LUCE CHE SORGI NELLA LOTTE.htm",
    "songbook/13 Avvento/124. O CIELO PIOVETE DALL’ALTO.htm",
    "songbook/13 Avvento/125. PREPARIAMO LA VIA AL SIGNORE.htm",
    "songbook/13 Avvento/126. RALLEGRIAMOCI (P. AURICCHIO).htm",
    "songbook/13 Avvento/127. SI RIACCENDA LA SPERANZA (F. PALMA).htm",
    "songbook/13 Avvento/128. SOFFIA (N. ESCAMIS).htm",
    "songbook/13 Avvento/129. TI OFFRIAMO IL PANE (F. PALMA).htm",
    "songbook/13 Avvento/131. VENITE FEDELI.htm",
    "songbook/13 Avvento/132. VIENI GESÙ, MARANATHÀ.htm",
    "songbook/14 Natale/116. ALZATI E RISPLENDI (F. PALMA).htm",
    "songbook/14 Natale/117. ASTRO DEL CIEL (3 LINGUE).htm",
    "songbook/14 Natale/118. CANTEREMO GLORIA A TE.htm",
    "songbook/14 Natale/119. CON L’OFFERTA DI GESÙ.htm",
    "songbook/14 Natale/120. DAL TRONCO DI IESSE.htm",
    "songbook/14 Natale/121. EMMAUEL TU SEI (F. BUTTAZZO).htm",
    "songbook/14 Natale/122. INNALZIAMO LO SGUARDO.htm",
    "songbook/14 Natale/123. LUCE CHE SORGI NELLA LOTTE.htm",
    "songbook/14 Natale/124. O CIELO PIOVETE DALL’ALTO.htm",
    "songbook/14 Natale/125. PREPARIAMO LA VIA AL SIGNORE.htm",
    "songbook/14 Natale/126. RALLEGRIAMOCI (P. AURICCHIO).htm",
    "songbook/14 Natale/127. SI RIACCENDA LA SPERANZA (F. PALMA).htm",
    "songbook/14 Natale/128. SOFFIA (N. ESCAMIS).htm",
    "songbook/14 Natale/129. TI OFFRIAMO IL PANE (F. PALMA).htm",
    "songbook/14 Natale/130. TU SCENDI DALLE STELLE.htm",
    "songbook/14 Natale/131. VENITE FEDELI.htm",
    "songbook/14 Natale/132. VIENI GESÙ, MARANATHÀ.htm",
    "songbook/14 Natale/Angels We Have Heard On High-F-Major.pdf",
    "songbook/14 Natale/For the Fruits of this Creation.pdf",
    "songbook/14 Natale/Let All things - O come Divine.pdf",
    "songbook/14 Natale/O Come Emmanuel.pdf",
    "songbook/14 Natale/Silent Night Bb Major.pdf",
    "songbook/14 Natale/The First Noel.pdf",
    "songbook/15 Quaresma/133. E’ TEMPO DI GRAZIA.htm",
    "songbook/15 Quaresma/134. MIO DIO MI ABBANDONO A TE (DDML).htm",
    "songbook/15 Quaresma/135. NELLE TUE MANI.htm",
    "songbook/15 Quaresma/136. VIENI POPOLO MIO.htm",
    "songbook/15 Quaresma/137. SCUSA SIGNORE (EP-GIF).htm",
    "songbook/16 Pasqua/138. ALLELUIA, È RISORTO IL SIGNOR.htm",
    "songbook/16 Pasqua/139. CRISTO È RISORTO VERAMENTE.htm",
    "songbook/16 Pasqua/140. CRUCEM TUAM.htm",
    "songbook/16 Pasqua/141. DIO HA TANTO AMATO IL MONDO.htm",
    "songbook/16 Pasqua/142. NON CERCATE TRA I MORTI.htm",
    "songbook/16 Pasqua/143. CELEBRIAMO IL SIGNORE.htm",
    "songbook/16 Pasqua/144. VOLGI IL TUO SGUARDO (N. ESCAMIS).htm",
    "songbook/16 Pasqua/145. DACCI IL TUO PANE.htm",
    "songbook/16 Pasqua/146. ORA SIAMO ARRIVATI (G. SERAPIGLIA).htm",
    "songbook/16 Pasqua/147. RESURREZIONE.htm",
    "songbook/16 Pasqua/148. CANTIAMO CON GIOIA.htm",
    "songbook/16 Pasqua/149. ESULTA IL CIELO (BUTTAZZO).htm",
    "songbook/17 Altre Lingue/150. ALMA MISIONERA.htm",
    "songbook/17 Altre Lingue/151. NADIE TE AMA COMO YO (CAPO III).htm",
    "songbook/17 Altre Lingue/152. DESDE EL CIELO.htm",
    "songbook/17 Altre Lingue/153. SEÑOR TEN PIEDAD (ALEJANDRO MEJÍA).htm",
    "songbook/17 Altre Lingue/154. ESTO QUE SOY ESTO TE DOY.htm",
    "songbook/17 Altre Lingue/155. MI ALMA CANTA (CAPO II).htm",
    "songbook/17 Altre Lingue/156. AT HOME IN OUR HEARTS  (CAPO II).htm",
    "songbook/17 Altre Lingue/157. UNANG ALAY.htm",
    "songbook/17 Altre Lingue/158. PANALANGIN SA PAGIGING BUKAS PALAD.htm",
    "songbook/17 Altre Lingue/159. THE FACE OF GOD.htm",
    "songbook/17 Altre Lingue/160. AWIT NG PAGHAHANGAD.htm",
    "songbook/17 Altre Lingue/161. NARITO AKO.htm",
    "songbook/17 Altre Lingue/162. ANIMA CHRIST.htm",
    "songbook/18 Songbook Collection/Filipino Music Sheet.pdf",
    "songbook/18 Songbook Collection/Filipino Songbook.pdf",
    "songbook/18 Songbook Collection/Italian Guitar Songbook.pdf",
    "songbook/18 Songbook Collection/Music Sheet Chants.pdf",
    "songbook/18 Songbook Collection/Music Sheets 2026.pdf",
    "songbook/18 Songbook Collection/Novena di Natale.pdf",
    "songbook-viewer.html"
];

/* ==========================================
   URL HELPERS
   Works at domain root or inside a subfolder.
========================================== */

function appURL(file) {
    return new URL(file, self.registration.scope).href;
}

function isInsideScope(url) {
    return url.href.startsWith(self.registration.scope);
}

/* ==========================================
   OFFLINE NAVIGATION RESOLUTION
   Supports:
   - page.html
   - page
   - nested/page.html
   - nested/page
   - trailing slashes
   - query parameters
========================================== */

async function findCachedNavigation(cache, url) {
    const scopeURL = new URL(self.registration.scope);

    const pathname = url.pathname;
    const search = url.search;

    const candidates = [];

    function addCandidate(path) {
        if (!path) return;

        if (!candidates.includes(path)) {
            candidates.push(path);
        }
    }

    // 1. Original URL
    addCandidate(pathname);

    // 2. Remove trailing slash
    let cleanPath = pathname;

    if (
        cleanPath.endsWith("/") &&
        cleanPath !== scopeURL.pathname
    ) {
        cleanPath = cleanPath.slice(0, -1);
        addCandidate(cleanPath);
    }

    // 3. Add or remove .html
    const lastSegment = cleanPath.split("/").pop();

    if (lastSegment && !lastSegment.includes(".")) {
        // Extensionless URL -> HTML file
        addCandidate(cleanPath + ".html");

        // Also try directory index
        addCandidate(cleanPath + "/index.html");

    } else if (lastSegment.toLowerCase().endsWith(".html")) {
        // HTML URL -> extensionless URL
        addCandidate(
            cleanPath.slice(0, -5)
        );
    }

    // 4. Try all candidates in the active cache
    for (const candidate of candidates) {
        const candidateURL = new URL(
            candidate + search,
            url.origin
        );

        // First: exact URL, including query
        let response = await cache.match(candidateURL.href);

        if (response) {
            return response;
        }

        // Second: ignore query parameters
        response = await cache.match(candidateURL.href, {
            ignoreSearch: true
        });

        if (response) {
            return response;
        }
    }

    return null;
}


function sendProgress(port, data) {
    if (!port) return;

    try {
        port.postMessage({
            type: "PROGRESS",
            ...data
        });
    } catch (error) {
        console.error("Could not send progress:", error);
    }
}

function sendFinal(port, data) {
    if (!port) return;

    try {
        port.postMessage({
            final: true,
            ...data
        });
    } catch (error) {
        console.error("Could not send final response:", error);
    }
}

/* ==========================================
   INSTALL
   Do not download files automatically.
   Cache Manager controls the download.
========================================== */

self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

/* ==========================================
   ACTIVATE
   Delete only old Compendio caches.
   Never delete unrelated browser caches.
========================================== */

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();

        const compendioCachePattern =
            /^compendio-v\d+\.\d+\.\d+(?:-(?:update|staging|backup))?$/;

        for (const key of keys) {
            if (
                compendioCachePattern.test(key) &&
                key !== CACHE_NAME
            ) {
                await caches.delete(key);
            }
        }

        await self.clients.claim();
    })());
});

/* ==========================================
   CACHE STATUS
========================================== */

async function getCacheStatus() {
    const cache = await caches.open(CACHE_NAME);

    const files = [];
    let cachedCount = 0;

    for (const file of APP_FILES) {
        const url = appURL(file);
        const response = await cache.match(url);

        const isCached = !!response;

        if (isCached) {
            cachedCount++;
        }

        files.push({
            file,
            cached: isCached
        });
    }

    return {
        success: true,
        total: APP_FILES.length,
        cached: cachedCount,
        missing: APP_FILES.length - cachedCount,
        files
    };
}



/* ==========================================
   DOWNLOAD ONE FILE
   Normalize HTTP response before caching.
========================================== */

async function downloadFile(file, cache) {
    const url = appURL(file);

    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error(
            "HTTP " + response.status + " - " + file
        );
    }

    if (response.type === "opaque") {
        throw new Error("Opaque response - " + file);
    }

    // Create clean, mutable response headers.
    const headers = new Headers(response.headers);

    // Remove transport/encoding metadata.
    // The Fetch API exposes the decoded response body.
    headers.delete("content-encoding");
    headers.delete("content-length");
    headers.delete("transfer-encoding");

    // Reconstruct the response for offline storage.
    const cleanResponse = new Response(
        response.body,
        {
            status: response.status,
            statusText: response.statusText,
            headers: headers
        }
    );

    // Store the normalized response.
    await cache.put(url, cleanResponse);

    return true;
}

/* ==========================================
   FETCH MISSING FILES
   Existing cached files are preserved.
========================================== */

async function fetchMissingFiles(port) {
    const mainCache = await caches.open(CACHE_NAME);

    let downloaded = 0;
    let alreadyCached = 0;
    const errors = [];

    const total = APP_FILES.length;

    for (let i = 0; i < total; i++) {
        const file = APP_FILES[i];
        const url = appURL(file);

        const existing = await mainCache.match(url);

        if (existing) {
            alreadyCached++;

            sendProgress(port, {
                operation: "FETCH_MISSING",
                current: i + 1,
                total,
                file,
                status: "cached",
                downloaded,
                alreadyCached,
                failed: errors.length
            });

            continue;
        }

        try {
            await downloadFile(file, mainCache);
            downloaded++;

            sendProgress(port, {
                operation: "FETCH_MISSING",
                current: i + 1,
                total,
                file,
                status: "downloaded",
                downloaded,
                alreadyCached,
                failed: errors.length
            });

        } catch (error) {
            console.error("Download failed:", file, error);

            errors.push({
                file,
                error: error.message
            });

            sendProgress(port, {
                operation: "FETCH_MISSING",
                current: i + 1,
                total,
                file,
                status: "failed",
                error: error.message,
                downloaded,
                alreadyCached,
                failed: errors.length
            });
        }
    }

    return {
        success: errors.length === 0,
        total,
        downloaded,
        alreadyCached,
        failed: errors.length,
        errors
    };
}

/* ==========================================
   COPY CACHE
========================================== */

async function copyCache(sourceName, destinationName) {
    const source = await caches.open(sourceName);
    const destination = await caches.open(destinationName);

    const requests = await source.keys();

    for (const request of requests) {
        const response = await source.match(request);

        if (!response) {
            throw new Error(
                "Missing response while copying: " + request.url
            );
        }

        await destination.put(request, response.clone());
    }

    return requests.length;
}

/* ==========================================
   BACK UP MAIN CACHE
========================================== */

async function backupMainCache() {
    await caches.delete(BACKUP_CACHE_NAME);

    const backup = await caches.open(BACKUP_CACHE_NAME);
    const main = await caches.open(CACHE_NAME);

    const requests = await main.keys();

    try {
        for (const request of requests) {
            const response = await main.match(request);

            if (!response) {
                throw new Error(
                    "Could not read existing cache entry: " + request.url
                );
            }

            await backup.put(request, response.clone());
        }
    } catch (error) {
        await caches.delete(BACKUP_CACHE_NAME);
        throw error;
    }

    return requests.length;
}

/* ==========================================
   RESTORE MAIN CACHE FROM BACKUP
========================================== */

async function restoreMainCache() {
    const backup = await caches.open(BACKUP_CACHE_NAME);

    const backupRequests = await backup.keys();

    await caches.delete(CACHE_NAME);

    const main = await caches.open(CACHE_NAME);

    for (const request of backupRequests) {
        const response = await backup.match(request);

        if (!response) {
            throw new Error(
                "Could not restore cache entry: " + request.url
            );
        }

        await main.put(request, response.clone());
    }

    return backupRequests.length;
}

/* ==========================================
   REBUILD CACHE
   1. Download everything to staging.
   2. Back up the current main cache.
   3. Replace the main cache.
   4. Restore backup if replacement fails.

   CacheStorage does not support a truly
   atomic replacement. This is a rollback
   strategy, not an atomic transaction.
========================================== */

async function rebuildCache(port) {
    await caches.delete(STAGING_CACHE_NAME);

    const staging = await caches.open(STAGING_CACHE_NAME);

    const total = APP_FILES.length;
    const errors = [];

    /* STEP 1: DOWNLOAD ALL FILES TO STAGING */

    for (let i = 0; i < total; i++) {
        const file = APP_FILES[i];

        try {
            await downloadFile(file, staging);

            sendProgress(port, {
                operation: "CLEAR_CACHE_AND_FETCH_ALL",
                phase: "downloading",
                current: i + 1,
                total,
                file,
                status: "downloaded",
                failed: errors.length
            });

        } catch (error) {
            console.error("Staging download failed:", file, error);

            errors.push({
                file,
                error: error.message
            });

            sendProgress(port, {
                operation: "CLEAR_CACHE_AND_FETCH_ALL",
                phase: "downloading",
                current: i + 1,
                total,
                file,
                status: "failed",
                error: error.message,
                failed: errors.length
            });
        }
    }

    /* DO NOT TOUCH MAIN CACHE IF DOWNLOAD FAILED */

    if (errors.length > 0) {
        await caches.delete(STAGING_CACHE_NAME);

        return {
            success: false,
            stage: "download",
            message: "Some files could not be downloaded. Existing cache was preserved.",
            total,
            downloaded: total - errors.length,
            failed: errors.length,
            errors
        };
    }

    /* STEP 2: BACK UP CURRENT MAIN CACHE */

    sendProgress(port, {
        operation: "CLEAR_CACHE_AND_FETCH_ALL",
        phase: "backup",
        message: "Backing up existing cache..."
    });

    try {
        await backupMainCache();
    } catch (error) {
        await caches.delete(STAGING_CACHE_NAME);

        return {
            success: false,
            stage: "backup",
            message: "Backup failed. Existing cache was not replaced.",
            error: error.message
        };
    }

    /* STEP 3: REPLACE MAIN CACHE */

    try {
        sendProgress(port, {
            operation: "CLEAR_CACHE_AND_FETCH_ALL",
            phase: "replacing",
            message: "Replacing existing cache..."
        });

        await caches.delete(CACHE_NAME);

        const main = await caches.open(CACHE_NAME);
        const stagingRequests = await staging.keys();

        for (let i = 0; i < stagingRequests.length; i++) {
            const request = stagingRequests[i];
            const response = await staging.match(request);

            if (!response) {
                throw new Error(
                    "Staged file could not be read: " + request.url
                );
            }

            await main.put(request, response.clone());

            sendProgress(port, {
                operation: "CLEAR_CACHE_AND_FETCH_ALL",
                phase: "replacing",
                current: i + 1,
                total: stagingRequests.length,
                file: request.url,
                status: "copied"
            });
        }

        /* STEP 4: VERIFY THE NEW MAIN CACHE */

        const verification = await getCacheStatus();

        if (verification.missing > 0) {
            throw new Error(
                verification.missing +
                " files are missing after cache replacement."
            );
        }

        await caches.delete(STAGING_CACHE_NAME);
        await caches.delete(BACKUP_CACHE_NAME);

        return {
            success: true,
            total,
            downloaded: total,
            cached: verification.cached,
            message: "All files were downloaded and cached successfully."
        };

    } catch (error) {
        console.error("Cache replacement failed:", error);

        /* ATTEMPT ROLLBACK */

        try {
            sendProgress(port, {
                operation: "CLEAR_CACHE_AND_FETCH_ALL",
                phase: "rollback",
                message: "Replacement failed. Restoring previous cache..."
            });

            await restoreMainCache();

            await caches.delete(STAGING_CACHE_NAME);
            await caches.delete(BACKUP_CACHE_NAME);

            return {
                success: false,
                stage: "replacement",
                restored: true,
                message: "Replacement failed. Previous cache was restored.",
                error: error.message
            };

        } catch (restoreError) {
            console.error("Cache restoration failed:", restoreError);

            return {
                success: false,
                stage: "rollback",
                restored: false,
                message: "Replacement and restoration both failed. Backup cache was retained.",
                error: error.message,
                restoreError: restoreError.message
            };
        }
    }
}

/* ==========================================
   MESSAGE HANDLER
========================================== */

self.addEventListener("message", event => {
    if (!event.data || !event.data.type) {
        return;
    }

    const type = event.data.type;
    const port = event.ports && event.ports[0];

    event.waitUntil((async () => {
        try {
            let result;

            switch (type) {

                case "GET_CACHE_STATUS":
                    result = await getCacheStatus();
                    break;

                case "FETCH_MISSING":
                    result = await fetchMissingFiles(port);
                    break;

                case "CLEAR_CACHE_AND_FETCH_ALL":
                    result = await rebuildCache(port);
                    break;

                /* Compatibility with existing app.js */

                case "UPDATE_APP":
                    result = await rebuildCache(port);
                    break;

                default:
                    return;
            }

            sendFinal(port, result);

        } catch (error) {
            console.error("Service Worker operation failed:", error);

            sendFinal(port, {
                success: false,
                error: error.message || "Unknown Service Worker error"
            });
        }
    })());
});

/* ==========================================
   FETCH
   Cache-first for files inside app scope.

   Supports:
   - HTML and extensionless URLs
   - Nested navigation paths
   - Trailing slashes
   - Query parameters
   - Songbook HTML files
   - Encoded filenames and spaces
========================================== */

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (!isInsideScope(url)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const scopeURL = new URL(self.registration.scope);

        /* ==================================
           1. ROOT HOMEPAGE
        ================================== */

        if (
            request.mode === "navigate" &&
            url.pathname === scopeURL.pathname
        ) {
            const indexResponse = await cache.match(
                appURL("index.html")
            );

            if (indexResponse) {
                return indexResponse;
            }
        }


/* ==================================
   SONGBOOK VIEWER
   Preserve the ?file= parameter in
   the browser URL while serving the
   cached viewer HTML.
================================== */

if (
    request.mode === "navigate" &&
    url.pathname.endsWith("/songbook-viewer.html")
) {
    const viewerResponse = await cache.match(
        appURL("songbook-viewer.html")
    );

    if (viewerResponse) {
        return viewerResponse;
    }
}

        /* ==================================
           2. EXACT CACHE MATCH
        ================================== */

        let cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        /* ==================================
           3. MATCH WITHOUT QUERY PARAMETERS

           Important for:
           songbook-viewer.html?file=...
        ================================== */

        cached = await cache.match(request, {
            ignoreSearch: true
        });

        if (cached) {
            return cached;
        }

        /* ==================================
           4. NAVIGATION URL RESOLUTION

           Examples:

           /mass-guide
           /mass-guide.html

           /prayers/angelus
           /prayers/angelus.html

           /mass-guide/
           /mass-guide.html
        ================================== */

        if (request.mode === "navigate") {
            cached = await findCachedNavigation(
                cache,
                url
            );

            if (cached) {
                return cached;
            }
        }

        /* ==================================
           5. NETWORK FALLBACK
        ================================== */

        try {
            return await fetch(request);

        } catch (error) {
            console.warn(
                "Network unavailable:",
                url.href
            );

            /* ==============================
               6. OFFLINE HOMEPAGE FALLBACK
            ============================== */

            if (request.mode === "navigate") {
                const fallback = await cache.match(
                    appURL("index.html")
                );

                if (fallback) {
                    return fallback;
                }
            }

            /* ==============================
               7. FILE NOT AVAILABLE OFFLINE
            ============================== */

            return new Response(
                "You are offline and this file is not available in the cache.",
                {
                    status: 503,
                    statusText: "Offline",
                    headers: {
                        "Content-Type":
                            "text/plain; charset=utf-8"
                    }
                }
            );
        }
    })());
});