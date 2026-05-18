const db = require('../db')

// Create marketplace listing
exports.createListing = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category } = req.body
    const userId = req.user.id

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const result = await db.query(
      `INSERT INTO marketplace_listings 
       (user_id, title, description, price, image_url, category, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, title, description || null, price || null, imageUrl || null, category || null, 'active']
    )

    res.status(201).json({
      message: 'Listing created successfully',
      listing: result.rows[0]
    })
  } catch (error) {
    console.error('Create listing error:', error)
    res.status(500).json({ error: 'Failed to create listing' })
  }
}

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const { category, status } = req.query
    let query = `SELECT ml.*, u.username FROM marketplace_listings ml
                 JOIN users u ON u.id = ml.user_id
                 WHERE ml.status = 'active'`
    const params = []

    if (category) {
      query += ' AND ml.category = $' + (params.length + 1)
      params.push(category)
    }

    query += ' ORDER BY ml.created_at DESC'

    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get listings error:', error)
    res.status(500).json({ error: 'Failed to get listings' })
  }
}

// Get user listings
exports.getUserListings = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      'SELECT * FROM marketplace_listings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get user listings error:', error)
    res.status(500).json({ error: 'Failed to get user listings' })
  }
}

// Get listing details
exports.getListingDetails = async (req, res) => {
  try {
    const { listingId } = req.params

    const listingResult = await db.query(
      `SELECT ml.*, u.username, u.email
       FROM marketplace_listings ml
       JOIN users u ON u.id = ml.user_id
       WHERE ml.id = $1`,
      [listingId]
    )

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    const offersResult = await db.query(
      `SELECT mo.*, u.username
       FROM marketplace_offers mo
       JOIN users u ON u.id = mo.buyer_id
       WHERE mo.listing_id = $1
       ORDER BY mo.created_at DESC`,
      [listingId]
    )

    res.json({
      ...listingResult.rows[0],
      offers: offersResult.rows
    })
  } catch (error) {
    console.error('Get listing details error:', error)
    res.status(500).json({ error: 'Failed to get listing details' })
  }
}

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const { listingId } = req.params
    const { title, description, price, imageUrl, category, status } = req.body
    const userId = req.user.id

    // Check ownership
    const ownership = await db.query(
      'SELECT user_id FROM marketplace_listings WHERE id = $1',
      [listingId]
    )

    if (ownership.rows.length === 0 || ownership.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own listings' })
    }

    const result = await db.query(
      `UPDATE marketplace_listings 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           image_url = COALESCE($4, image_url),
           category = COALESCE($5, category),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [title, description, price, imageUrl, category, status, listingId]
    )

    res.json({
      message: 'Listing updated successfully',
      listing: result.rows[0]
    })
  } catch (error) {
    console.error('Update listing error:', error)
    res.status(500).json({ error: 'Failed to update listing' })
  }
}

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const { listingId } = req.params
    const userId = req.user.id

    // Check ownership
    const ownership = await db.query(
      'SELECT user_id FROM marketplace_listings WHERE id = $1',
      [listingId]
    )

    if (ownership.rows.length === 0 || ownership.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own listings' })
    }

    const result = await db.query(
      'DELETE FROM marketplace_listings WHERE id = $1 RETURNING *',
      [listingId]
    )

    res.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('Delete listing error:', error)
    res.status(500).json({ error: 'Failed to delete listing' })
  }
}

// Send offer
exports.sendOffer = async (req, res) => {
  try {
    const { listingId, offerPrice, message } = req.body
    const buyerId = req.user.id

    if (!offerPrice) {
      return res.status(400).json({ error: 'Offer price is required' })
    }

    // Check if listing exists
    const listing = await db.query(
      'SELECT user_id FROM marketplace_listings WHERE id = $1',
      [listingId]
    )

    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (listing.rows[0].user_id === buyerId) {
      return res.status(400).json({ error: 'Cannot make offer on your own listing' })
    }

    const result = await db.query(
      `INSERT INTO marketplace_offers 
       (listing_id, buyer_id, offer_price, message, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [listingId, buyerId, offerPrice, message || null, 'pending']
    )

    res.status(201).json({
      message: 'Offer sent successfully',
      offer: result.rows[0]
    })
  } catch (error) {
    console.error('Send offer error:', error)
    res.status(500).json({ error: 'Failed to send offer' })
  }
}

// Get received offers
exports.getReceivedOffers = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT mo.*, u.username, u.email, ml.title
       FROM marketplace_offers mo
       JOIN users u ON u.id = mo.buyer_id
       JOIN marketplace_listings ml ON ml.id = mo.listing_id
       WHERE ml.user_id = $1
       ORDER BY mo.created_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get received offers error:', error)
    res.status(500).json({ error: 'Failed to get received offers' })
  }
}

// Get sent offers
exports.getSentOffers = async (req, res) => {
  try {
    const buyerId = req.user.id

    const result = await db.query(
      `SELECT mo.*, u.username, ml.title, ml.price
       FROM marketplace_offers mo
       JOIN users u ON u.id = ml.user_id
       JOIN marketplace_listings ml ON ml.id = mo.listing_id
       WHERE mo.buyer_id = $1
       ORDER BY mo.created_at DESC`,
      [buyerId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get sent offers error:', error)
    res.status(500).json({ error: 'Failed to get sent offers' })
  }
}

// Accept offer
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.body
    const userId = req.user.id

    // Verify ownership
    const offerCheck = await db.query(
      `SELECT mo.* FROM marketplace_offers mo
       JOIN marketplace_listings ml ON ml.id = mo.listing_id
       WHERE mo.id = $1 AND ml.user_id = $2`,
      [offerId, userId]
    )

    if (offerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You can only accept offers on your listings' })
    }

    const result = await db.query(
      'UPDATE marketplace_offers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['accepted', offerId]
    )

    res.json({
      message: 'Offer accepted',
      offer: result.rows[0]
    })
  } catch (error) {
    console.error('Accept offer error:', error)
    res.status(500).json({ error: 'Failed to accept offer' })
  }
}

// Decline offer
exports.declineOffer = async (req, res) => {
  try {
    const { offerId } = req.body
    const userId = req.user.id

    // Verify ownership
    const offerCheck = await db.query(
      `SELECT mo.* FROM marketplace_offers mo
       JOIN marketplace_listings ml ON ml.id = mo.listing_id
       WHERE mo.id = $1 AND ml.user_id = $2`,
      [offerId, userId]
    )

    if (offerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You can only decline offers on your listings' })
    }

    const result = await db.query(
      'UPDATE marketplace_offers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['declined', offerId]
    )

    res.json({
      message: 'Offer declined',
      offer: result.rows[0]
    })
  } catch (error) {
    console.error('Decline offer error:', error)
    res.status(500).json({ error: 'Failed to decline offer' })
  }
}
