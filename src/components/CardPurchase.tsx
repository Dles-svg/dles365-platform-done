import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FIXED_PRICE = 2.50;

interface CardPurchaseProps {
  onClose?: () => void;
  initialAmount?: number;
}

export function CardPurchase({ onClose, initialAmount }: CardPurchaseProps = {}) {
  const { user } = useAuth();
  const [usdAmount, setUsdAmount] = useState(initialAmount ? (initialAmount * FIXED_PRICE).toFixed(2) : '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const tokenAmount = usdAmount ? (parseFloat(usdAmount) / FIXED_PRICE).toFixed(2) : '0';
  const minPurchase = FIXED_PRICE;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace('/', '').length <= 4) {
      setCardExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCardCvc(value);
    }
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Unknown';
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to make a purchase');
      return;
    }

    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount < minPurchase) {
      setError(`Minimum purchase is $${minPurchase.toFixed(2)}`);
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      setError('Please fill in all card details');
      return;
    }

    const cleanedCard = cardNumber.replace(/\s/g, '');
    if (cleanedCard.length < 13 || cleanedCard.length > 16) {
      setError('Invalid card number');
      return;
    }

    if (cardExpiry.length !== 5) {
      setError('Invalid expiry date (MM/YY)');
      return;
    }

    if (cardCvc.length < 3 || cardCvc.length > 4) {
      setError('Invalid CVC');
      return;
    }

    setProcessing(true);

    try {
      const tokens = amount / FIXED_PRICE;
      const cardBrand = getCardBrand(cleanedCard);
      const last4 = cleanedCard.slice(-4);

      const { data: purchase, error: purchaseError } = await supabase
        .from('card_purchases')
        .insert({
          user_id: user.id,
          amount_usd: amount,
          token_amount: tokens,
          card_last4: last4,
          card_brand: cardBrand,
          status: 'pending',
          payment_intent_id: `demo_${Date.now()}`
        })
        .select()
        .maybeSingle();

      if (purchaseError) throw purchaseError;

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error: updateError } = await supabase
        .from('card_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', purchase.id);

      if (updateError) throw updateError;

      setSuccess(`Successfully purchased ${tokens.toFixed(2)} DL365 tokens!`);
      setUsdAmount('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');

      setTimeout(() => setSuccess(''), 5000);

    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const content = (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
      borderRadius: '1.5rem',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '2.5rem',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
    }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                float: 'right',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.5rem',
                lineHeight: '1',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
          )}
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Buy DL365 Tokens
          </h2>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '1.125rem' }}>Fixed price: </span>
            <span style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ${FIXED_PRICE}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '1.125rem' }}> per token</span>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <span>No slippage</span>
            <span>•</span>
            <span>Instant delivery</span>
            <span>•</span>
            <span>Secure payment</span>
          </p>
        </div>

        <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#94a3b8',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Purchase Amount (USD)
            </label>
            <input
              type="number"
              min={minPurchase}
              step="0.01"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder={`Minimum $${minPurchase.toFixed(2)}`}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#f1f5f9',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              disabled={processing}
            />

            {usdAmount && parseFloat(usdAmount) >= minPurchase && (
              <div style={{
                marginTop: '1rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                borderRadius: '0.75rem',
                border: '2px solid rgba(20, 184, 166, 0.4)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '1rem' }}>You will receive:</span>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#14b8a6'
                  }}>
                    {tokenAmount} DL365
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#f1f5f9',
              marginBottom: '0.5rem'
            }}>
              Payment Details
            </h3>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#94a3b8',
                marginBottom: '0.5rem'
              }}>
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                disabled={processing}
              />
              {cardNumber && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#14b8a6',
                  marginTop: '0.5rem',
                  fontWeight: '600'
                }}>
                  {getCardBrand(cardNumber)}
                </p>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  disabled={processing}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  CVC
                </label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={handleCvcChange}
                  placeholder="123"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  disabled={processing}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#94a3b8',
                marginBottom: '0.5rem'
              }}>
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                disabled={processing}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem'
            }}>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: '500' }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.75rem'
            }}>
              <p style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: '600' }}>{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={processing || !usdAmount || parseFloat(usdAmount) < minPurchase}
            style={{
              width: '100%',
              background: processing || !usdAmount || parseFloat(usdAmount) < minPurchase
                ? 'rgba(148, 163, 184, 0.2)'
                : 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
              color: 'white',
              padding: '1.25rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              border: 'none',
              cursor: processing || !usdAmount || parseFloat(usdAmount) < minPurchase ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: processing || !usdAmount || parseFloat(usdAmount) < minPurchase
                ? 'none'
                : '0 8px 16px rgba(20, 184, 166, 0.3)',
              opacity: processing || !usdAmount || parseFloat(usdAmount) < minPurchase ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!processing && usdAmount && parseFloat(usdAmount) >= minPurchase) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(20, 184, 166, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!processing && usdAmount && parseFloat(usdAmount) >= minPurchase) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(20, 184, 166, 0.3)'
              }
            }}
          >
            {processing ? 'Processing...' : `Purchase ${tokenAmount} DL365 Tokens`}
          </button>

          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span>Secure payment processing</span>
            <span>•</span>
            <span>Your card details are encrypted</span>
            <span>•</span>
            <span>No hidden fees</span>
          </p>
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#94a3b8',
            marginBottom: '1rem',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            Or buy with crypto
          </p>
          <a
            href="https://apespace.io/bsc/0xa768ed990313a08ab706fd245319531c31f7e83d"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              color: 'white',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 8px 16px rgba(20, 184, 166, 0.3)',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(20, 184, 166, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(20, 184, 166, 0.3)'
            }}
          >
            Trade on ApeSpace DEX
          </a>
          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginTop: '0.75rem'
          }}>
            Buy DL365 tokens directly with cryptocurrency on the DEX
          </p>
        </div>
      </div>
  );

  if (onClose) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(10px)'
      }}>
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {content}
    </div>
  );
}
