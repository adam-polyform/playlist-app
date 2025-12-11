import { useState, useEffect, useRef, useCallback } from 'react';
import './HeroGraphic.css';

// Improved 8-bit Knight sprite (16x16 pixels)
const KnightSprite = ({ frame, attacking, facingRight, dancing }) => (
  <svg
    viewBox="0 0 16 16"
    className={`knight-sprite ${attacking ? 'attacking' : ''} ${dancing ? 'dancing' : ''}`}
    style={{ transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)' }}
  >
    {/* Plume */}
    <rect x="7" y="0" width="2" height="1" fill="#ff4444"/>
    <rect x="8" y="1" width="1" height="1" fill="#ff4444"/>
    {/* Helmet */}
    <rect x="5" y="1" width="6" height="4" fill="white"/>
    <rect x="4" y="2" width="1" height="3" fill="white"/>
    <rect x="11" y="2" width="1" height="3" fill="white"/>
    {/* Visor slit */}
    <rect x="5" y="3" width="6" height="1" fill="#333"/>
    {/* Helmet shine */}
    <rect x="6" y="2" width="2" height="1" fill="#eee"/>
    {/* Body armor */}
    <rect x="5" y="5" width="6" height="4" fill="white"/>
    <rect x="4" y="6" width="1" height="2" fill="white"/>
    <rect x="11" y="6" width="1" height="2" fill="white"/>
    {/* Chest detail */}
    <rect x="7" y="6" width="2" height="2" fill="#ddd"/>
    {/* Shield arm */}
    <rect x="2" y="5" width="2" height="4" fill="#4488ff"/>
    <rect x="3" y="6" width="1" height="2" fill="#88bbff"/>
    {/* Sword arm */}
    {attacking ? (
      <>
        <rect x="12" y="4" width="4" height="1" fill="#ffdd44"/>
        <rect x="15" y="3" width="1" height="1" fill="#ffdd44"/>
        <rect x="12" y="5" width="1" height="2" fill="white"/>
      </>
    ) : dancing ? (
      <>
        <rect x="12" y="3" width="1" height="3" fill="white"/>
        <rect x="13" y="2" width="1" height="2" fill="#ffdd44"/>
      </>
    ) : (
      <>
        <rect x="12" y="6" width="1" height="3" fill="white"/>
        <rect x="12" y="9" width="1" height="3" fill="#ffdd44"/>
      </>
    )}
    {/* Belt */}
    <rect x="5" y="9" width="6" height="1" fill="#886644"/>
    {/* Legs */}
    {dancing ? (
      frame % 4 < 2 ? (
        <>
          <rect x="4" y="10" width="2" height="4" fill="white"/>
          <rect x="10" y="10" width="2" height="3" fill="white"/>
          <rect x="4" y="14" width="2" height="2" fill="#666"/>
          <rect x="11" y="13" width="2" height="2" fill="#666"/>
        </>
      ) : (
        <>
          <rect x="5" y="10" width="2" height="3" fill="white"/>
          <rect x="9" y="10" width="2" height="4" fill="white"/>
          <rect x="4" y="13" width="2" height="2" fill="#666"/>
          <rect x="9" y="14" width="2" height="2" fill="#666"/>
        </>
      )
    ) : frame % 2 === 0 ? (
      <>
        <rect x="5" y="10" width="2" height="4" fill="white"/>
        <rect x="9" y="10" width="2" height="4" fill="white"/>
        <rect x="5" y="14" width="2" height="2" fill="#666"/>
        <rect x="9" y="14" width="2" height="2" fill="#666"/>
      </>
    ) : (
      <>
        <rect x="6" y="10" width="2" height="4" fill="white"/>
        <rect x="8" y="10" width="2" height="4" fill="white"/>
        <rect x="5" y="14" width="2" height="2" fill="#666"/>
        <rect x="10" y="14" width="2" height="2" fill="#666"/>
      </>
    )}
  </svg>
);

// 8-bit Ghost sprite
const GhostSprite = ({ frame }) => (
  <svg viewBox="0 0 16 16" className="ghost-sprite">
    <rect x="4" y="2" width="8" height="8" fill="white" opacity="0.85"/>
    <rect x="3" y="4" width="1" height="5" fill="white" opacity="0.85"/>
    <rect x="12" y="4" width="1" height="5" fill="white" opacity="0.85"/>
    <rect x="5" y="4" width="2" height="2" fill="#333"/>
    <rect x="9" y="4" width="2" height="2" fill="#333"/>
    <rect x="6" y="7" width="4" height="1" fill="#333"/>
    {frame % 2 === 0 ? (
      <>
        <rect x="4" y="10" width="2" height="3" fill="white" opacity="0.85"/>
        <rect x="7" y="10" width="2" height="2" fill="white" opacity="0.85"/>
        <rect x="10" y="10" width="2" height="3" fill="white" opacity="0.85"/>
      </>
    ) : (
      <>
        <rect x="4" y="10" width="2" height="2" fill="white" opacity="0.85"/>
        <rect x="7" y="10" width="2" height="3" fill="white" opacity="0.85"/>
        <rect x="10" y="10" width="2" height="2" fill="white" opacity="0.85"/>
      </>
    )}
  </svg>
);

// 8-bit Skeleton sprite
const SkeletonSprite = ({ frame }) => (
  <svg viewBox="0 0 16 16" className="skeleton-sprite">
    <rect x="5" y="1" width="6" height="4" fill="white"/>
    <rect x="4" y="2" width="1" height="2" fill="white"/>
    <rect x="11" y="2" width="1" height="2" fill="white"/>
    <rect x="6" y="2" width="2" height="2" fill="#333"/>
    <rect x="9" y="2" width="2" height="2" fill="#333"/>
    <rect x="7" y="4" width="2" height="1" fill="#333"/>
    <rect x="6" y="5" width="4" height="1" fill="white"/>
    <rect x="7" y="6" width="2" height="1" fill="white"/>
    <rect x="5" y="7" width="6" height="1" fill="white"/>
    <rect x="6" y="8" width="4" height="1" fill="white"/>
    <rect x="5" y="9" width="6" height="1" fill="white"/>
    <rect x="3" y="7" width="2" height="1" fill="white"/>
    <rect x="11" y="7" width="2" height="1" fill="white"/>
    <rect x="2" y="8" width="1" height="3" fill="white"/>
    <rect x="13" y="8" width="1" height="3" fill="white"/>
    <rect x="6" y="10" width="4" height="1" fill="white"/>
    {frame % 2 === 0 ? (
      <>
        <rect x="6" y="11" width="1" height="4" fill="white"/>
        <rect x="9" y="11" width="1" height="4" fill="white"/>
      </>
    ) : (
      <>
        <rect x="5" y="11" width="1" height="4" fill="white"/>
        <rect x="10" y="11" width="1" height="4" fill="white"/>
      </>
    )}
  </svg>
);

// Death effect
const DeathSprite = ({ frame }) => (
  <svg viewBox="0 0 16 16" className="death-sprite">
    {frame < 2 && (
      <>
        <rect x="7" y="7" width="2" height="2" fill="white"/>
        <rect x="5" y="5" width="2" height="2" fill="white" opacity="0.8"/>
        <rect x="9" y="5" width="2" height="2" fill="white" opacity="0.8"/>
        <rect x="5" y="9" width="2" height="2" fill="white" opacity="0.8"/>
        <rect x="9" y="9" width="2" height="2" fill="white" opacity="0.8"/>
      </>
    )}
    {frame >= 2 && frame < 4 && (
      <>
        <rect x="3" y="3" width="2" height="2" fill="white" opacity="0.6"/>
        <rect x="11" y="3" width="2" height="2" fill="white" opacity="0.6"/>
        <rect x="3" y="11" width="2" height="2" fill="white" opacity="0.6"/>
        <rect x="11" y="11" width="2" height="2" fill="white" opacity="0.6"/>
      </>
    )}
  </svg>
);

// 8-bit Lightning bolt component
const Lightning8Bit = ({ segments }) => (
  <svg className="lightning-bolt-8bit" viewBox="0 0 100 50" preserveAspectRatio="none">
    {segments.map((seg, i) => (
      <g key={i}>
        {/* Pixelated bolt segments */}
        <rect
          x={seg.x - 1}
          y={seg.y}
          width="2"
          height={seg.height}
          fill="white"
        />
        {/* Glow pixels */}
        <rect
          x={seg.x - 2}
          y={seg.y}
          width="1"
          height={seg.height}
          fill="white"
          opacity="0.4"
        />
        <rect
          x={seg.x + 1}
          y={seg.y}
          width="1"
          height={seg.height}
          fill="white"
          opacity="0.4"
        />
      </g>
    ))}
  </svg>
);

function HeroGraphic({ isLoading }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [motionPos, setMotionPos] = useState({ x: 0, y: 0 });
  const [useMotion, setUseMotion] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [lightningSegments, setLightningSegments] = useState([]);
  const lightningTimeoutRef = useRef(null);

  // Game state
  const [knight, setKnight] = useState({
    x: 50,
    facingRight: true,
    frame: 0,
    attacking: false,
    dancing: false,
    velocity: 0
  });
  const [enemies, setEnemies] = useState([]);
  const [deathEffects, setDeathEffects] = useState([]);
  const [score, setScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);
  const keysPressed = useRef({ left: false, right: false, attack: false });
  const gameLoopRef = useRef(null);
  const enemySpawnRef = useRef(null);

  // Generate 8-bit style lightning
  const generateLightning = useCallback(() => {
    const segments = [];
    let x = 20 + Math.random() * 60;
    let y = 0;
    const direction = Math.random() > 0.5 ? 1 : -1;

    while (y < 50) {
      const segHeight = 3 + Math.random() * 5;
      segments.push({ x, y, height: segHeight });
      y += segHeight;
      x += (Math.random() * 8 - 4 + direction * 3);
      x = Math.max(5, Math.min(95, x));
    }
    return segments;
  }, []);

  // Lightning every 30 seconds
  useEffect(() => {
    const triggerLightning = () => {
      setLightningSegments(generateLightning());
      setShowLightning(true);
      lightningTimeoutRef.current = setTimeout(() => setShowLightning(false), 300);
    };

    const interval = setInterval(triggerLightning, 30000);
    return () => {
      clearInterval(interval);
      if (lightningTimeoutRef.current) clearTimeout(lightningTimeoutRef.current);
    };
  }, [generateLightning]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed.current.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp') keysPressed.current.attack = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed.current.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp') keysPressed.current.attack = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check for milestone (every 500 points)
  useEffect(() => {
    const currentMilestone = Math.floor(score / 500);
    if (currentMilestone > lastMilestone && score > 0) {
      setLastMilestone(currentMilestone);
      // Knight dances
      setKnight(prev => ({ ...prev, dancing: true }));
      // Flash score
      setScoreFlash(true);
      // Kill all enemies
      setEnemies(prev => {
        prev.forEach(e => {
          setDeathEffects(d => [...d, { id: Date.now() + Math.random(), x: e.x, frame: 0 }]);
        });
        return [];
      });
      // Reset after dance
      setTimeout(() => {
        setKnight(prev => ({ ...prev, dancing: false }));
        setScoreFlash(false);
      }, 2000);
    }
  }, [score, lastMilestone]);

  // Game loop
  useEffect(() => {
    let frameCount = 0;

    gameLoopRef.current = setInterval(() => {
      frameCount++;

      // Update knight based on keyboard input
      setKnight(prev => {
        if (prev.dancing) {
          return { ...prev, frame: Math.floor(frameCount / 4) % 4 };
        }

        let newX = prev.x;
        let newFacingRight = prev.facingRight;
        let isAttacking = keysPressed.current.attack;

        if (keysPressed.current.left) {
          newX = Math.max(5, prev.x - 1.5);
          newFacingRight = false;
        }
        if (keysPressed.current.right) {
          newX = Math.min(95, prev.x + 1.5);
          newFacingRight = true;
        }

        return {
          ...prev,
          x: newX,
          facingRight: newFacingRight,
          frame: Math.floor(frameCount / 6) % 2,
          attacking: isAttacking
        };
      });

      // Update enemies - they keep walking toward knight
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          let newX = enemy.x;
          // Move toward center of screen, then patrol
          if (enemy.x < 10) {
            newX = enemy.x + 0.4;
          } else if (enemy.x > 90) {
            newX = enemy.x - 0.4;
          } else {
            // Move toward knight position
            setKnight(k => {
              const dir = enemy.x < k.x ? 0.3 : -0.3;
              newX = enemy.x + dir;
              return k;
            });
          }
          return { ...enemy, x: newX, frame: Math.floor(frameCount / 8) % 2 };
        });
      });

      // Combat check
      setKnight(prevKnight => {
        if (prevKnight.attacking || prevKnight.dancing) {
          setEnemies(prevEnemies => {
            const surviving = [];
            prevEnemies.forEach(enemy => {
              const distance = Math.abs(enemy.x - prevKnight.x);
              if (distance < 10 && (prevKnight.attacking || prevKnight.dancing)) {
                setDeathEffects(prev => [...prev, { id: Date.now() + Math.random(), x: enemy.x, frame: 0 }]);
                if (!prevKnight.dancing) {
                  setScore(s => s + 50);
                }
              } else {
                surviving.push(enemy);
              }
            });
            return surviving;
          });
        }
        return prevKnight;
      });

      // Update death effects
      setDeathEffects(prev =>
        prev.map(d => ({ ...d, frame: d.frame + 1 })).filter(d => d.frame < 5)
      );
    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, []);

  // Spawn enemies
  useEffect(() => {
    const spawnEnemy = () => {
      const spawnLeft = Math.random() > 0.5;
      const isGhost = Math.random() > 0.5;
      setEnemies(prev => {
        if (prev.length < 5) {
          return [...prev, {
            id: Date.now(),
            type: isGhost ? 'ghost' : 'skeleton',
            x: spawnLeft ? -5 : 105,
            frame: 0
          }];
        }
        return prev;
      });
    };

    enemySpawnRef.current = setInterval(spawnEnemy, 3000);
    setTimeout(spawnEnemy, 1000);

    return () => clearInterval(enemySpawnRef.current);
  }, []);

  // Mouse/motion handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!useMotion) {
        setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [useMotion]);

  useEffect(() => {
    const handleDeviceOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        setUseMotion(true);
        setMotionPos({
          x: Math.max(0, Math.min(1, (e.gamma + 45) / 90)),
          y: Math.max(0, Math.min(1, (e.beta + 45) / 90))
        });
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }, []);

  const activePos = useMotion ? motionPos : mousePos;
  const distX = (activePos.x - 0.5) * 2;
  const distY = (activePos.y - 0.5) * 2;
  const distFromCenter = Math.sqrt(distX * distX + distY * distY) / Math.sqrt(2);
  const blur = 100 + (distFromCenter * 120);
  const scaleX = 1 + (distX * 0.15);
  const scaleY = 1 + (distY * 0.15);
  const offsetX = distX * 100;
  const offsetY = distY * 100;

  useEffect(() => {
    window.moodlistMotion = useMotion ? motionPos : null;
  }, [useMotion, motionPos]);

  return (
    <div className="hero-section">
      {/* Score Display */}
      <div className={`game-score ${scoreFlash ? 'flash' : ''}`}>
        <span className="score-label">SCORE</span>
        <span className="score-value">{score.toString().padStart(6, '0')}</span>
      </div>

      {/* 8-bit Lightning */}
      {showLightning && <Lightning8Bit segments={lightningSegments} />}

      {/* Gradient orb */}
      <div
        className="hero-orb"
        style={{
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          filter: `blur(${blur}px)`
        }}
      >
        <div className="hero-orb-inner" style={{ transform: `scaleX(${scaleX}) scaleY(${scaleY})` }} />
      </div>

      {/* Flow diagram */}
      <div className="hero-flow">
        <div className="flow-item">
          <div className="preview-card">
            <div className="card-image"><div className="image-placeholder sunset"></div></div>
          </div>
          <span className="flow-label">Photo</span>
        </div>
        <div className="flow-arrow">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path d="M0 8H28M28 8L20 2M28 8L20 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flow-item">
          <div className="app-icon"><span className="app-icon-letter">M</span></div>
          <span className="flow-label">Moodlist</span>
        </div>
        <div className="flow-arrow">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path d="M0 8H28M28 8L20 2M28 8L20 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flow-item">
          <div className="preview-card">
            <div className="card-tracks">
              <div className="mini-track"><span className="track-dot"></span><div className="track-lines"><span></span><span></span></div></div>
              <div className="mini-track"><span className="track-dot"></span><div className="track-lines"><span></span><span></span></div></div>
              <div className="mini-track"><span className="track-dot"></span><div className="track-lines"><span></span><span></span></div></div>
            </div>
          </div>
          <span className="flow-label">Playlist</span>
        </div>
      </div>

      {/* Title */}
      <div className="hero-text">
        <h1 className={`hero-title ${isLoading ? 'shimmer' : ''}`}>Moodlist</h1>
        <p className="hero-subtitle">Transform photos into playlists</p>
      </div>

      {/* Game Area */}
      <div className="game-area">
        <div className="game-character knight" style={{ left: `${knight.x}%` }}>
          <KnightSprite
            frame={knight.frame}
            attacking={knight.attacking}
            facingRight={knight.facingRight}
            dancing={knight.dancing}
          />
        </div>

        {enemies.map(enemy => (
          <div key={enemy.id} className="game-character enemy" style={{ left: `${enemy.x}%` }}>
            {enemy.type === 'ghost' ? <GhostSprite frame={enemy.frame} /> : <SkeletonSprite frame={enemy.frame} />}
          </div>
        ))}

        {deathEffects.map(effect => (
          <div key={effect.id} className="game-character death-effect" style={{ left: `${effect.x}%` }}>
            <DeathSprite frame={effect.frame} />
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div className="game-controls-hint">
        <span>← → to move</span>
        <span>SPACE to attack</span>
      </div>
    </div>
  );
}

export default HeroGraphic;
