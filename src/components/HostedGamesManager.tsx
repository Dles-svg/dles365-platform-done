import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Game {
  id: string
  title: string
  description: string
  image_url: string
  genre: string
  executable_path: string
  game_type: string
}

interface HostedGamesManagerProps {
  userId: string
}

export function HostedGamesManager({ userId }: HostedGamesManagerProps) {
  const [availableGames, setAvailableGames] = useState<Game[]>([])
  const [hostedGames, setHostedGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState<string | null>(null)

  useEffect(() => {
    loadGames()
  }, [userId])

  const loadGames = async () => {
    const { data: allGames } = await supabase
      .from('games')
      .select('*')
      .in('game_type', ['local', 'both'])
      .eq('is_active', true)
      .order('title')

    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', userId)

    if (allGames) {
      setAvailableGames(allGames)

      if (userGames) {
        const hostedGameIds = userGames.map(ug => ug.game_id)
        const hosted = allGames.filter(g => hostedGameIds.includes(g.id))
        setHostedGames(hosted)
      }
    }

    setLoading(false)
  }

  const addGameToHosting = async (game: Game) => {
    const { error } = await supabase
      .from('user_games')
      .insert({
        user_id: userId,
        game_id: game.id
      })

    if (!error) {
      setHostedGames([...hostedGames, game])
    }
  }

  const removeGameFromHosting = async (gameId: string) => {
    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)

    if (!error) {
      setHostedGames(hostedGames.filter(g => g.id !== gameId))
    }
  }

  const launchGame = async (game: Game) => {
    setLaunching(game.id)

    if (window.electron) {
      const result = await window.electron.launchGame(game.executable_path)

      if (result.success) {
        console.log('Game launched successfully:', game.title)
      } else {
        alert(`Failed to launch ${game.title}: ${result.error}`)
      }
    } else {
      alert('Game launching is only available in the desktop app')
    }

    setLaunching(null)
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading games...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
          Hosted Games
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Games you are hosting for remote players
        </p>
      </div>

      {hostedGames.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '0.75rem',
          border: '1px dashed #cbd5e1'
        }}>
          <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            No games hosted yet
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Add games from the available games list below
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          {hostedGames.map(game => (
            <div
              key={game.id}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                height: '150px',
                background: `url(${game.image_url}) center/cover`,
                backgroundColor: '#e2e8f0'
              }} />
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {game.title}
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {game.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => launchGame(game)}
                    disabled={launching === game.id}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: launching === game.id
                        ? '#cbd5e1'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      cursor: launching === game.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {launching === game.id ? 'Launching...' : 'Test Launch'}
                  </button>
                  <button
                    onClick={() => removeGameFromHosting(game.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'white',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Available Games
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {availableGames
            .filter(game => !hostedGames.find(h => h.id === game.id))
            .map(game => (
              <div
                key={game.id}
                style={{
                  background: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  padding: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: `url(${game.image_url}) center/cover`,
                    backgroundColor: '#e2e8f0'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {game.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {game.genre}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => addGameToHosting(game)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Add to Hosting
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
