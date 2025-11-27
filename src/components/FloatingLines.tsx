/**
 * Composant FloatingLines - Lignes ondulantes animées avec Three.js et shaders GLSL
 *
 * Ce composant crée un effet visuel de lignes flottantes animées en utilisant WebGL.
 * Il génère 3 groupes de lignes (top, middle, bottom) avec des effets de vague,
 * rotation, parallaxe et interaction avec la souris.
 *
 * Architecture technique :
 * - Rendu WebGL via Three.js (OrthographicCamera + ShaderMaterial)
 * - Fragment shader GLSL pour le calcul des vagues et couleurs
 * - Vertex shader passthrough simple
 * - Animation 60fps via requestAnimationFrame
 * - Uniforms dynamiques pour contrôle temps réel
 *
 * Performances :
 * - GPU-accelerated (calculs dans le fragment shader)
 * - Pixel ratio limité à 2 pour performances mobiles
 * - ResizeObserver pour ajustement responsive
 * - Cleanup automatique des ressources Three.js
 */
import { useEffect, useRef } from 'react';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
  Vector2,
  Clock
} from 'three';

/**
 * Vertex Shader - Passthrough simple
 *
 * Transforme les coordonnées du mesh (PlaneGeometry 2x2) en clip space.
 * Pas de manipulation des vertices, toute la logique visuelle est dans le fragment shader.
 */
const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Fragment Shader - Génération des lignes ondulantes
 *
 * Ce shader génère dynamiquement des lignes sinusoïdales animées sur GPU.
 *
 * Uniforms principaux :
 * - iTime : Temps écoulé pour l'animation
 * - iResolution : Taille du canvas pour conversion coordonnées
 * - animationSpeed : Multiplicateur de vitesse d'animation
 * - enable{Top|Middle|Bottom} : Active/désactive chaque groupe de lignes
 * - {top|middle|bottom}LineCount : Nombre de lignes par groupe
 * - {top|middle|bottom}LineDistance : Espacement entre les lignes
 * - {top|middle|bottom}WavePosition : Position et rotation (x, y, rotate)
 * - iMouse : Position de la souris pour interaction
 * - interactive : Active l'effet de courbure au survol
 * - bendRadius/bendStrength : Contrôle de l'effet de courbure
 * - parallax/parallaxOffset : Effet de parallaxe au mouvement de la souris
 * - lineGradient : Tableau de couleurs pour dégradé (max 8)
 *
 * Fonctions GLSL :
 * - rotate() : Matrice de rotation 2D
 * - background_color() : Génère un dégradé de fond (PINK -> BLACK -> BLUE)
 * - getLineColor() : Interpole les couleurs du dégradé personnalisé
 * - wave() : Calcule l'intensité d'une ligne sinusoïdale avec effet de courbure
 * - mainImage() : Point d'entrée, compose les 3 groupes de lignes
 */
