import { useState, useEffect, useRef, useCallback } from 'react';
import './HeroGraphic.css';

// 8-bit Knight sprite (16x16 pixels scaled up)
const KnightSprite = ({ frame, attacking, facingRight }) => (
  <svg
    viewBox="0 0 16 16"
    className={`knight-sprite ${attacking ? 'attacking' : ''}`}
    style={{ transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)' }}
  >
    {/* Helmet */}
    <rect x="5" y="1" width="6" height="3" fill="white"/>
    <rect x="4" y="2" width="1" height="2" fill="white"/>
    <rect x="11" y="2" width="1" height="2" fill="white"/>
    <rect x="6" y="0" width="4" height="1" fill="white"/>
    {/* Visor */}
    <rect x="6" y="3" width="4" height="1" fill="#333"/>
    {/* Body/Armor */}
    <rect x="5" y="4" width="6" height="5" fill="white"/>
    <rect x="4" y="5" width="1" height="3" fill="white"/>
    <rect x="11" y="5" width="1" height="3" fill="white"/>
    {/* Arms */}
    <rect x="3" y="5" width="1" height="4" fill="white"/>
    <rect x="12" y="5" width="1" height="4" fill="white"/>
    {/* Sword arm */}
    {attacking ? (
      <>
        <rect x="13" y="4" width="3" height="1" fill="white"/>
        <rect x="14" y="3" width="2" height="1" fill="#ccc"/>
        <rect x="15" y="1" width="1" height="2" fill="#ccc"/>
      </>
    ) : (
      <>
        <rect x="13" y="6" width="1" height="3" fill="#ccc"/>
        <rect x="13" y="9" width="1" height="1" fill="white"/>
      </>
    )}
    {/* Legs - animate based on frame */}
    {frame % 2 === 0 ? (
      <>
        <rect x="5" y="9" width="2" height="4" fill="white"/>
        <rect x="9" y="9" width="2" height="4" fill="white"/>
        <rect x="5" y="13" width="2" height="2" fill="#888"/>
        <rect x="9" y="13" width="2" height="2" fill="#888"/>
      </>
    ) : (
      <>
        <rect x="6" y="9" width="2" height="4" fill="white"/>
        <rect x="8" y="9" width="2" height="4" fill="white"/>
        <rect x="6" y="13" width="2" height="2" fill="#888"/>
        <rect x="8" y="13" width="2" height="2" fill="#888"/>
      </>
    )}
  </svg>
);

// 8-bit Ghost sprite
const GhostSprite = ({ frame }) => (
  <svg viewBox="0 0 16 16" className="ghost-sprite">
    {/* Body */}
    <rect x="4" y="2" width="8" height="8" fill="white" opacity="0.8"/>
    <rect x="3" y="4" width="1" height="5" fill="white" opacity="0.8"/>
    <rect x="12" y="4" width="1" height="5" fill="white" opacity="0.8"/>
    {/* Eyes */}
    <rect x="5" y="4" width="2" height="2" fill="#333"/>
    <rect x="9" y="4" width="2" height="2" fill="#333"/>
    {/* Wavy bottom - animate */}
    {frame % 2 === 0 ? (
      <>
        <rect x="4" y="10" width="2" height="3" fill="white" opacity="0.8"/>
        <rect x="7" y="10" width="2" height="2" fill="white" opacity="0.8"/>
        <rect x="10" y="10" width="2" height="3" fill="white" opacity="0.8"/>
      </>
    ) : (
      <>
        <rect x="4" y="10" width="2" height="2" fill="white" opacity="0.8"/>
        <rect x="7" y="10" width="2" height="3" fill="white" opacity="0.8"/>
        <rect x="10" y="10" width="2" height="2" fill="white" opacity="0.8"/>
      </>
    )}
  </svg>
);

// 8-bit Skeleton sprite
const SkeletonSprite = ({ frame }) => (
  <svg viewBox="0 0 16 16" className="skeleton-sprite">
    {/* Skull */}
    <rect x="5" y="1" width="6" height="4" fill="white"/>
    <rect x="4" y="2" width="1" height="2" fill="white"/>
    <rect x="11" y="2" width="1" height="2" fill="white"/>
    {/* Eye sockets */}
    <rect x="6" y="2" width="2" height="2" fill="#333"/>
    <rect x="9" y="2" width="2" height="2" fill="#333"/>
    {/* Jaw */}
    <rect x="6" y="5" width="4" height="1" fill="white"/>
    {/* Ribcage */}
    <rect x="7" y="6" width="2" height="1" fill="white"/>
    <rect x="5" y="7" width="6" height="1" fill="white"/>
    <rect x="6" y="8" width="4" height="1" fill="white"/>
    <rect x="5" y="9" width="6" height="1" fill="white"/>
    {/* Arms */}
    <rect x="3" y="7" width="2" height="1" fill="white"/>
    <rect x="11" y="7" width="2" height="1" fill="white"/>
    <rect x="2" y="8" width="1" height="3" fill="white"/>
    <rect x="13" y="8" width="1" height="3" fill="white"/>
    {/* Pelvis */}
    <rect x="6" y="10" width="4" height="1" fill="white"/>
    {/* Legs - animate */}
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

// Death animation sprite
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
        <rect x="7" y="7" width="2" height="2" fill="white" opacity="0.4"/>
      </>
    )}
  </svg>
);

