import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Marketplace.css'

const Marketplace = () => {
  const [listings, setListings] = useState([])
  const [userListings, setUserListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [offers, setOffers] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchListings()
    } else if (activeTab === 'mylistings') {
      fetchUserListings()
    } else if (activeTab === 'myoffers') {
      fetchMyOffers()
    }
  }, [activeTab])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/marketplace/listings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setListings(response.data)
    } catch (error) {
      console.error('Fetch listings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserListings = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/marketplace/listings/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUserListings(response.data)
    } catch (error) {
      console.error('Fetch user listings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyOffers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/marketplace/offers/sent', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setOffers(response.data)
    } catch (error) {
      console.error('Fetch offers error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createListing = async () => {
    if (!newTitle || !newPrice) {
      alert('Title and price are required')
      return
    }

    try {
      await axios.post(
        '/marketplace/listings',
        {
          title: newTitle,
          description: newDescription,
          price: newPrice,
          category: newCategory
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      alert('Listing created successfully!')
      setNewTitle('')
      setNewDescription('')
      setNewPrice('')
      setNewCategory('')
      fetchUserListings()
    } catch (error) {
      console.error('Create listing error:', error)
      alert(error.response?.data?.error || 'Failed to create listing')
    }
  }

  const selectListing = async (listingId) => {
    try {
      const response = await axios.get(`/marketplace/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSelectedListing(response.data)
    } catch (error) {
      console.error('Fetch listing details error:', error)
    }
  }

  const sendOffer = async () => {
    if (!offerPrice) {
      alert('Offer price is required')
      return
    }

    try {
      await axios.post(
        '/marketplace/offers',
        {
          listingId: selectedListing.id,
          offerPrice,
          message: offerMessage
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      alert('Offer sent successfully!')
      setOfferPrice('')
      setOfferMessage('')
      fetchMyOffers()
    } catch (error) {
      console.error('Send offer error:', error)
      alert(error.response?.data?.error || 'Failed to send offer')
    }
  }

  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/marketplace/listings/${listingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        alert('Listing deleted successfully!')
        fetchUserListings()
      } catch (error) {
        console.error('Delete listing error:', error)
        alert(error.response?.data?.error || 'Failed to delete listing')
      }
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

          <button onClick={createListing}>Create Listing</button>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="browse-listings-section">
          {loading ? (
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
                  <button onClick={() => selectListing(listing.id)}>View Details</button>
                </div>
              ))}
            </div>
          )}

          {selectedListing && (
            <div className="listing-detail-modal">
              <div className="modal-content">
                <button
                  className="close-btn"
                  onClick={() => setSelectedListing(null)}
                >
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

                  <button onClick={sendOffer}>Send Offer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mylistings' && (
        <div className="my-listings-section">
          {loading ? (
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
                  <button onClick={() => deleteListing(listing.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myoffers' && (
        <div className="my-offers-section">
          {loading ? (
            <p>Loading...</p>
          ) : offers.length === 0 ? (
            <p>No offers yet</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <h3>{offer.title}</h3>
                <p>Your Offer: ${offer.offer_price}</p>
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
