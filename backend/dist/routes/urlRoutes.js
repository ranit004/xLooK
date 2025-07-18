"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlRoutes = void 0;
const express_1 = require("express");
const urlController_1 = require("../controllers/urlController");
const scanController_1 = require("../controllers/scanController");
const router = (0, express_1.Router)();
exports.urlRoutes = router;
router.post('/check-url', urlController_1.checkUrlRisk);
router.get('/scans/recent', scanController_1.getRecentScans);
router.get('/scans/stats', scanController_1.getScanStats);
router.get('/scans/:id', scanController_1.getScanById);
router.get('/scans/url/:url', scanController_1.getUrlHistory);
//# sourceMappingURL=urlRoutes.js.map