const fragmentShader = `
precision highp float;

// Uniforms temporels et résolution
uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

// Palette de couleurs par défaut
const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

/**
 * Matrice de rotation 2D
 * @param r - Angle de rotation en radians
 * @return Matrice 2x2 pour rotation des coordonnées UV
 */
mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

/**
 * Génère un dégradé de fond PINK -> BLACK -> BLUE
 * Utilisé uniquement si aucun dégradé personnalisé n'est fourni
 */
vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

/**
 * Calcule la couleur d'une ligne en fonction de sa position dans le groupe
 * Interpole linéairement entre les couleurs du dégradé personnalisé
 *
 * @param t - Position normalisée de la ligne (0.0 = première ligne, 1.0 = dernière ligne)
 * @param baseColor - Couleur de fond par défaut si pas de dégradé
 * @return Couleur RGB interpolée pour cette ligne
 */
vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    // Interpolation linéaire entre les stops du dégradé
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

/**
 * Génère une ligne sinusoïdale avec effet de courbure au survol
 *
 * Calcule l'intensité lumineuse d'une ligne ondulante. L'intensité est inversement
 * proportionnelle à la distance du pixel à la courbe sinusoïdale.
 *
 * @param uv - Coordonnées UV de la ligne (espace local de la ligne)
 * @param offset - Offset de phase de la sinusoïde (pour varier les lignes)
 * @param screenUv - Coordonnées UV à l'écran (pour effet de courbure)
 * @param mouseUv - Position de la souris en UV
 * @param shouldBend - Active l'effet de courbure interactive
 * @return Intensité lumineuse de la ligne (plus proche = plus lumineux)
 */
  float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  // Calcul de la forme sinusoïdale de base
  float x_offset   = offset;
  float x_movement = time * 0.1;  // Déplacement horizontal de la vague
  float amp        = sin(offset + time * 0.2) * 0.3;  // Amplitude variable dans le temps
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  // Effet de courbure interactive au survol de la souris
  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); // Falloff radial autour du curseur
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  // Distance du pixel à la courbe sinusoïdale
  // Plus le pixel est proche de la ligne, plus l'intensité est élevée
  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

/**
 * Point d'entrée du fragment shader
 * Compose les 3 groupes de lignes (top, middle, bottom) avec leurs transformations respectives
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // Normalisation des coordonnées : centre de l'écran = (0,0), hauteur = 2 unités
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;  // Inversion Y pour correspondre aux conventions Three.js

  // Application de l'offset de parallaxe si activé
  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  // Couleur de fond : utilise le dégradé par défaut ou fond noir si dégradé personnalisé
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  // Conversion de la position de la souris en coordonnées UV
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  // Rendu du groupe de lignes du bas
  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);  // Position normalisée pour le dégradé
      vec3 lineCol = getLineColor(t, b);

      // Rotation logarithmique basée sur la distance au centre (effet de perspective)
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,  // Offset de phase unique par ligne
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;  // Intensité réduite pour les lignes du bas
    }
  }

  // Rendu du groupe de lignes du milieu (intensité normale)
  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  // Rendu du groupe de lignes du haut (intensité encore plus réduite)
  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;  // Inversion X pour effet miroir
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;  // Intensité réduite pour les lignes du haut (effet de profondeur)
    }
  }

  fragColor = vec4(col, 1.0);
}

// Entry point GLSL standard
void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

// Limite technique du shader : 8 couleurs maximum dans le dégradé
const MAX_GRADIENT_STOPS = 8;

/**
 * Position et rotation d'un groupe de lignes
 */
type WavePosition = {
  x: number;        // Offset horizontal
  y: number;        // Offset vertical
  rotate: number;   // Facteur de rotation (appliqué logarithmiquement)
};

/**
 * Props du composant FloatingLines
 */
type FloatingLinesProps = {
  linesGradient?: string[];
  enabledWaves?: Array<'top' | 'middle' | 'bottom'>;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];  // Mode de fusion CSS (ex: 'screen', 'multiply')
};

/**
 * Convertit une couleur hexadécimale en vecteur Three.js RGB normalisé [0-1]
 *
 * @param hex - Couleur au format hex : '#RRGGBB', 'RRGGBB', '#RGB', 'RGB'
 * @returns Vector3 avec composantes RGB normalisées entre 0 et 1
 *
 * @example
 * ```typescript
 * hexToVec3('#FF5733')  // Vector3(1.0, 0.34, 0.2)
 * hexToVec3('F57')      // Vector3(1.0, 0.33, 0.47)
 * ```
 */
function hexToVec3(hex: string): Vector3 {
  let value = hex.trim();

  if (value.startsWith('#')) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return new Vector3(r / 255, g / 255, b / 255);
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen'
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetMouseRef = useRef<Vector2>(new Vector2(-1000, -1000));
  const currentMouseRef = useRef<Vector2>(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef<number>(0);
  const currentInfluenceRef = useRef<number>(0);
  const targetParallaxRef = useRef<Vector2>(new Vector2(0, 0));
  const currentParallaxRef = useRef<Vector2>(new Vector2(0, 0));

  /**
   * Helper pour récupérer le nombre de lignes d'un groupe spécifique
   * Gère le cas où lineCount est un nombre unique ou un tableau par groupe
   */
  const getLineCount = (waveType: 'top' | 'middle' | 'bottom'): number => {
    if (typeof lineCount === 'number') return lineCount;
    if (!enabledWaves.includes(waveType)) return 0;
    const index = enabledWaves.indexOf(waveType);
    return lineCount[index] ?? 6;
  };

  /**
   * Helper pour récupérer la distance entre lignes d'un groupe spécifique
   * Gère le cas où lineDistance est un nombre unique ou un tableau par groupe
   */
  const getLineDistance = (waveType: 'top' | 'middle' | 'bottom'): number => {
    if (typeof lineDistance === 'number') return lineDistance;
    if (!enabledWaves.includes(waveType)) return 0.1;
    const index = enabledWaves.indexOf(waveType);
    return lineDistance[index] ?? 0.1;
  };

  const topLineCount = enabledWaves.includes('top') ? getLineCount('top') : 0;
  const middleLineCount = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
  const bottomLineCount = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

  const topLineDistance = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
  const middleLineDistance = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
  const bottomLineDistance = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

  useEffect(() => {
    if (!containerRef.current) return;

    // ==================== INITIALISATION THREE.JS ====================

    const scene = new Scene();

    // Caméra orthographique pour rendu 2D (pas de perspective)
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    // Configuration du renderer WebGL
    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));  // Limite à 2 pour performances
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    // ==================== CONFIGURATION DES UNIFORMS ====================

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },

      enableTop: { value: enabledWaves.includes('top') },
      enableMiddle: { value: enabledWaves.includes('middle') },
      enableBottom: { value: enabledWaves.includes('bottom') },

      topLineCount: { value: topLineCount },
      middleLineCount: { value: middleLineCount },
      bottomLineCount: { value: bottomLineCount },

      topLineDistance: { value: topLineDistance },
      middleLineDistance: { value: middleLineDistance },
      bottomLineDistance: { value: bottomLineDistance },

      topWavePosition: {
        value: new Vector3(topWavePosition?.x ?? 10.0, topWavePosition?.y ?? 0.5, topWavePosition?.rotate ?? -0.4)
      },
      middleWavePosition: {
        value: new Vector3(
          middleWavePosition?.x ?? 5.0,
          middleWavePosition?.y ?? 0.0,
          middleWavePosition?.rotate ?? 0.2
        )
      },
      bottomWavePosition: {
        value: new Vector3(
          bottomWavePosition?.x ?? 2.0,
          bottomWavePosition?.y ?? -0.7,
          bottomWavePosition?.rotate ?? 0.4
        )
      },

      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },

      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },

      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1))
      },
      lineGradientCount: { value: 0 }
    };

    // Configuration du dégradé de couleurs personnalisé
    if (linesGradient && linesGradient.length > 0) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);  // Limite à 8 couleurs
      uniforms.lineGradientCount.value = stops.length;

      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
      });
    }

    // Création du material shader
    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    // Géométrie : PlaneGeometry 2x2 couvrant tout l'écran en coordonnées orthographiques
    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    // ==================== GESTION DU RESIZE ====================

    const setSize = () => {
      const el = containerRef.current!;
      const width = el.clientWidth || 1;
      const height = el.clientHeight || 1;

      renderer.setSize(width, height, false);

      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    // ResizeObserver pour ajustement responsive automatique
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setSize) : null;

    if (ro && containerRef.current) {
      ro.observe(containerRef.current);
    }

    // ==================== EVENT HANDLERS INTERACTION ====================

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();

      // Conversion des coordonnées souris en pixels canvas (prenant en compte le DPR)
      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;  // Active l'effet de courbure

      // Calcul de l'offset de parallaxe basé sur la position de la souris
      if (parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current.set(offsetX * parallaxStrength, offsetY * parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;  // Désactive l'effet de courbure
    };

    // Enregistrement des event listeners si mode interactif activé
    if (interactive) {
      renderer.domElement.addEventListener('pointermove', handlePointerMove);
      renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    }

    // ==================== BOUCLE DE RENDU ====================

    let raf = 0;
    const renderLoop = () => {
      // Mise à jour du temps pour l'animation
      uniforms.iTime.value = clock.getElapsedTime();

      // Interpolation linéaire (lerp) pour des mouvements fluides
      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);

        // Interpolation de l'influence de courbure pour transition douce
        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      // Interpolation de l'offset de parallaxe
      if (parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      // Rendu de la scène
      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // ==================== CLEANUP ====================

    return () => {
      // Arrêt de la boucle d'animation
      cancelAnimationFrame(raf);

      // Déconnexion du ResizeObserver
      if (ro && containerRef.current) {
        ro.disconnect();
      }

      // Suppression des event listeners
      if (interactive) {
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      }

      // Libération des ressources Three.js (critique pour éviter les memory leaks)
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topWavePosition,
    middleWavePosition,
    bottomWavePosition,
    animationSpeed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden floating-lines-container"
      style={{
        mixBlendMode: mixBlendMode
      }}
    />
  );
}
