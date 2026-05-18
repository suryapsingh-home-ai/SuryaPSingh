const express = require('express')
const router = express.Router()
const marketplaceController = require('../controllers/marketplace')

// Create listing
router.post('/listings', marketplaceController.createListing)

// Get all listings
router.get('/listings', marketplaceController.getAllListings)

// Get user listings
router.get('/listings/user', marketplaceController.getUserListings)

// Get listing details
router.get('/listings/:listingId', marketplaceController.getListingDetails)

// Update listing
router.put('/listings/:listingId', marketplaceController.updateListing)

// Delete listing
router.delete('/listings/:listingId', marketplaceController.deleteListing)

// Send offer
router.post('/offers', marketplaceController.sendOffer)

// Get received offers
router.get('/offers/received', marketplaceController.getReceivedOffers)

// Get sent offers
router.get('/offers/sent', marketplaceController.getSentOffers)

// Accept offer
router.post('/offers/accept', marketplaceController.acceptOffer)

// Decline offer
router.post('/offers/decline', marketplaceController.declineOffer)

module.exports = router