function HeroGraphic({ isLoading }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [motionPos, setMotionPos] = useState({ x: 0, y: 0 });
  const [useMotion, setUseMotion] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [lightningPath, setLightningPath] = useState([]);
  const lightningTimeoutRef = useRef(null);

  // Game state
  const [knight, setKnight] = useState({ x: 50, facingRight: true, frame: 0, attacking: false });
  const [enemies, setEnemies] = useState([]);
  const [deathEffects, setDeathEffects] = useState([]);
  const gameLoopRef = useRef(null);
  const enemySpawnRef = useRef(null);

  // Generate random diagonal lightning path
  const generateLightningPath = useCallback(() => {
    const segments = [];
    const startX = Math.random() * 100;
    const goingRight = Math.random() > 0.5;
    let currentX = startX;
    let currentY = 0;
    const segmentHeight = 100 / (8 + Math.floor(Math.random() * 4));

    while (currentY < 100) {
      const nextY = Math.min(currentY + segmentHeight, 100);
      const drift = (Math.random() - 0.5) * 15 + (goingRight ? 5 : -5);
      const nextX = Math.max(0, Math.min(100, currentX + drift));
      segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });
      currentX = nextX;
      currentY = nextY;
    }
    return segments;
  }, []);

  // Lightning animation every 30 seconds
  useEffect(() => {
    const triggerLightning = () => {
      setLightningPath(generateLightningPath());
      setShowLightning(true);

      lightningTimeoutRef.current = setTimeout(() => {
        setShowLightning(false);
      }, 400);
    };

    const interval = setInterval(triggerLightning, 30000);

    return () => {
      clearInterval(interval);
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
    };
  }, [generateLightningPath]);

  // Game loop for knight movement and combat
  useEffect(() => {
    let knightDirection = 1;
    let frameCount = 0;

    gameLoopRef.current = setInterval(() => {
      frameCount++;

      setKnight(prev => {
        let newX = prev.x + knightDirection * 0.5;
        let newFacingRight = prev.facingRight;

        // Reverse at edges
        if (newX > 90) {
          knightDirection = -1;
          newFacingRight = false;
        } else if (newX < 10) {
          knightDirection = 1;
          newFacingRight = true;
        }

        return {
          ...prev,
          x: newX,
          facingRight: newFacingRight,
          frame: Math.floor(frameCount / 8) % 2,
          attacking: prev.attacking
        };
      });

      // Check for combat
      setEnemies(prevEnemies => {
        const updatedEnemies = [];
        let knightAttacking = false;

        setKnight(prevKnight => {
          prevEnemies.forEach(enemy => {
            const distance = Math.abs(enemy.x - prevKnight.x);
            if (distance < 8) {
              // Knight attacks enemy
              knightAttacking = true;
              setDeathEffects(prev => [...prev, { id: Date.now() + Math.random(), x: enemy.x, frame: 0 }]);
            } else {
              // Move enemy toward knight
              const moveDir = enemy.x < prevKnight.x ? 0.3 : -0.3;
              updatedEnemies.push({ ...enemy, x: enemy.x + moveDir, frame: Math.floor(frameCount / 10) % 2 });
            }
          });
          return { ...prevKnight, attacking: knightAttacking };
        });

        return updatedEnemies;
      });

      // Update death effects
      setDeathEffects(prev =>
        prev.map(d => ({ ...d, frame: d.frame + 1 })).filter(d => d.frame < 5)
      );

    }, 100);

    return () => clearInterval(gameLoopRef.current);
  }, []);

  // Spawn enemies randomly
  useEffect(() => {
    const spawnEnemy = () => {
      const spawnLeft = Math.random() > 0.5;
      const isGhost = Math.random() > 0.5;
      setEnemies(prev => {
        if (prev.length < 3) {
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

    enemySpawnRef.current = setInterval(spawnEnemy, 4000);
    // Spawn first enemy after 2 seconds
    setTimeout(spawnEnemy, 2000);

    return () => clearInterval(enemySpawnRef.current);
  }, []);

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!useMotion) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [useMotion]);

  // Accelerometer/gyroscope handler
  useEffect(() => {
    const handleDeviceOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        setUseMotion(true);
        const x = (e.gamma + 45) / 90;
        const y = (e.beta + 45) / 90;
        setMotionPos({
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y))
        });
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Will be triggered by user interaction elsewhere
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  // Use motion data if available, otherwise use mouse
  const activePos = useMotion ? motionPos : mousePos;

  // Calculate distance from center
  const distX = (activePos.x - 0.5) * 2;
  const distY = (activePos.y - 0.5) * 2;
  const distFromCenter = Math.sqrt(distX * distX + distY * distY) / Math.sqrt(2);

  const blur = 100 + (distFromCenter * 120);
  const scaleX = 1 + (distX * 0.15);
  const scaleY = 1 + (distY * 0.15);
  const offsetX = distX * 100;
  const offsetY = distY * 100;

  // Export motion position for RecordLoader
  useEffect(() => {
    window.moodlistMotion = useMotion ? motionPos : null;
  }, [useMotion, motionPos]);

  return (
    <div className="hero-section">
      {/* Full-page diagonal lightning */}
      {showLightning && (
        <svg className="lightning-bolt-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {lightningPath.map((seg, i) => (
            <g key={i}>
              {/* Main bolt */}
              <line
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="white"
                strokeWidth="0.8"
              />
              {/* Glow effect */}
              <line
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="white"
                strokeWidth="2"
                opacity="0.3"
              />
              {/* Branch occasionally */}
              {Math.random() > 0.7 && (
                <line
                  x1={seg.x2}
                  y1={seg.y2}
                  x2={seg.x2 + (Math.random() - 0.5) * 10}
                  y2={seg.y2 + 5}
                  stroke="white"
                  strokeWidth="0.4"
                  opacity="0.6"
                />
              )}
            </g>
          ))}
        </svg>
      )}

      {/* Interactive gradient orb */}
      <div
        className="hero-orb"
        style={{
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          filter: `blur(${blur}px)`
        }}
      >
        <div
          className="hero-orb-inner"
          style={{
            transform: `scaleX(${scaleX}) scaleY(${scaleY})`
          }}
        />
      </div>

      {/* Main flow: Photo → Logo → Playlist */}
      <div className="hero-flow">
        <div className="flow-item">
          <div className="preview-card">
            <div className="card-image">
              <div className="image-placeholder sunset"></div>
            </div>
          </div>
          <span className="flow-label">Photo</span>
        </div>

        <div className="flow-arrow">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path d="M0 8H28M28 8L20 2M28 8L20 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flow-item">
          <div className="app-icon">
            <span className="app-icon-letter">M</span>
          </div>
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
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
            </div>
          </div>
          <span className="flow-label">Playlist</span>
        </div>
      </div>

      {/* Title below */}
      <div className="hero-text">
        <h1 className={`hero-title ${isLoading ? 'shimmer' : ''}`}>Moodlist</h1>
        <p className="hero-subtitle">Transform photos into playlists</p>
      </div>

      {/* 8-bit Game Area */}
      <div className="game-area">
        {/* Knight */}
        <div
          className="game-character knight"
          style={{ left: `${knight.x}%` }}
        >
          <KnightSprite
            frame={knight.frame}
            attacking={knight.attacking}
            facingRight={knight.facingRight}
          />
        </div>

        {/* Enemies */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="game-character enemy"
            style={{ left: `${enemy.x}%` }}
          >
            {enemy.type === 'ghost' ? (
              <GhostSprite frame={enemy.frame} />
            ) : (
              <SkeletonSprite frame={enemy.frame} />
            )}
          </div>
        ))}

        {/* Death effects */}
        {deathEffects.map(effect => (
          <div
            key={effect.id}
            className="game-character death-effect"
            style={{ left: `${effect.x}%` }}
          >
            <DeathSprite frame={effect.frame} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeroGraphic;
