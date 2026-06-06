import React, { useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  GET_MARKETPLACE_LISTINGS,
  GET_MY_LISTINGS,
  GET_LISTING,
  GET_SENT_OFFERS,
  CREATE_LISTING,
  DELETE_LISTING,
  SEND_OFFER,
} from '../graphql/operations'
import './Marketplace.css'

const Marketplace = () => {
  const [selectedListing, setSelectedListing] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [activeTab, setActiveTab] = useState('browse')

  const { data: listingsData, loading: listingsLoading } = useQuery(
    GET_MARKETPLACE_LISTINGS,
    { skip: activeTab !== 'browse' }
  )

  const { data: myListingsData, loading: myListingsLoading, refetch: refetchMyListings } =
    useQuery(GET_MY_LISTINGS, { skip: activeTab !== 'mylistings' })

  const { data: offersData, loading: offersLoading, refetch: refetchOffers } =
    useQuery(GET_SENT_OFFERS, { skip: activeTab !== 'myoffers' })

  const [fetchListing] = useLazyQuery(GET_LISTING, {
    onCompleted: (data) => setSelectedListing(data.listing),
  })

  const [createListing] = useMutation(CREATE_LISTING)
  const [deleteListing] = useMutation(DELETE_LISTING)
  const [sendOffer] = useMutation(SEND_OFFER)

  const listings = listingsData?.marketplaceListings || []
  const userListings = myListingsData?.myListings || []
  const offers = offersData?.sentOffers || []

  const handleCreateListing = async () => {
    if (!newTitle || !newPrice) {
      alert('Title and price are required')
      return
    }

    try {
      await createListing({
        variables: {
          title: newTitle,
          description: newDescription || null,
          price: parseFloat(newPrice),
          category: newCategory || null,
        },
      })
      alert('Listing created successfully!')
      setNewTitle('')
      setNewDescription('')
      setNewPrice('')
      setNewCategory('')
      setActiveTab('mylistings')
      refetchMyListings()
    } catch (error) {
      alert(error.message || 'Failed to create listing')
    }
  }

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteListing({ variables: { listingId: String(listingId) } })
        alert('Listing deleted successfully!')
        refetchMyListings()
      } catch (error) {
        alert(error.message || 'Failed to delete listing')
      }
    }
  }

  const handleSendOffer = async () => {
    if (!offerPrice) {
      alert('Offer price is required')
      return
    }

    try {
      await sendOffer({
        variables: {
          listingId: String(selectedListing.id),
          offerPrice: parseFloat(offerPrice),
          message: offerMessage || null,
        },
      })
      alert('Offer sent successfully!')
      setOfferPrice('')
      setOfferMessage('')
      setSelectedListing(null)
      refetchOffers()
    } catch (error) {
      alert(error.message || 'Failed to send offer')
    }
  }

  return (
    <div className="marketplace-container">
      <h1>Marketplace</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Listings
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Listing
        </button>
        <button
          className={`tab ${activeTab === 'mylistings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mylistings')}
        >
          My Listings ({userListings.length})
        </button>
        <button
          className={`tab ${activeTab === 'myoffers' ? 'active' : ''}`}
          onClick={() => setActiveTab('myoffers')}
        >
          My Offers ({offers.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="create-listing-section">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter listing title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter item description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Electronics, Furniture"
              />
            </div>
          </div>

          <button onClick={handleCreateListing}>Create Listing</button>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="browse-listings-section">
          {listingsLoading ? (
            <p>Loading...</p>
          ) : listings.length === 0 ? (
            <p>No listings available</p>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <h3>{listing.title}</h3>
                  <p className="description">{listing.description}</p>
                  <p className="category">{listing.category}</p>
                  <p className="price">${listing.price}</p>
                  <p className="seller">Seller: {listing.username}</p>
                  <button onClick={() => fetchListing({ variables: { id: String(listing.id) } })}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedListing && (
            <div className="listing-detail-modal">
              <div className="modal-content">
                <button className="close-btn" onClick={() => setSelectedListing(null)}>
                  ×
                </button>
                <h2>{selectedListing.title}</h2>
                <p>{selectedListing.description}</p>
                <p className="price">${selectedListing.price}</p>
                <p>Seller: {selectedListing.username}</p>

                <div className="offer-section">
                  <h3>Make an Offer</h3>
                  <div className="form-group">
                    <label>Offer Price</label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Enter your offer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Message (optional)</label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Add a message"
                    />
                  </div>

                  <button onClick={handleSendOffer}>Send Offer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mylistings' && (
        <div className="my-listings-section">
          {myListingsLoading ? (
            <p>Loading...</p>
          ) : userListings.length === 0 ? (
            <p>No listings yet</p>
          ) : (
            <div className="listings-grid">
              {userListings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <h3>{listing.title}</h3>
                  <p className="description">{listing.description}</p>
                  <p className="category">{listing.category}</p>
                  <p className="price">${listing.price}</p>
                  <p className="status">{listing.status}</p>
                  <button onClick={() => handleDeleteListing(listing.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myoffers' && (
        <div className="my-offers-section">
          {offersLoading ? (
            <p>Loading...</p>
          ) : offers.length === 0 ? (
            <p>No offers yet</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <h3>{offer.title}</h3>
                <p>Your Offer: ${offer.offerPrice}</p>
                <p>Listed Price: ${offer.price}</p>
                <p>Status: {offer.status}</p>
                <p>Message: {offer.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Marketplace
