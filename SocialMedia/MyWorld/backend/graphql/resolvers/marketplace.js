const pool = require('../../db')
const { GraphQLError } = require('graphql')
const { requireAuth } = require('../errors')

const marketplaceResolvers = {
  Query: {
    marketplaceListings: async (_, { category }, context) => {
      requireAuth(context)

      let query = `SELECT ml.*, u.username FROM marketplace_listings ml
                   JOIN users u ON u.id = ml.user_id
                   WHERE ml.status = 'active'`
      const params = []

      if (category) {
        query += ' AND ml.category = $1'
        params.push(category)
      }

      query += ' ORDER BY ml.created_at DESC'

      const result = await pool.query(query, params)

      return result.rows.map(mapListing)
    },

    myListings: async (_, __, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        'SELECT * FROM marketplace_listings WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      )

      return result.rows.map(mapListing)
    },

    listing: async (_, { id }, context) => {
      requireAuth(context)

      const listingResult = await pool.query(
        `SELECT ml.*, u.username, u.email
         FROM marketplace_listings ml
         JOIN users u ON u.id = ml.user_id
         WHERE ml.id = $1`,
        [id]
      )

      if (listingResult.rows.length === 0) {
        throw new GraphQLError('Listing not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const offersResult = await pool.query(
        `SELECT mo.*, u.username
         FROM marketplace_offers mo
         JOIN users u ON u.id = mo.buyer_id
         WHERE mo.listing_id = $1
         ORDER BY mo.created_at DESC`,
        [id]
      )

      const listing = mapListing(listingResult.rows[0])
      listing.username = listingResult.rows[0].username
      listing.email = listingResult.rows[0].email
      listing.offers = offersResult.rows.map((row) => ({
        id: row.id,
        listingId: row.listing_id,
        offerPrice: row.offer_price ? parseFloat(row.offer_price) : null,
        message: row.message,
        status: row.status,
        username: row.username,
      }))

      return listing
    },

    sentOffers: async (_, __, context) => {
      const buyerId = requireAuth(context)

      const result = await pool.query(
        `SELECT mo.*, u.username, ml.title, ml.price
         FROM marketplace_offers mo
         JOIN marketplace_listings ml ON ml.id = mo.listing_id
         JOIN users u ON u.id = ml.user_id
         WHERE mo.buyer_id = $1
         ORDER BY mo.created_at DESC`,
        [buyerId]
      )

      return result.rows.map((row) => ({
        id: row.id,
        listingId: row.listing_id,
        offerPrice: row.offer_price ? parseFloat(row.offer_price) : null,
        message: row.message,
        status: row.status,
        username: row.username,
        title: row.title,
        price: row.price ? parseFloat(row.price) : null,
      }))
    },

    receivedOffers: async (_, __, context) => {
      const userId = requireAuth(context)

      const result = await pool.query(
        `SELECT mo.*, u.username, u.email, ml.title
         FROM marketplace_offers mo
         JOIN users u ON u.id = mo.buyer_id
         JOIN marketplace_listings ml ON ml.id = mo.listing_id
         WHERE ml.user_id = $1
         ORDER BY mo.created_at DESC`,
        [userId]
      )

      return result.rows.map((row) => ({
        id: row.id,
        listingId: row.listing_id,
        offerPrice: row.offer_price ? parseFloat(row.offer_price) : null,
        message: row.message,
        status: row.status,
        username: row.username,
        title: row.title,
      }))
    },
  },

  Mutation: {
    createListing: async (
      _,
      { title, description, price, imageUrl, category },
      context
    ) => {
      const userId = requireAuth(context)

      if (!title) {
        throw new GraphQLError('Title is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await pool.query(
        `INSERT INTO marketplace_listings
         (user_id, title, description, price, image_url, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          userId,
          title,
          description || null,
          price || null,
          imageUrl || null,
          category || null,
          'active',
        ]
      )

      return mapListing(result.rows[0])
    },

    updateListing: async (
      _,
      { listingId, title, description, price, imageUrl, category, status },
      context
    ) => {
      const userId = requireAuth(context)

      const ownership = await pool.query(
        'SELECT user_id FROM marketplace_listings WHERE id = $1',
        [listingId]
      )

      if (
        ownership.rows.length === 0 ||
        ownership.rows[0].user_id !== userId
      ) {
        throw new GraphQLError('You can only edit your own listings', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      const result = await pool.query(
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

      return mapListing(result.rows[0])
    },

    deleteListing: async (_, { listingId }, context) => {
      const userId = requireAuth(context)

      const ownership = await pool.query(
        'SELECT user_id FROM marketplace_listings WHERE id = $1',
        [listingId]
      )

      if (
        ownership.rows.length === 0 ||
        ownership.rows[0].user_id !== userId
      ) {
        throw new GraphQLError('You can only delete your own listings', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      await pool.query('DELETE FROM marketplace_listings WHERE id = $1', [
        listingId,
      ])
      return 'Listing deleted successfully'
    },

    sendOffer: async (_, { listingId, offerPrice, message }, context) => {
      const buyerId = requireAuth(context)

      if (!offerPrice) {
        throw new GraphQLError('Offer price is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const listing = await pool.query(
        'SELECT user_id FROM marketplace_listings WHERE id = $1',
        [listingId]
      )

      if (listing.rows.length === 0) {
        throw new GraphQLError('Listing not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      if (listing.rows[0].user_id === buyerId) {
        throw new GraphQLError('Cannot make offer on your own listing', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      await pool.query(
        `INSERT INTO marketplace_offers
         (listing_id, buyer_id, offer_price, message, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [listingId, buyerId, offerPrice, message || null, 'pending']
      )

      return 'Offer sent successfully'
    },

    acceptOffer: async (_, { offerId }, context) => {
      const userId = requireAuth(context)

      const offerCheck = await pool.query(
        `SELECT mo.* FROM marketplace_offers mo
         JOIN marketplace_listings ml ON ml.id = mo.listing_id
         WHERE mo.id = $1 AND ml.user_id = $2`,
        [offerId, userId]
      )

      if (offerCheck.rows.length === 0) {
        throw new GraphQLError('You can only accept offers on your listings', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      await pool.query(
        'UPDATE marketplace_offers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['accepted', offerId]
      )

      return 'Offer accepted'
    },

    declineOffer: async (_, { offerId }, context) => {
      const userId = requireAuth(context)

      const offerCheck = await pool.query(
        `SELECT mo.* FROM marketplace_offers mo
         JOIN marketplace_listings ml ON ml.id = mo.listing_id
         WHERE mo.id = $1 AND ml.user_id = $2`,
        [offerId, userId]
      )

      if (offerCheck.rows.length === 0) {
        throw new GraphQLError('You can only decline offers on your listings', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      await pool.query(
        'UPDATE marketplace_offers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['declined', offerId]
      )

      return 'Offer declined'
    },
  },
}

function mapListing(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price ? parseFloat(row.price) : null,
    imageUrl: row.image_url,
    category: row.category,
    status: row.status,
    username: row.username || null,
  }
}

module.exports = marketplaceResolvers
