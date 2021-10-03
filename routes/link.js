const express = require('express')

const {linkCreateValidator, linkUpdateValidator} = require('../validators/link')
const {runValidation} = require('../validators')
const { requireSignin, authMiddleware, adminMiddleware, canUpdateDeleteLink, adminCanUpdateDeleteLink } = require('../controllers/auth')
const { create, list, read, remove, update, clickCount, popular, popularInCategory } = require('../controllers/link')

const router = express.Router()

router.post('/link', linkCreateValidator,runValidation, requireSignin, authMiddleware, create)
router.post('/links', requireSignin, adminMiddleware, list)
router.put('/click-count', clickCount)
router.get('/link/popular', popular)
router.get('/link/popular/:slug', popularInCategory)
router.get('/link/:id', read)
router.put('/link/:id', linkUpdateValidator, runValidation, requireSignin, authMiddleware,canUpdateDeleteLink, update)
router.put('/link/admin/:id', linkUpdateValidator, runValidation, requireSignin, adminMiddleware,adminCanUpdateDeleteLink, update)
router.delete('/link/:id', requireSignin, authMiddleware, remove)
router.delete('/link/admin/:id', requireSignin, adminMiddleware, remove)

module.exports = router