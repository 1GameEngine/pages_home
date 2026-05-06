import{h as $,i as G,j as et,k as rt,m as it,n as ot,o as z,q as Z,r as ut,s as dt}from"./render-scene-canvas-BEnEARc8.js";class ft{constructor(t){if(this._quadProgram=null,this._sdfProgram=null,this._filterProgram=null,this._blurProgram=null,this._shadowProgram=null,this.gl=t,this.isWebGL2=typeof WebGL2RenderingContext<"u"&&t instanceof WebGL2RenderingContext,this.isWebGL2)this.hasDerivatives=!0;else{const r=t.getExtension("OES_standard_derivatives");this.hasDerivatives=!!r}}get quadProgram(){return this._quadProgram||(this._quadProgram=this.compile(this.quadVertSrc(),this.quadFragSrc())),this._quadProgram}get sdfProgram(){return this._sdfProgram||(this._sdfProgram=this.compile(this.sdfVertSrc(),this.sdfFragSrc())),this._sdfProgram}get filterProgram(){return this._filterProgram||(this._filterProgram=this.compile(this.filterVertSrc(),this.filterFragSrc())),this._filterProgram}get blurProgram(){return this._blurProgram||(this._blurProgram=this.compile(this.filterVertSrc(),this.blurFragSrc())),this._blurProgram}get shadowProgram(){return this._shadowProgram||(this._shadowProgram=this.compile(this.filterVertSrc(),this.shadowFragSrc())),this._shadowProgram}destroy(){const t=this.gl;this._quadProgram&&t.deleteProgram(this._quadProgram),this._sdfProgram&&t.deleteProgram(this._sdfProgram),this._filterProgram&&t.deleteProgram(this._filterProgram),this._blurProgram&&t.deleteProgram(this._blurProgram),this._shadowProgram&&t.deleteProgram(this._shadowProgram)}compile(t,r){const e=this.gl,i=this.compileShader(e.VERTEX_SHADER,t),o=this.compileShader(e.FRAGMENT_SHADER,r),s=e.createProgram();if(!s)throw new Error("[ShaderManager] Failed to create program");if(e.attachShader(s,i),e.attachShader(s,o),e.linkProgram(s),e.deleteShader(i),e.deleteShader(o),!e.getProgramParameter(s,e.LINK_STATUS)){const n=e.getProgramInfoLog(s);throw e.deleteProgram(s),new Error(`[ShaderManager] Program link failed: ${n}`)}return s}compileShader(t,r){const e=this.gl,i=e.createShader(t);if(!i)throw new Error("[ShaderManager] Failed to create shader");if(e.shaderSource(i,r),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS)){const o=e.getShaderInfoLog(i);throw e.deleteShader(i),new Error(`[ShaderManager] Shader compile failed: ${o}`)}return i}quadVertSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

in vec2 a_position;
in vec2 a_texCoord;
in vec4 a_color;
in float a_texIndex;

uniform mat4 u_projection;

out vec2 v_texCoord;
out vec4 v_color;
out float v_texIndex;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
  v_color = a_color;
  v_texIndex = a_texIndex;
}
`:`
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
attribute float a_texIndex;

uniform mat4 u_projection;

varying vec2 v_texCoord;
varying vec4 v_color;
varying float v_texIndex;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
  v_color = a_color;
  v_texIndex = a_texIndex;
}
`}quadFragSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

uniform sampler2D u_textures[8];

in vec2 v_texCoord;
in vec4 v_color;
in float v_texIndex;

out vec4 fragColor;

vec4 sampleTexture(int index, vec2 uv) {
  if (index == 0) return texture(u_textures[0], uv);
  if (index == 1) return texture(u_textures[1], uv);
  if (index == 2) return texture(u_textures[2], uv);
  if (index == 3) return texture(u_textures[3], uv);
  if (index == 4) return texture(u_textures[4], uv);
  if (index == 5) return texture(u_textures[5], uv);
  if (index == 6) return texture(u_textures[6], uv);
  return texture(u_textures[7], uv);
}

void main() {
  int texIdx = int(v_texIndex + 0.5);
  vec4 texColor = sampleTexture(texIdx, v_texCoord);
  // 纹理已通过 UNPACK_PREMULTIPLY_ALPHA_WEBGL 预乘，texColor.rgb = original.rgb * texColor.a
  // 混合方程为 ONE, ONE_MINUS_SRC_ALPHA（预乘混合），要求 fragColor.rgb 也是预乘的
  // 因此：fragColor.rgb = texColor.rgb * v_color.rgb * v_color.a
  //       fragColor.a   = texColor.a * v_color.a
  vec4 c = texColor * v_color;
  fragColor = vec4(c.rgb * v_color.a, c.a);
}
`:`
precision mediump float;

uniform sampler2D u_textures[8];

varying vec2 v_texCoord;
varying vec4 v_color;
varying float v_texIndex;

vec4 sampleTexture(int index, vec2 uv) {
  if (index == 0) return texture2D(u_textures[0], uv);
  if (index == 1) return texture2D(u_textures[1], uv);
  if (index == 2) return texture2D(u_textures[2], uv);
  if (index == 3) return texture2D(u_textures[3], uv);
  if (index == 4) return texture2D(u_textures[4], uv);
  if (index == 5) return texture2D(u_textures[5], uv);
  if (index == 6) return texture2D(u_textures[6], uv);
  return texture2D(u_textures[7], uv);
}

void main() {
  int texIdx = int(v_texIndex + 0.5);
  vec4 texColor = sampleTexture(texIdx, v_texCoord);
  // 纹理已通过 UNPACK_PREMULTIPLY_ALPHA_WEBGL 预乘，texColor.rgb = original.rgb * texColor.a
  // 混合方程为 ONE, ONE_MINUS_SRC_ALPHA（预乘混合），要求 fragColor.rgb 也是预乘的
  // 因此：fragColor.rgb = texColor.rgb * v_color.rgb * v_color.a
  //       fragColor.a   = texColor.a * v_color.a
  vec4 c = texColor * v_color;
  gl_FragColor = vec4(c.rgb * v_color.a, c.a);
}
`}sdfVertSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

// 几何属性
in vec2 a_position;
in vec2 a_localUV;
// 形状属性（每个 Quad 的4个顶点携带相同的实例数据）
in vec2  a_size;
// 阴影扩展：quad 实际大小和 quad 中心相对节点中心的偏移
// 无阴影时：a_quadSize == a_size，a_quadOffset == (0,0)
in vec2  a_quadSize;
in vec2  a_quadOffset;
in float a_shapeType;
in float a_strokeWidth;
in vec4  a_fillColor;
in vec4  a_strokeColor;
in vec4  a_shadowColor;
in vec2  a_shadowOffset;
in float a_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
// a_radii_x = vec4(tl_rx, tr_rx, br_rx, bl_rx)
// a_radii_y = vec4(tl_ry, tr_ry, br_ry, bl_ry)
in vec4  a_radii_x;
in vec4  a_radii_y;

uniform mat4 u_projection;

out vec2  v_localUV;
out vec2  v_size;
out vec2  v_quadSize;
out vec2  v_quadOffset;
out float v_shapeType;
out float v_strokeWidth;
out vec4  v_fillColor;
out vec4  v_strokeColor;
out vec4  v_shadowColor;
out vec2  v_shadowOffset;
out float v_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
// v_radii_x = (tl_rx, tr_rx, br_rx, bl_rx)
// v_radii_y = (tl_ry, tr_ry, br_ry, bl_ry)
out vec4  v_radii_x;
out vec4  v_radii_y;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_localUV     = a_localUV;
  v_size        = a_size;
  v_quadSize    = a_quadSize;
  v_quadOffset  = a_quadOffset;
  v_shapeType   = a_shapeType;
  v_strokeWidth = a_strokeWidth;
  v_fillColor   = a_fillColor;
  v_strokeColor = a_strokeColor;
  v_shadowColor = a_shadowColor;
  v_shadowOffset= a_shadowOffset;
  v_shadowBlur  = a_shadowBlur;
  v_radii_x     = a_radii_x;
  v_radii_y     = a_radii_y;
}
`:`
precision mediump float;

// 几何属性
attribute vec2 a_position;
attribute vec2 a_localUV;
// 形状属性
attribute vec2  a_size;
// 阴影扩展：quad 实际大小和 quad 中心相对节点中心的偏移
attribute vec2  a_quadSize;
attribute vec2  a_quadOffset;
attribute float a_shapeType;
attribute float a_strokeWidth;
attribute vec4  a_fillColor;
attribute vec4  a_strokeColor;
attribute vec4  a_shadowColor;
attribute vec2  a_shadowOffset;
attribute float a_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
// a_radii_x = vec4(tl_rx, tr_rx, br_rx, bl_rx)
// a_radii_y = vec4(tl_ry, tr_ry, br_ry, bl_ry)
attribute vec4  a_radii_x;
attribute vec4  a_radii_y;

uniform mat4 u_projection;

varying vec2  v_localUV;
varying vec2  v_size;
varying vec2  v_quadSize;
varying vec2  v_quadOffset;
varying float v_shapeType;
varying float v_strokeWidth;
varying vec4  v_fillColor;
varying vec4  v_strokeColor;
varying vec4  v_shadowColor;
varying vec2  v_shadowOffset;
varying float v_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
// v_radii_x = (tl_rx, tr_rx, br_rx, bl_rx)
// v_radii_y = (tl_ry, tr_ry, br_ry, bl_ry)
varying vec4  v_radii_x;
varying vec4  v_radii_y;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_localUV     = a_localUV;
  v_size        = a_size;
  v_quadSize    = a_quadSize;
  v_quadOffset  = a_quadOffset;
  v_shapeType   = a_shapeType;
  v_strokeWidth = a_strokeWidth;
  v_fillColor   = a_fillColor;
  v_strokeColor = a_strokeColor;
  v_shadowColor = a_shadowColor;
  v_shadowOffset= a_shadowOffset;
  v_shadowBlur  = a_shadowBlur;
  v_radii_x     = a_radii_x;
  v_radii_y     = a_radii_y;
}
`}sdfFragSrc(){const t=this.isWebGL2?`#version 300 es
`:this.hasDerivatives?`#extension GL_OES_standard_derivatives : enable
`:"",r=this.isWebGL2||this.hasDerivatives?"":`// fwidth 不可用，使用固定值近似（牺牲亚像素抗锯齿）
#define fwidth(x) 1.0
`,e=this.isWebGL2?`in vec2  v_localUV;
in vec2  v_size;
in vec2  v_quadSize;
in vec2  v_quadOffset;
in float v_shapeType;
in float v_strokeWidth;
in vec4  v_fillColor;
in vec4  v_strokeColor;
in vec4  v_shadowColor;
in vec2  v_shadowOffset;
in float v_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
in vec4  v_radii_x;
in vec4  v_radii_y;
out vec4 fragColor;`:`varying vec2  v_localUV;
varying vec2  v_size;
varying vec2  v_quadSize;
varying vec2  v_quadOffset;
varying float v_shapeType;
varying float v_strokeWidth;
varying vec4  v_fillColor;
varying vec4  v_strokeColor;
varying vec4  v_shadowColor;
varying vec2  v_shadowOffset;
varying float v_shadowBlur;
// 椭圆圆角半径：每角 (rx, ry)，顺序：tl, tr, br, bl
varying vec4  v_radii_x;
varying vec4  v_radii_y;`,i=this.isWebGL2?"fragColor":"gl_FragColor";return`${t}precision mediump float;
${r}
${e}
uniform int u_stencilMode;

// ── SDF 函数 ──────────────────────────────────────────────────────────────

float sdRect(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 椭圆圆角矩形 SDF
// b = halfSize，rx_ry = 当前角的椭圆半径 (rx, ry)
// 匹配 Canvas 2D 的 ellipse() 绘制行为：每个角可以有不同的水平/垂直半径
float sdRoundedBoxCorner(vec2 q, vec2 rx_ry) {
  // q = abs(p) - (halfSize - rx_ry)，即相对于圆角椭圆中心的坐标
  // 注意：q 的原点在圆角椭圆的中心，rx_ry 是椭圆的半径
  if (q.x < 0.0 && q.y < 0.0) {
    // 矩形内部区域（直线段内侧）：到最近边的距离（负值）
    return max(q.x, q.y);
  } else if (q.x >= 0.0 && q.y < 0.0) {
    // 水平方向（左/右边）外部：到水平边的距离，需减去 rx
    return q.x - rx_ry.x;
  } else if (q.x < 0.0 && q.y >= 0.0) {
    // 垂直方向（上/下边）外部：到垂直边的距离，需减去 ry
    return q.y - rx_ry.y;
  } else {
    // 椭圆弧区域：使用近似椭圆 SDF
    // (length(q / rx_ry) - 1.0) * min(rx, ry) 是对椭圆 SDF 的近似
    // 精度：在 rx/ry 接近 1 时误差最小，rx/ry 差异大时误差约 1-2px
    vec2 safe_r = max(rx_ry, vec2(0.001));
    return (length(q / safe_r) - 1.0) * min(safe_r.x, safe_r.y);
  }
}

float sdRoundedBoxEllipse(vec2 p, vec2 b, vec4 rx, vec4 ry) {
  // 根据象限选择对应角的椭圆半径
  // shader 坐标系：p.x > 0 为右，p.y > 0 为下（v_localUV y 轴向下）
  // rx/ry 顺序：(tl, tr, br, bl) = (x, y, z, w)
  vec2 r;
  if (p.x > 0.0) {
    r = (p.y > 0.0) ? vec2(rx.z, ry.z) : vec2(rx.y, ry.y); // br 或 tr
  } else {
    r = (p.y > 0.0) ? vec2(rx.w, ry.w) : vec2(rx.x, ry.x); // bl 或 tl
  }
  // q = abs(p) - (halfSize - r)，即相对于圆角椭圆中心的坐标
  vec2 q = abs(p) - (b - r);
  return sdRoundedBoxCorner(q, r);
}

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// 高斯 CDF 近似（Abramowitz & Stegun，最大误差 1.5e-7）
// 与 Canvas 2D shadowBlur（sigma = blur/2）的行为一致
float erfc_approx(float x) {
  float ax = abs(x);
  float t = 1.0 / (1.0 + 0.3275911 * ax);
  float poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  float result = poly * exp(-ax * ax);
  return (x >= 0.0) ? result : 2.0 - result;
}

float shadowBlurApprox(float dist, float blur) {
  float sigma = blur * 0.5;
  // 高斯 CDF：P(X < -dist) = 0.5 * erfc(dist / (sigma * sqrt(2)))
  return 0.5 * erfc_approx(dist / (sigma * 1.41421356 + 0.001));
}

void main() {
  // p：以节点中心为原点的局部坐标
  // v_localUV 在 quad 上，v_quadSize 是 quad 实际大小
  // v_quadOffset = quad中心以节点中心为原点的坐标 = ((expandRight-expandLeft)/2, (expandBottom-expandTop)/2)
  // 以 quad 中心为原点的坐标：q = (v_localUV - 0.5) * v_quadSize
  // 转换到以节点中心为原点：p = q + v_quadOffset
  // 无阴影扩展时：v_quadSize == v_size，v_quadOffset == (0,0)，等价于原始公式
  vec2 p = (v_localUV - 0.5) * v_quadSize + v_quadOffset;
  vec2 halfSize = v_size * 0.5;
  int shapeType = int(v_shapeType + 0.5);

  float dist;
  if (shapeType == 2) {
    float r = min(halfSize.x, halfSize.y);
    dist = sdCircle(p, r);
  } else if (shapeType == 1) {
    dist = sdRoundedBoxEllipse(p, halfSize, v_radii_x, v_radii_y);
  } else {
    dist = sdRect(p, halfSize);
  }

  // 使用固定值 1.0 代替 fwidth，避免三角形边界处 fwidth 返回 NaN 导致白色对角线
  // 同时与 Canvas 2D 的渲染行为更一致（Canvas 没有 fwidth 概念）
  float fw = 1.0;

  vec4 color = vec4(0.0);
  if (v_shadowBlur > 0.0 && v_shadowColor.a > 0.0) {
    vec2 shadowP = p - v_shadowOffset;
    float shadowDist;
    if (shapeType == 2) {
      float r = min(halfSize.x, halfSize.y);
      shadowDist = sdCircle(shadowP, r);
    } else if (shapeType == 1) {
      shadowDist = sdRoundedBoxEllipse(shadowP, halfSize, v_radii_x, v_radii_y);
    } else {
      shadowDist = sdRect(shadowP, halfSize);
    }
    float shadowAlpha = shadowBlurApprox(shadowDist, v_shadowBlur);
    color = v_shadowColor * shadowAlpha;
  }

  // rect 形状使用 step（硬边界，与 Canvas 2D fillRect 对齐）
  // roundedRect / circle 保持 smoothstep 抗锯齿
  float fillAlpha;
  if (shapeType == 0) {
    fillAlpha = step(dist, 0.0);
  } else {
    fillAlpha = 1.0 - smoothstep(-fw, fw, dist);
  }
  // Stencil 写入模式：fillAlpha < 0.5 的 fragment 不写入 Stencil（对齐 Canvas 2D clip 的精确裁剪行为）
  if (u_stencilMode == 1 && fillAlpha < 0.5) { discard; }
  // mix 权重只用 fillAlpha，不乘以 v_fillColor.a，避免半透明颜色的 alpha 被平方
  color = mix(color, v_fillColor, fillAlpha);

  if (v_strokeWidth > 0.0 && v_strokeColor.a > 0.0) {
    // 内边框：step 硬边界，与 Canvas 后端 clip+2x lineWidth 的效果一致
    // stroke 区域为 dist ∈ [−strokeWidth, 0]，区域内 strokeAlpha = 1.0
    float strokeAlpha = step(dist, 0.0) * step(-v_strokeWidth, dist);
    // src-over 合成：模拟 Canvas ctx.stroke() 在 fill 上叠加的行为
    // Canvas: out = fill * (1 - stroke_a) + stroke_rgb * stroke_a
    // WebGL mix 替换会将 color 完全替换为预乘格式的 v_strokeColor，
    // 导致半透明边框丢失 fill 颜色。改用 src-over：
    // out = v_strokeColor + color * (1 - v_strokeColor.a)
    color = v_strokeColor + color * (1.0 - v_strokeColor.a) * strokeAlpha
          + color * (1.0 - strokeAlpha);
  }

  ${i} = color;
}
`}filterVertSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

in vec2 a_position;
in vec2 a_texCoord;

uniform mat4 u_projection;

out vec2 v_texCoord;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`:`
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_projection;

varying vec2 v_texCoord;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`}blurFragSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_delta;  // (radius/w, 0) 或 (0, radius/h)

in vec2 v_texCoord;
out vec4 fragColor;

// 与 glfx 相同的随机函数，用于减少固定采样的条纹感
float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  vec4 color = vec4(0.0);
  float total = 0.0;
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
  for (int t = -30; t <= 30; t++) {
    float percent = (float(t) + offset - 0.5) / 30.0;
    float weight = 1.0 - abs(percent);
    // 注意：不能使用 'sample' 作为变量名（GLSL ES 3.0 中是保留关键字）
    // WebGL FBO 纹理已经是预乘 alpha 格式，直接对预乘 alpha 纹理进行三角形滤波
    vec4 sampleColor = texture(u_texture, v_texCoord + u_delta * percent);
    color += sampleColor * weight;
    total += weight;
  }
  fragColor = color / total;
}
`:`
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_delta;

varying vec2 v_texCoord;

float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  vec4 color = vec4(0.0);
  float total = 0.0;
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
  for (int t = -30; t <= 30; t++) {
    float percent = (float(t) + offset - 0.5) / 30.0;
    float weight = 1.0 - abs(percent);
    // WebGL FBO 纹理已经是预乘 alpha 格式，直接对预乘 alpha 纹理进行三角形滤波
    vec4 sampleColor = texture2D(u_texture, v_texCoord + u_delta * percent);
    color += sampleColor * weight;
    total += weight;
  }
  gl_FragColor = color / total;
}
`}filterFragSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_invert;
uniform float u_grey;
uniform float u_bw;
uniform float u_alpha;

in vec2 v_texCoord;
out vec4 fragColor;

vec4 unpremultiply(vec4 c) {
  if (c.a < 0.0001) return vec4(0.0);
  return vec4(c.rgb / c.a, c.a);
}

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// 与 glfx brightnessContrast 一致：亮度加法
vec3 applyBrightness(vec3 color, float brightness) {
  return color + brightness;
}

// 与 glfx brightnessContrast 一致：contrast>0 用除法，contrast<=0 用乘法
vec3 applyContrast(vec3 color, float contrast) {
  if (contrast > 0.0) {
    return (color - 0.5) / (1.0 - contrast) + 0.5;
  } else {
    return (color - 0.5) * (1.0 + contrast) + 0.5;
  }
}

// 与 glfx hueSaturation(hue=0) 一致：RGB 均值插值
vec3 applySaturation(vec3 color, float saturation) {
  float average = (color.r + color.g + color.b) / 3.0;
  if (saturation > 0.0) {
    return color + (average - color) * (1.0 - 1.0 / (1.001 - saturation));
  } else {
    return color + (average - color) * (-saturation);
  }
}

// 与 glfx grey 一致：BT.601 系数
vec3 applyGrey(vec3 color) {
  float grey = color.r * 0.299 + color.g * 0.578 + color.b * 0.114;
  return vec3(grey);
}

// 与 glfx bw(amount=0) 一致：BT.601 系数，阈值 0.5
vec3 applyBW(vec3 color) {
  float luma = color.r * 0.299 + color.g * 0.578 + color.b * 0.114;
  return vec3(step(0.5, luma));
}

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  vec4 color = unpremultiply(texColor);

  if (u_brightness != 0.0) color.rgb = applyBrightness(color.rgb, u_brightness);
  if (u_contrast != 0.0) color.rgb = applyContrast(color.rgb, u_contrast);
  if (u_saturation != 0.0) color.rgb = applySaturation(color.rgb, u_saturation);
  if (u_grey > 0.5) color.rgb = applyGrey(color.rgb);
  if (u_bw > 0.5) color.rgb = applyBW(color.rgb);
  if (u_invert > 0.5) color.rgb = 1.0 - color.rgb;

  color.a *= u_alpha;
  color = clamp(color, 0.0, 1.0);
  fragColor = premultiply(color);
}
`:`
precision mediump float;

uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_invert;
uniform float u_grey;
uniform float u_bw;
uniform float u_alpha;

varying vec2 v_texCoord;

vec4 unpremultiply(vec4 c) {
  if (c.a < 0.0001) return vec4(0.0);
  return vec4(c.rgb / c.a, c.a);
}

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// 与 glfx brightnessContrast 一致：亮度加法
vec3 applyBrightness(vec3 color, float brightness) {
  return color + brightness;
}

// 与 glfx brightnessContrast 一致：contrast>0 用除法，contrast<=0 用乘法
vec3 applyContrast(vec3 color, float contrast) {
  if (contrast > 0.0) {
    return (color - 0.5) / (1.0 - contrast) + 0.5;
  } else {
    return (color - 0.5) * (1.0 + contrast) + 0.5;
  }
}

// 与 glfx hueSaturation(hue=0) 一致：RGB 均值插值
vec3 applySaturation(vec3 color, float saturation) {
  float average = (color.r + color.g + color.b) / 3.0;
  if (saturation > 0.0) {
    return color + (average - color) * (1.0 - 1.0 / (1.001 - saturation));
  } else {
    return color + (average - color) * (-saturation);
  }
}

// 与 glfx grey 一致：BT.601 系数
vec3 applyGrey(vec3 color) {
  float grey = color.r * 0.299 + color.g * 0.578 + color.b * 0.114;
  return vec3(grey);
}

// 与 glfx bw(amount=0) 一致：BT.601 系数，阈值 0.5
vec3 applyBW(vec3 color) {
  float luma = color.r * 0.299 + color.g * 0.578 + color.b * 0.114;
  return vec3(step(0.5, luma));
}

void main() {
  vec4 texColor = texture2D(u_texture, v_texCoord);
  vec4 color = unpremultiply(texColor);

  if (u_brightness != 0.0) color.rgb = applyBrightness(color.rgb, u_brightness);
  if (u_contrast != 0.0) color.rgb = applyContrast(color.rgb, u_contrast);
  if (u_saturation != 0.0) color.rgb = applySaturation(color.rgb, u_saturation);
  if (u_grey > 0.5) color.rgb = applyGrey(color.rgb);
  if (u_bw > 0.5) color.rgb = applyBW(color.rgb);
  if (u_invert > 0.5) color.rgb = 1.0 - color.rgb;

  color.a *= u_alpha;
  color = clamp(color, 0.0, 1.0);
  gl_FragColor = premultiply(color);
}
`}shadowFragSrc(){return this.isWebGL2?`#version 300 es
precision mediump float;
uniform sampler2D u_texture;
uniform vec4 u_shadowColor;
uniform float u_alpha;
in vec2 v_texCoord;
out vec4 fragColor;
void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  // 取原始 alpha（预乘格式）
  float texAlpha = texColor.a;
  // 输出 = shadowColor * texAlpha * u_alpha（预乘格式）
  float finalAlpha = u_shadowColor.a * texAlpha * u_alpha;
  fragColor = vec4(u_shadowColor.rgb * finalAlpha, finalAlpha);
}
`:`
precision mediump float;
uniform sampler2D u_texture;
uniform vec4 u_shadowColor;
uniform float u_alpha;
varying vec2 v_texCoord;
void main() {
  vec4 texColor = texture2D(u_texture, v_texCoord);
  float texAlpha = texColor.a;
  float finalAlpha = u_shadowColor.a * texAlpha * u_alpha;
  gl_FragColor = vec4(u_shadowColor.rgb * finalAlpha, finalAlpha);
}
`}}class _t{constructor(t){this.cache=new Map,this.gl=t}getOrCreate(t,r,e={}){const i=this.cache.get(t);return i||this.upload(t,r,e)}update(t,r,e={}){return this.delete(t),this.upload(t,r,e)}delete(t){const r=this.cache.get(t);r&&(this.gl.deleteTexture(r),this.cache.delete(t))}get(t){return this.cache.get(t)??null}destroy(){for(const t of this.cache.values())this.gl.deleteTexture(t);this.cache.clear()}upload(t,r,e){const i=this.gl,o=i.createTexture();if(!o)throw new Error("[TextureManager] Failed to create WebGLTexture");i.bindTexture(i.TEXTURE_2D,o),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,r);const s=e.minFilter??i.LINEAR,n=e.magFilter??i.LINEAR;i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,s),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,n);const a=e.wrapS??i.CLAMP_TO_EDGE,l=e.wrapT??i.CLAMP_TO_EDGE;return i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,a),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,l),(a===i.REPEAT||l===i.REPEAT)&&!this.isPowerOf2Source(r)&&(i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)),i.bindTexture(i.TEXTURE_2D,null),this.cache.set(t,o),o}isPowerOf2Source(t){const r=t.naturalWidth??t.width??t.width,e=t.naturalHeight??t.height??t.height;return this.isPowerOf2(r)&&this.isPowerOf2(e)}isPowerOf2(t){return t>0&&(t&t-1)===0}}class gt{constructor(t){this.pool=new Map,this.stack=[],this.nextId=0,this.idMap=new Map,this.mainWidth=1,this.mainHeight=1,this.gl=t}setMainSize(t,r){this.mainWidth=t,this.mainHeight=r}pushFBO(t,r){const e=this.gl,i=this.acquireEntry(t,r);e.bindFramebuffer(e.FRAMEBUFFER,i.fbo),e.viewport(0,0,t,r),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT|e.STENCIL_BUFFER_BIT),this.stack.push(i);const o=this.nextId++;return this.idMap.set(o,i),o}popFBO(){const t=this.gl,r=this.stack.pop();if(!r)throw new Error("[FBOManager] popFBO called on empty stack");if(this.stack.length>0){const e=this.stack[this.stack.length-1];t.bindFramebuffer(t.FRAMEBUFFER,e.fbo),t.viewport(0,0,e.width,e.height)}else t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.mainWidth,this.mainHeight);return r.texture}releaseEntry(t){const r=`${t.width}_${t.height}`;let e=this.pool.get(r);e||(e=[],this.pool.set(r,e)),e.push(t)}get currentFBO(){return this.stack.length>0?this.stack[this.stack.length-1].fbo:null}currentTexture(){if(this.stack.length===0)throw new Error("[FBOManager] currentTexture called on empty stack");return this.stack[this.stack.length-1].texture}destroy(){const t=this.gl,r=e=>{t.deleteFramebuffer(e.fbo),t.deleteTexture(e.texture),t.deleteRenderbuffer(e.stencilRbo)};for(const e of this.pool.values())e.forEach(r);this.stack.forEach(r),this.pool.clear(),this.stack=[],this.idMap.clear()}acquireEntry(t,r){const e=`${t}_${r}`,i=this.pool.get(e);return i&&i.length>0?i.pop():this.createEntry(t,r)}createEntry(t,r){const e=this.gl,i=e.createTexture();if(!i)throw new Error("[FBOManager] Failed to create texture");e.bindTexture(e.TEXTURE_2D,i),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null);const o=e.createRenderbuffer();if(!o)throw new Error("[FBOManager] Failed to create stencil renderbuffer");e.bindRenderbuffer(e.RENDERBUFFER,o),e.renderbufferStorage(e.RENDERBUFFER,e.STENCIL_INDEX8,t,r),e.bindRenderbuffer(e.RENDERBUFFER,null);const s=e.createFramebuffer();if(!s)throw new Error("[FBOManager] Failed to create framebuffer");e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.STENCIL_ATTACHMENT,e.RENDERBUFFER,o);const n=e.checkFramebufferStatus(e.FRAMEBUFFER);if(n!==e.FRAMEBUFFER_COMPLETE)throw new Error(`[FBOManager] Framebuffer incomplete: 0x${n.toString(16)}`);return e.bindFramebuffer(e.FRAMEBUFFER,null),{fbo:s,texture:i,stencilRbo:o,width:t,height:r}}}class pt{constructor(t){this._blendEnabled=!1,this._blendSrcFactor=-1,this._blendDstFactor=-1,this._blendSrcAlpha=-1,this._blendDstAlpha=-1,this._stencilTestEnabled=!1,this._depthTestEnabled=!1,this._currentProgram=null,this._scissorTestEnabled=!1,this.gl=t}reset(){this._blendEnabled=!1,this._blendSrcFactor=-1,this._blendDstFactor=-1,this._blendSrcAlpha=-1,this._blendDstAlpha=-1,this._stencilTestEnabled=!1,this._depthTestEnabled=!1,this._currentProgram=null,this._scissorTestEnabled=!1}initDefaults(){const t=this.gl;this.enableBlend(!0),this.setBlendMode("source-over"),t.disable(t.DEPTH_TEST),this._depthTestEnabled=!1,t.disable(t.CULL_FACE),t.clearColor(0,0,0,0)}enableBlend(t){if(this._blendEnabled===t)return;const r=this.gl;t?r.enable(r.BLEND):r.disable(r.BLEND),this._blendEnabled=t}setBlendMode(t){const r=this.gl;let e,i,o,s;switch(t){case"source-over":default:e=r.ONE,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"multiply":e=r.DST_COLOR,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"screen":e=r.ONE,i=r.ONE_MINUS_SRC_COLOR,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"add":case"lighter":e=r.ONE,i=r.ONE,o=r.ONE,s=r.ONE;break;case"destination-in":e=r.ZERO,i=r.SRC_ALPHA,o=r.ZERO,s=r.SRC_ALPHA;break;case"destination-out":e=r.ZERO,i=r.ONE_MINUS_SRC_ALPHA,o=r.ZERO,s=r.ONE_MINUS_SRC_ALPHA;break;case"source-atop":e=r.DST_ALPHA,i=r.ONE_MINUS_SRC_ALPHA,o=r.DST_ALPHA,s=r.ONE_MINUS_SRC_ALPHA;break;case"destination-over":e=r.ONE_MINUS_DST_ALPHA,i=r.ONE,o=r.ONE_MINUS_DST_ALPHA,s=r.ONE;break;case"xor":e=r.ONE_MINUS_DST_ALPHA,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE_MINUS_DST_ALPHA,s=r.ONE_MINUS_SRC_ALPHA;break}this._blendSrcFactor===e&&this._blendDstFactor===i&&this._blendSrcAlpha===o&&this._blendDstAlpha===s||(r.blendFuncSeparate(e,i,o,s),this._blendSrcFactor=e,this._blendDstFactor=i,this._blendSrcAlpha=o,this._blendDstAlpha=s)}enableStencilTest(t){if(this._stencilTestEnabled===t)return;const r=this.gl;t?r.enable(r.STENCIL_TEST):r.disable(r.STENCIL_TEST),this._stencilTestEnabled=t}useProgram(t){this._currentProgram!==t&&(this.gl.useProgram(t),this._currentProgram=t)}invalidateProgram(){this._currentProgram=null}enableScissorTest(t){if(this._scissorTestEnabled===t)return;const r=this.gl;t?r.enable(r.SCISSOR_TEST):r.disable(r.SCISSOR_TEST),this._scissorTestEnabled=t}}var A=(p=>(p[p.DRAW_QUAD=0]="DRAW_QUAD",p[p.DRAW_SDF_SHAPE=1]="DRAW_SDF_SHAPE",p[p.PUSH_STENCIL=2]="PUSH_STENCIL",p[p.POP_STENCIL=3]="POP_STENCIL",p[p.PUSH_FBO=4]="PUSH_FBO",p[p.POP_FBO=5]="POP_FBO",p[p.SET_BLEND_MODE=6]="SET_BLEND_MODE",p))(A||{});function vt(p,t,r,e,i,o){return new Float32Array([p,t,0,r,e,0,i,o,1])}function tt(p,t){const r=new Float32Array(9);for(let e=0;e<3;e++)for(let i=0;i<3;i++){let o=0;for(let s=0;s<3;s++)o+=p[s*3+i]*t[e*3+s];r[e*3+i]=o}return r}class I{constructor(t,r){this.dirty=!0,this.dashBorderTextureKey=null,this.outBorderTextureKey=null,this._bgImage=null,this._bgTextureKey=null,this.scene=t,this.node=r}prepare(t){this.dirty&&(this.dirty=!1,this._prepareDashBorder(t),this._prepareOutBorder(t),this._prepareBackgroundImage(t))}markDirty(){this.dirty=!0}destroy(){}createOffscreenCanvas(t,r,e){const i=this._getDevicePixelRatio(),o=e??document.createElement("canvas");o.width=Math.ceil(t*i),o.height=Math.ceil(r*i);const s=o.getContext("2d");return s.scale(i,i),{canvas:o,ctx:s,dpr:i}}_getDevicePixelRatio(){const t=this.scene.renderEngine.canvasEl,r=t.offsetWidth;return r>0?t.width/r:window.devicePixelRatio||1}_prepareBackgroundImage(t){var a,l;const r=this.node.json.backgroundImageId;if(!r){this._bgTextureKey&&(t.delete(this._bgTextureKey),this._bgTextureKey=null,this._bgImage=null);return}const e=`bg_${this.node.id}_${r}`;if(this._bgTextureKey===e&&t.get(e))return;const i=this.scene.loadImageForRender(r,this._bgImage??void 0,this.node.id);if(!i){this.dirty=!0;return}if("complete"in i){const u=i,c=this.scene.imageRender.isImageLoading(u);if(!u.complete||c){this.dirty=!0;return}}const{imageWillDraw:o,isImageLoading:s}=this.scene.imageRender.prepareDrawImage(`webgl_bg_${this.node.id}`,i);if(s){this.dirty=!0;return}let n=o;if(o.tagName!=="CANVAS"){const u=o,c=this.scene.imageRender.getImageResMeta(u);if((c==null?void 0:c.mimeTypeFull)==="image/svg+xml"){const h=this.scene.imageRender.getSvgRasterizedCanvas(u);if(!h){this.dirty=!0;return}const f=Math.ceil(this.node.width),g=Math.ceil(this.node.height);if(h.width<f||h.height<g){const _=document.createElement("canvas");_.width=f,_.height=g,(a=_.getContext("2d"))==null||a.drawImage(u,0,0,f,g),n=_}else n=h}else{const h=u.naturalWidth||u.width,f=u.naturalHeight||u.height;if(h>0&&f>0){const g=document.createElement("canvas");g.width=h,g.height=f,(l=g.getContext("2d"))==null||l.drawImage(u,0,0,h,f),n=g}else{this.dirty=!0;return}}}t.getOrCreate(e,n),this._bgImage=i,this._bgTextureKey=e}_prepareDashBorder(t){if(this.node.json.border!=="dash"){this.dashBorderTextureKey=null;return}const e=this.node.borderWidth,i=this.node.json.borderColor;if(!e||!i){this.dashBorderTextureKey=null;return}const o=`dash_border_${this.node.id}`;this.dashBorderTextureKey=o;const s=this.node.width,n=this.node.height,{canvas:a,ctx:l}=this.createOffscreenCanvas(s,n);l.save(),this._doPathByShape(l,s,n),l.clip(),l.strokeStyle=i,l.lineWidth=e*2;const u=this.node.json.borderDashSegments;u&&l.setLineDash(u.split(/[\s,]+/).map(Number).filter(c=>!isNaN(c))),this._doPathByShape(l,s,n),l.stroke(),l.restore(),t.update(o,a)}_prepareOutBorder(t){const r=this.node.json.borderOut;if(r!=="line"&&r!=="dash"){this.outBorderTextureKey=null;return}const e=this.node.borderOutWidth,i=this.node.json.borderOutColor;if(!e||!i){this.outBorderTextureKey=null;return}const o=`out_border_${this.node.id}`;this.outBorderTextureKey=o;const s=this.node.width,n=this.node.height,a=e*2,{canvas:l,ctx:u}=this.createOffscreenCanvas(s+a*2,n+a*2);u.save(),u.translate(a,a),u.beginPath(),this._doPathByShape(u,s,n,!1),u.rect(-a,-a,s+a*2,n+a*2),u.clip("evenodd"),u.strokeStyle=i,u.lineWidth=e*2;const c=this.node.json.borderOutDashSegments;r==="dash"&&c&&u.setLineDash(c.split(/[\s,]+/).map(Number).filter(f=>!isNaN(f)));const h=this.node.json.borderOutLineJoin;h&&(u.lineJoin=h),this._doPathByShape(u,s,n),u.stroke(),u.restore(),t.update(o,l)}_doPathByShape(t,r,e,i=!0){const o=this.node.json.shape;if(t.beginPath(),!o||o==="rect")t.rect(0,0,r,e);else if(o==="circular")t.ellipse(r/2,e/2,r/2,e/2,0,0,Math.PI*2);else if(o==="triangle")t.moveTo(0,e),t.lineTo(r/2,0),t.lineTo(r,e),i&&t.closePath();else if(o.startsWith("polygon")){const s=o.replace(/^polygon\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean).map(n=>({x:parseFloat(n.split(",")[0]),y:parseFloat(n.split(",")[1])})).filter(n=>n.x>=0&&n.x<=100&&n.y>=0&&n.y<=100);if(s.length<3)t.rect(0,0,r,e);else{const n=r/100,a=e/100;t.moveTo(s[0].x*n,s[0].y*a);for(const l of s)t.lineTo(l.x*n,l.y*a);i&&t.closePath()}}else if(o.startsWith("roundedRect")){const s=o.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(s.length===4)try{const n=$({values:s,nodeWidth:r,nodeHeight:e}),a=n.topLeftValue,l=n.topRightValue,u=n.bottomRightValue,c=n.bottomLeftValue;t.moveTo(a,0),t.lineTo(r-l,0),t.arcTo(r,0,r,l,l),t.lineTo(r,e-u),t.arcTo(r,e,r-u,e,u),t.lineTo(c,e),t.arcTo(0,e,0,e-c,c),t.lineTo(0,a),t.arcTo(0,0,a,0,a),i&&t.closePath()}catch{t.rect(0,0,r,e)}else t.rect(0,0,r,e)}else t.rect(0,0,r,e)}}class st extends I{constructor(t,r){super(t,r),this.loadedImage=null,this.textureKey=null}prepare(t){var u;if(!this.dirty)return;if(!this.node.imageUrl){this.textureKey&&(t.delete(this.textureKey),this.textureKey=null),this.dirty=!1;return}const e=this.node.json.imageId;if(!e){this.dirty=!1;return}const i=`img_${this.node.id}_${e}`;if(this.textureKey===i&&t.get(i)){this.dirty=!1;return}const o=this.scene.loadImageForRender(e,this.loadedImage??void 0,this.node.id);if(!o||!("complete"in o)||!o.complete||o.naturalWidth===0)return;const s=this.node.imageFit,n=s==="fit-y-repeat-x"||s==="fit-x-repeat-y";let a=o;if(o.tagName!=="CANVAS"){const c=o,h=this.scene.imageRender.getImageResMeta(c);if((h==null?void 0:h.mimeTypeFull)==="image/svg+xml"){const f=this.scene.imageRender.getSvgRasterizedCanvas(c);if(!f)return;const g=Math.ceil(this.node.width),_=Math.ceil(this.node.height);if(f.width<g||f.height<_){const m=document.createElement("canvas");m.width=g,m.height=_,(u=m.getContext("2d"))==null||u.drawImage(c,0,0,g,_),a=m}else a=f}}const l=a;n?t.getOrCreate(i,l,{wrapS:10497,wrapT:10497}):t.getOrCreate(i,l),this.loadedImage=o,this.textureKey=i,this.dirty=!1}destroy(){this.loadedImage=null,this.textureKey=null}computeUVs(){const t=this.loadedImage;if(!t)return{uvs:new Float32Array([0,0,1,0,1,1,0,1]),drawX:0,drawY:0,drawWidth:this.node.width,drawHeight:this.node.height};const r=this.node.width-this.node.paddingLeft-this.node.paddingRight,e=this.node.height-this.node.paddingTop-this.node.paddingBottom,i=t.naturalWidth??t.width,o=t.naturalHeight??t.height;let s=0,n=0,a=i,l=o;const u=this.node.imageCutArea;if(u){const v=u.split(",");v.length===4&&(s=G(v[0],i)||0,n=G(v[1],o)||0,a=G(v[2],i),isNaN(a)&&(a=i-s),l=G(v[3],o),isNaN(l)&&(l=o-n))}const c=s/i,h=n/o,f=(s+a)/i,g=(n+l)/o;let _=0,m=0,x=r,y=e;const w=this.node.imageFit;if(w==="cover"){const v=Math.max(r/a,e/l);x=v*a,y=v*l}else if(w==="contain"){const v=Math.min(r/a,e/l);x=v*a,y=v*l}else w==="fit-y"||w==="fit-y-repeat-x"?x=e/l*a:(w==="fit-x"||w==="fit-x-repeat-y")&&(y=r/a*l);const T=this.node.imageFitAlignX;T==="center"?_=(r-x)/2:T==="right"&&(_=r-x);const d=this.node.imageFitAlignY;if(d==="center"?m=(e-y)/2:d==="bottom"&&(m=e-y),w==="fit-y-repeat-x"){const v=r/x;return{uvs:new Float32Array([c,h,c+(f-c)*v,h,c+(f-c)*v,g,c,g]),drawX:0,drawY:0,drawWidth:r,drawHeight:y}}else if(w==="fit-x-repeat-y"){const v=e/y;return{uvs:new Float32Array([c,h,f,h,f,h+(g-h)*v,c,h+(g-h)*v]),drawX:0,drawY:0,drawWidth:x,drawHeight:e}}if(w==="cover"||w==="contain"){const v=f-c,E=g-h;let R=c,D=h,C=f,L=g;_<0&&(R=c+-_/x*v),m<0&&(D=h+-m/y*E),_+x>r&&(C=c+(r-_)/x*v),m+y>e&&(L=h+(e-m)/y*E);const F=Math.max(0,_),O=Math.max(0,m),b=Math.min(x+Math.min(0,_),r-F),P=Math.min(y+Math.min(0,m),e-O);return{uvs:new Float32Array([R,D,C,D,C,L,R,L]),drawX:F,drawY:O,drawWidth:b,drawHeight:P}}return{uvs:new Float32Array([c,h,f,h,f,g,c,g]),drawX:_,drawY:m,drawWidth:x,drawHeight:y}}computeNineSliceQuads(t){const r=this.loadedImage;if(!r)return[];const e=t.split(",").map(Number);if(e.length!==4)return[];const[i,o,s,n]=e,a=r.naturalWidth??r.width,l=r.naturalHeight??r.height,u=this.node.width,c=this.node.height,h=i/a,f=(a-s)/a,g=o/l,_=(l-n)/l,m=i,x=u-s,y=o,w=c-n;return[{u0:0,v0:0,u1:h,v1:g,x0:0,y0:0,x1:m,y1:y},{u0:h,v0:0,u1:f,v1:g,x0:m,y0:0,x1:x,y1:y},{u0:f,v0:0,u1:1,v1:g,x0:x,y0:0,x1:u,y1:y},{u0:0,v0:g,u1:h,v1:_,x0:0,y0:y,x1:m,y1:w},{u0:h,v0:g,u1:f,v1:_,x0:m,y0:y,x1:x,y1:w},{u0:f,v0:g,u1:1,v1:_,x0:x,y0:y,x1:u,y1:w},{u0:0,v0:_,u1:h,v1:1,x0:0,y0:w,x1:m,y1:c},{u0:h,v0:_,u1:f,v1:1,x0:m,y0:w,x1:x,y1:c},{u0:f,v0:_,u1:1,v1:1,x0:x,y0:w,x1:u,y1:c}].map(d=>({uvs:new Float32Array([d.u0,d.v0,d.u1,d.v0,d.u1,d.v1,d.u0,d.v1]),drawX:d.x0,drawY:d.y0,drawWidth:d.x1-d.x0,drawHeight:d.y1-d.y0}))}}class at extends I{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastSignature="",this.textureKey=`line_${r.id}`}prepare(t){if(!this.dirty)return;const r=this.node.json.stroke;if(r&&this.isDashStroke(r)){const e=this.computeSignature(r);if(e===this.lastSignature&&t.get(this.textureKey)){this.dirty=!1;return}const i=this.rasterizeDashLine(r);i&&(t.update(this.textureKey,i),this.lastSignature=e)}this.dirty=!1}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}get isDash(){const t=this.node.json.stroke;return this.isDashStroke(t)}get dashTextureKey(){return this.textureKey}isDashStroke(t){return(t==null?void 0:t.style)==="dash"&&!!t.dash&&t.dash.length>0}computeSignature(t){const r=this.node;return[r.width,r.height,t.color,t.style,(t.dash??[]).join(",")].join("|")}rasterizeDashLine(t){const r=this.node,e=t.color;if(!e)return null;const i=Math.max(1,Math.ceil(r.width)),o=Math.max(1,Math.ceil(r.height)),{canvas:s,ctx:n}=this.createOffscreenCanvas(i,o,this.offscreenCanvas);this.offscreenCanvas=s,n.clearRect(0,0,i,o),n.strokeStyle=e,n.lineWidth=i;const a=(t.dash??[]).filter(l=>!isNaN(l)&&l>0);return a.length>0&&n.setLineDash(a),n.beginPath(),n.moveTo(i/2,0),n.lineTo(i/2,o),n.stroke(),n.setLineDash([]),s}}class nt extends I{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastContentSignature="",this.textureKey=`polygon_${r.id}`}prepare(t){if(!this.dirty)return;const r=this.computeContentSignature();if(r===this.lastContentSignature&&t.get(this.textureKey)){this.dirty=!1;return}const e=this.rasterizePolygon();if(!e){this.dirty=!1;return}t.update(this.textureKey,e),this.lastContentSignature=r,this.dirty=!1}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}computeContentSignature(){const t=this.node;return[t.json.shape,t.width,t.height,t.json.backgroundColor,t.json.borderColor,t.json.borderWidth].join("|")}rasterizePolygon(){const t=this.node,r=Math.max(1,Math.ceil(t.width)),e=Math.max(1,Math.ceil(t.height)),i=t.json.shape,{canvas:o,ctx:s}=this.createOffscreenCanvas(r,e,this.offscreenCanvas);if(this.offscreenCanvas=o,s.clearRect(0,0,r,e),s.beginPath(),i==="triangle")s.moveTo(0,e),s.lineTo(r/2,0),s.lineTo(r,e),s.closePath();else if(i.startsWith("polygon")){const u=i.replace(/^polygon\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean).map(c=>{const h=c.split(",");return{x:parseFloat(h[0]),y:parseFloat(h[1])}}).filter(c=>c.x>=0&&c.x<=100&&c.y>=0&&c.y<=100);if(u.length<3)s.rect(0,0,r,e);else{const c=r/100,h=e/100;s.moveTo(u[0].x*c,u[0].y*h);for(const f of u)s.lineTo(f.x*c,f.y*h);s.closePath()}}else s.rect(0,0,r,e);const n=t.json.backgroundColor;n&&(s.fillStyle=n,s.fill());const a=t.json.borderColor,l=t.borderWidth;return a&&l>0&&(s.strokeStyle=a,s.lineWidth=l,s.stroke()),o}}class xt{constructor(){this.commands=[],this.webglNodes=null,this.scaleToFitViewport=1}traverseCanvasBackground(t,r,e,i,o,s){const n=new Float32Array([r,0,0,0,r,0,e*r,i*r,1]),a=new Float32Array([0,0,1,0,1,1,0,1]);return[{type:A.DRAW_QUAD,transform:n,alpha:1,width:o,height:s,textureId:t,uvs:a,color:4294967295}]}traverse(t,r,e=1,i=0,o=0){this.commands=[],this.webglNodes=r??null,this.scaleToFitViewport=e;const s=new Float32Array([e,0,0,0,e,0,i*e,o*e,1]),n=t.some(l=>{if(l.hidden||l.alpha<=0)return!1;const u=l.json["render.compositeMode"];return u&&u!=="source-over"}),a=new Float32Array([1,0,0,0,1,0,0,0,1]);n&&this.commands.push({type:A.PUSH_FBO,transform:a,alpha:1,width:0,height:0,compositeMode:"source-over"});for(const l of t)this.traverseNode(l,s,1);return n&&this.commands.push({type:A.POP_FBO,transform:a,alpha:1,width:0,height:0,compositeMode:"source-over"}),this.commands}traverseNode(t,r,e){if(t.hidden||t.alpha<=0)return;const i=this.buildLocalTransform(t),o=tt(r,i),s=e*t.alpha,n=this.shouldUseFBO(t),a=this.extractFilterParams(t);n&&this.commands.push({type:A.PUSH_FBO,transform:o,alpha:s,width:t.width,height:t.height,compositeMode:t.json["render.compositeMode"]??"source-over",filterParams:a??void 0});const l=n?1:s,u=!t.overflowVisible&&this.hasOverflowContent(t);u&&this.commands.push(this.buildStencilCommand(t,o,l,"push")),this.emitNodeDrawCommands(t,o,l);const c=t.childNodesSortByZIndex;if(c&&c.length>0)for(const h of c)this.traverseNode(h,o,l);u&&this.commands.push(this.buildStencilCommand(t,o,l,"pop")),n&&this.commands.push({type:A.POP_FBO,transform:o,alpha:s,width:t.width,height:t.height,compositeMode:t.json["render.compositeMode"]??"source-over",filterParams:a??void 0})}buildLocalTransform(t){let r=new Float32Array([1,0,0,0,1,0,t.x,t.y,1]);const e=t.json.transform;if(e){const i=vt(e.a,e.b,e.c,e.d,e.e,e.f);r=tt(r,i)}return r}shouldUseFBO(t){var e;if(t.alpha<1&&((e=t.childNodesSortByZIndex)==null?void 0:e.length)>0)return!0;const r=t.json["render.compositeMode"];return!!(r&&r!=="source-over"||t.json.contentShadowColor&&t.json.contentShadowBlur||this.extractFilterParams(t))}extractFilterParams(t){const r=t.json["render.brightness"],e=t.json["render.contrast"],i=t.json["render.saturation"],o=t.json["render.invert"],s=t.json["render.grey"],n=t.json["render.bw"],a=t.json["render.blurRadius"],l=t.json.contentShadowColor,u=t.json.contentShadowBlur,c=t.json.contentShadowOffset,h=r!=null||e!=null||i!=null||o||s||n||a!=null,f=l&&u;if(h||f){const g={brightness:r??0,contrast:e??0,saturation:i??0,invert:!!o,grey:!!s,bw:!!n,blurRadius:a!=null?a*this.scaleToFitViewport:void 0};return f&&(g.contentShadowColor=l,g.contentShadowBlur=u*this.scaleToFitViewport,c&&(g.contentShadowOffset=c)),g}return null}hasOverflowContent(t){var r;return(((r=t.childNodesSortByZIndex)==null?void 0:r.length)??0)>0}buildStencilCommand(t,r,e,i){const o=t.json.shape;let s="rect",n;if(o==="circular")s="circle";else if(o!=null&&o.startsWith("roundedRect")){s="roundedRect";const a=o.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(a.length===4){const l=$({values:a,nodeWidth:t.width,nodeHeight:t.height});n=new Float32Array([l.topLeftValue,l.leftTopValue,l.topRightValue,l.rightTopValue,l.bottomRightValue,l.rightBottomValue,l.bottomLeftValue,l.leftBottomValue])}}return{type:i==="push"?A.PUSH_STENCIL:A.POP_STENCIL,transform:r,alpha:e,width:t.width,height:t.height,shapeType:s,shapeParams:n}}emitNodeDrawCommands(t,r,e){this.emitBackground(t,r,e),t instanceof et?this.emitImageNode(t,r,e):t instanceof rt?this.emitLineNode(t,r,e):t instanceof it?this.emitTextNode(t,r,e):t instanceof ot?this.emitEmbedSceneNode(t,r,e):t instanceof z&&this.emitDrawNode(t,r,e),this.emitForeground(t,r,e)}emitDrawNode(t,r,e){for(const i of t.drawDataNodesSortByZIndex)this.traverseNode(i,r,e)}emitBackground(t,r,e){var l,u;const i=t.json.backgroundColor,o=t.json.backgroundImageId,s=t.json.shape,n=s==="triangle"||!!s&&s.startsWith("polygon");if(n){const c=(l=this.webglNodes)==null?void 0:l.get(t);c instanceof nt&&this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:c.textureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),o&&this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:`bg_${t.id}_${o}`,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});return}if(i){const c=k(i,e);c&&this.commands.push({type:A.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:this.getNodeShapeType(t),shapeParams:this.getNodeShapeParams(t),fillColor:c,strokeColor:this.getStrokeColor(t,e),strokeWidth:t.borderWidth,shadowColor:this.getShadowColor(t,e),shadowOffset:this.getShadowOffset(t),shadowBlur:this.getShadowBlur(t)})}else if(t.json.shape&&t.json.shape!=="rect"){const c=t.borderWidth>0&&!!t.json.borderColor,h=!!t.json.shapeShadowColor&&!!t.json.shapeShadowBlur;(c||h)&&this.commands.push({type:A.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:this.getNodeShapeType(t),shapeParams:this.getNodeShapeParams(t),fillColor:new Float32Array([0,0,0,0]),strokeColor:this.getStrokeColor(t,e),strokeWidth:t.borderWidth,shadowColor:this.getShadowColor(t,e),shadowOffset:this.getShadowOffset(t),shadowBlur:this.getShadowBlur(t)})}if(o){const c=`bg_${t.id}_${o}`,h=t.json.shape,f=h&&h!=="rect"&&!n;f&&this.commands.push(this.buildStencilCommand(t,r,e,"push")),this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:c,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),f&&this.commands.push(this.buildStencilCommand(t,r,e,"pop"))}const a=(u=this.webglNodes)==null?void 0:u.get(t);if(a!=null&&a.dashBorderTextureKey&&this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:a.dashBorderTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),a!=null&&a.outBorderTextureKey){const h=(t.borderOutWidth??0)*2,f=Y(r,-h,-h);this.commands.push({type:A.DRAW_QUAD,transform:f,alpha:e,width:t.width+h*2,height:t.height+h*2,textureId:a.outBorderTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}}emitForeground(t,r,e){const i=t.json.foregroundColor;if(i){const s=k(i,e);s&&this.commands.push({type:A.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:"rect",fillColor:s})}const o=t.json.foregroundImageId;if(o){const s=`fg_${t.id}_${o}`;this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:s,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}}emitImageNode(t,r,e){var l;const i=t.json.imageId;if(!i)return;const o=`img_${t.id}_${i}`,s=t.json.nineSlice,n=(l=this.webglNodes)==null?void 0:l.get(t),a=n instanceof st?n:null;if(s&&a){const u=a.computeNineSliceQuads(s);for(const c of u){if(c.drawWidth<=0||c.drawHeight<=0)continue;const h=Y(r,c.drawX,c.drawY);this.commands.push({type:A.DRAW_QUAD,transform:h,alpha:e,width:c.drawWidth,height:c.drawHeight,textureId:o,uvs:c.uvs,color:4294967295})}}else if(s)this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:o,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});else if(a){const{uvs:u,drawX:c,drawY:h,drawWidth:f,drawHeight:g}=a.computeUVs(),_=t.paddingLeft??0,m=t.paddingTop??0,x=_+c,y=m+h,w=x!==0||y!==0?Y(r,x,y):r;this.commands.push({type:A.DRAW_QUAD,transform:w,alpha:e,width:f,height:g,textureId:o,uvs:u,color:4294967295})}else this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:o,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}emitLineNode(t,r,e){var a;const i=t.json.stroke,o=i==null?void 0:i.color;if(!o)return;const s=(a=this.webglNodes)==null?void 0:a.get(t),n=s instanceof at?s:null;if(n!=null&&n.isDash)this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:n.dashTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});else{const l=k(o,e);if(!l)return;this.commands.push({type:A.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:"rect",fillColor:l})}}emitTextNode(t,r,e){const i=`text_${t.id}`;this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:i,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}emitEmbedSceneNode(t,r,e){const i=`embed_${t.id}`;this.commands.push({type:A.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:i,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}getNodeShapeType(t){const r=t.json.shape;return r==="circular"?"circle":r!=null&&r.startsWith("roundedRect")?"roundedRect":"rect"}getNodeShapeParams(t){const r=t.json.shape;if(r!=null&&r.startsWith("roundedRect")){const e=r.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(e.length===4)try{const i=$({values:e,nodeWidth:t.width,nodeHeight:t.height});return new Float32Array([i.topLeftValue,i.leftTopValue,i.topRightValue,i.rightTopValue,i.bottomRightValue,i.rightBottomValue,i.bottomLeftValue,i.leftBottomValue])}catch{return}}}getStrokeColor(t,r){if(t.borderWidth<=0||t.json.border==="dash")return;const e=t.json.borderColor;if(e)return k(e,r)??void 0}getShadowColor(t,r){const e=t.json.shapeShadowColor;if(e)return k(e,r)??void 0}getShadowOffset(t){const r=t.json.shapeShadowOffset;if(!r)return;const e=String(r).split(",");if(e.length>=2)return new Float32Array([parseFloat(e[0])||0,parseFloat(e[1])||0])}getShadowBlur(t){const r=t.json.shapeShadowBlur;if(r!=null)return typeof r=="number"?r:parseFloat(String(r))||0}}function k(p,t){try{const r=Z(p);if(!r)return null;const e=r.r/255,i=r.g/255,o=r.b/255,s=(r.a??1)*t;return new Float32Array([e*s,i*s,o*s,s])}catch{return null}}function Y(p,t,r){const e=new Float32Array(9);return e[0]=p[0],e[1]=p[1],e[2]=p[2],e[3]=p[3],e[4]=p[4],e[5]=p[5],e[6]=p[0]*t+p[3]*r+p[6],e[7]=p[1]*t+p[4]*r+p[7],e[8]=p[2]*t+p[5]*r+p[8],e}const V=6,q=4,K=6,X=4096,Q=8;class bt{constructor(t,r){this.currentQuadCount=0,this.activeTextures=new Array(Q).fill(null),this.activeTextureCount=0,this.gl=t,this.program=r;const e=X*q,i=new ArrayBuffer(e*V*4);this.vertexData=new Float32Array(i),this.uint32View=new Uint32Array(i),this.indexData=new Uint16Array(X*K);for(let n=0;n<X;n++){const a=n*K,l=n*q;this.indexData[a+0]=l,this.indexData[a+1]=l+1,this.indexData[a+2]=l+2,this.indexData[a+3]=l,this.indexData[a+4]=l+2,this.indexData[a+5]=l+3}const o=t.createBuffer(),s=t.createBuffer();if(!o||!s)throw new Error("[SpriteBatcher] Failed to create GPU buffers");this.glVertexBuffer=o,this.glIndexBuffer=s,t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,s),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indexData,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,this.vertexData.byteLength,t.DYNAMIC_DRAW),this.attribPosition=t.getAttribLocation(r,"a_position"),this.attribTexCoord=t.getAttribLocation(r,"a_texCoord"),this.attribColor=t.getAttribLocation(r,"a_color"),this.attribTexIndex=t.getAttribLocation(r,"a_texIndex"),this.uProjection=t.getUniformLocation(r,"u_projection"),this.uTextures=t.getUniformLocation(r,"u_textures")}setProjection(t){const r=this.gl;r.useProgram(this.program),r.uniformMatrix4fv(this.uProjection,!1,t)}pushQuad(t,r){this.currentQuadCount>=X&&this.flush();let e=0;if(r!==null){const _=this.activeTextures.indexOf(r);_>=0?e=_:(this.activeTextureCount>=Q&&this.flush(),e=this.activeTextureCount,this.activeTextures[e]=r,this.activeTextureCount++)}const i=t.transform,o=t.width,s=t.height,n=[0,o,o,0],a=[0,0,s,s],l=t.uvs??new Float32Array([0,0,1,0,1,1,0,1]),u=t.color??4294967295,c=Math.round(t.alpha*255),h=u&16777215|c<<24,f=this.currentQuadCount*q,g=V;for(let _=0;_<4;_++){const m=n[_],x=a[_],y=i[0]*m+i[3]*x+i[6],w=i[1]*m+i[4]*x+i[7],T=(f+_)*g;this.vertexData[T+0]=y,this.vertexData[T+1]=w,this.vertexData[T+2]=l[_*2],this.vertexData[T+3]=l[_*2+1],this.uint32View[T+4]=h,this.vertexData[T+5]=e}this.currentQuadCount++}flush(){if(this.currentQuadCount===0)return;const t=this.gl;t.useProgram(this.program);for(let e=0;e<this.activeTextureCount;e++)t.activeTexture(t.TEXTURE0+e),t.bindTexture(t.TEXTURE_2D,this.activeTextures[e]);if(this.uTextures){const e=Array.from({length:Q},(i,o)=>o);t.uniform1iv(this.uTextures,e)}this.currentQuadCount*q*V*4,t.bindBuffer(t.ARRAY_BUFFER,this.glVertexBuffer),t.bufferSubData(t.ARRAY_BUFFER,0,this.vertexData.subarray(0,this.currentQuadCount*q*V));const r=V*4;t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.glIndexBuffer),this.attribPosition>=0&&(t.enableVertexAttribArray(this.attribPosition),t.vertexAttribPointer(this.attribPosition,2,t.FLOAT,!1,r,0)),this.attribTexCoord>=0&&(t.enableVertexAttribArray(this.attribTexCoord),t.vertexAttribPointer(this.attribTexCoord,2,t.FLOAT,!1,r,8)),this.attribColor>=0&&(t.enableVertexAttribArray(this.attribColor),t.vertexAttribPointer(this.attribColor,4,t.UNSIGNED_BYTE,!0,r,16)),this.attribTexIndex>=0&&(t.enableVertexAttribArray(this.attribTexIndex),t.vertexAttribPointer(this.attribTexIndex,1,t.FLOAT,!1,r,20)),t.drawElements(t.TRIANGLES,this.currentQuadCount*K,t.UNSIGNED_SHORT,0),this.currentQuadCount=0,this.activeTextureCount=0,this.activeTextures.fill(null)}destroy(){this.gl.deleteBuffer(this.glVertexBuffer),this.gl.deleteBuffer(this.glIndexBuffer)}}const B=class B{constructor(t,r){this.quadCount=0,this.flushCount=0,this.totalQuads=0,this.projectionMatrix=new Float32Array(16),this.projectionDirty=!0,this.stencilMode=0,this.gl=t,this.program=r;const e=B.MAX_QUADS*B.VERTS_PER_QUAD;this.vertexData=new Float32Array(e*B.FLOATS_PER_VERTEX);const i=t.createBuffer();if(!i)throw new Error("[SDFBatcher] Failed to create VBO");this.vbo=i,t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,this.vertexData.byteLength,t.DYNAMIC_DRAW);const o=t.createBuffer();if(!o)throw new Error("[SDFBatcher] Failed to create IBO");this.ibo=o;const s=new Uint16Array(B.MAX_QUADS*B.INDICES_PER_QUAD);for(let n=0;n<B.MAX_QUADS;n++){const a=n*4,l=n*6;s[l+0]=a+0,s[l+1]=a+1,s[l+2]=a+2,s[l+3]=a+0,s[l+4]=a+2,s[l+5]=a+3}t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,o),t.bufferData(t.ELEMENT_ARRAY_BUFFER,s,t.STATIC_DRAW),this.loc={a_position:t.getAttribLocation(r,"a_position"),a_localUV:t.getAttribLocation(r,"a_localUV"),a_size:t.getAttribLocation(r,"a_size"),a_quadSize:t.getAttribLocation(r,"a_quadSize"),a_quadOffset:t.getAttribLocation(r,"a_quadOffset"),a_shapeType:t.getAttribLocation(r,"a_shapeType"),a_strokeWidth:t.getAttribLocation(r,"a_strokeWidth"),a_fillColor:t.getAttribLocation(r,"a_fillColor"),a_strokeColor:t.getAttribLocation(r,"a_strokeColor"),a_shadowColor:t.getAttribLocation(r,"a_shadowColor"),a_shadowOffset:t.getAttribLocation(r,"a_shadowOffset"),a_shadowBlur:t.getAttribLocation(r,"a_shadowBlur"),a_radii_x:t.getAttribLocation(r,"a_radii_x"),a_radii_y:t.getAttribLocation(r,"a_radii_y"),u_projection:t.getUniformLocation(r,"u_projection"),u_stencilMode:t.getUniformLocation(r,"u_stencilMode")}}resetStats(){this.flushCount=0,this.totalQuads=0}setStencilMode(t){this.stencilMode=t}setProjection(t){this.projectionMatrix.set(t),this.projectionDirty=!0}push(t){this.quadCount>=B.MAX_QUADS&&this.flush();const r=t.transform,e=t.width,i=t.height,s={rect:0,roundedRect:1,circle:2}[t.shapeType??"rect"]??0,n=t.shapeParams??B.ZERO_VEC8,a=t.fillColor??B.ZERO_VEC4,l=t.strokeColor??B.ZERO_VEC4,u=t.strokeWidth??0,c=t.shadowColor??B.ZERO_VEC4,h=t.shadowOffset??B.ZERO_VEC2,f=t.shadowBlur??0,g=f>0&&c[3]>0;let _=0,m=0,x=0,y=0;if(g){const M=f*3;_=Math.max(0,-h[0])+M,m=Math.max(0,h[0])+M,x=Math.max(0,-h[1])+M,y=Math.max(0,h[1])+M}const w=e+_+m,T=i+x+y,d=(m-_)/2,v=(y-x)/2,E=-_,R=-x,D=[E,E+w,E+w,E],C=[R,R,R+T,R+T],L=D.map((M,S)=>[r[0]*M+r[3]*C[S]+r[6],r[1]*M+r[4]*C[S]+r[7]]),F=B.FLOATS_PER_VERTEX,O=this.quadCount*B.VERTS_PER_QUAD*F,b=this.vertexData,P=[[0,0],[1,0],[1,1],[0,1]],U=n[0],N=n[1],W=n[2],j=n[3],H=n[4],lt=n[5],ht=n[6],ct=n[7];for(let M=0;M<4;M++){const S=O+M*F;b[S+0]=L[M][0],b[S+1]=L[M][1],b[S+2]=P[M][0],b[S+3]=P[M][1],b[S+4]=e,b[S+5]=i,b[S+6]=w,b[S+7]=T,b[S+8]=d,b[S+9]=v,b[S+10]=s,b[S+11]=u,b[S+12]=a[0],b[S+13]=a[1],b[S+14]=a[2],b[S+15]=a[3],b[S+16]=l[0],b[S+17]=l[1],b[S+18]=l[2],b[S+19]=l[3],b[S+20]=c[0],b[S+21]=c[1],b[S+22]=c[2],b[S+23]=c[3],b[S+24]=h[0],b[S+25]=h[1],b[S+26]=f,b[S+27]=U,b[S+28]=W,b[S+29]=H,b[S+30]=ht,b[S+31]=N,b[S+32]=j,b[S+33]=lt,b[S+34]=ct}this.quadCount++}flush(){if(this.quadCount===0)return;const t=this.gl;t.useProgram(this.program),this.projectionDirty&&(t.uniformMatrix4fv(this.loc.u_projection,!1,this.projectionMatrix),this.projectionDirty=!1),t.uniform1i(this.loc.u_stencilMode,this.stencilMode);const e=this.quadCount*B.VERTS_PER_QUAD*B.FLOATS_PER_VERTEX;t.bindBuffer(t.ARRAY_BUFFER,this.vbo),t.bufferSubData(t.ARRAY_BUFFER,0,this.vertexData.subarray(0,e)),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.ibo);const i=B.FLOATS_PER_VERTEX*4;this.setAttrib(this.loc.a_position,2,i,0),this.setAttrib(this.loc.a_localUV,2,i,8),this.setAttrib(this.loc.a_size,2,i,16),this.setAttrib(this.loc.a_quadSize,2,i,24),this.setAttrib(this.loc.a_quadOffset,2,i,32),this.setAttrib(this.loc.a_shapeType,1,i,40),this.setAttrib(this.loc.a_strokeWidth,1,i,44),this.setAttrib(this.loc.a_fillColor,4,i,48),this.setAttrib(this.loc.a_strokeColor,4,i,64),this.setAttrib(this.loc.a_shadowColor,4,i,80),this.setAttrib(this.loc.a_shadowOffset,2,i,96),this.setAttrib(this.loc.a_shadowBlur,1,i,104),this.setAttrib(this.loc.a_radii_x,4,i,108),this.setAttrib(this.loc.a_radii_y,4,i,124),t.drawElements(t.TRIANGLES,this.quadCount*B.INDICES_PER_QUAD,t.UNSIGNED_SHORT,0),this.flushCount++,this.quadCount=0}destroy(){this.gl.deleteBuffer(this.vbo),this.gl.deleteBuffer(this.ibo)}setAttrib(t,r,e,i){t<0||(this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,r,this.gl.FLOAT,!1,e,i))}};B.MAX_QUADS=4096,B.FLOATS_PER_VERTEX=35,B.VERTS_PER_QUAD=4,B.INDICES_PER_QUAD=6,B.ZERO_VEC8=new Float32Array(8),B.ZERO_VEC4=new Float32Array(4),B.ZERO_VEC2=new Float32Array(2);let J=B;class mt{constructor(t,r,e,i,o){this.filterVertexData=new Float32Array(16),this.stencilDepth=0,this.canvasWidth=1,this.canvasHeight=1,this.filterLoc=null,this.filterProjectionDirty=!0,this.gl=t,this.shaderManager=r,this.textureManager=e,this.fboManager=i,this.glState=o,this.batcher=new bt(t,r.quadProgram),this.sdfBatcher=new J(t,r.sdfProgram);const s=t.createBuffer(),n=t.createBuffer();if(!s||!n)throw new Error("[PipelineExecutor] Failed to create filter buffers");this.filterVertexBuffer=s,this.filterIndexBuffer=n,t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,n),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,this.filterVertexData,t.DYNAMIC_DRAW),this.projectionMatrix=new Float32Array(16),this.cacheFilterLocations()}getDrawCallStats(){var t,r;return{sdfFlushes:((t=this.sdfBatcher)==null?void 0:t.flushCount)??0,sdfTotalQuads:((r=this.sdfBatcher)==null?void 0:r.totalQuads)??0}}resetDrawCallStats(){var t;(t=this.sdfBatcher)==null||t.resetStats()}cacheFilterLocations(){const t=this.gl,r=this.shaderManager.filterProgram;this.filterLoc={a_position:t.getAttribLocation(r,"a_position"),a_texCoord:t.getAttribLocation(r,"a_texCoord"),u_projection:t.getUniformLocation(r,"u_projection"),u_texture:t.getUniformLocation(r,"u_texture"),u_brightness:t.getUniformLocation(r,"u_brightness"),u_contrast:t.getUniformLocation(r,"u_contrast"),u_saturation:t.getUniformLocation(r,"u_saturation"),u_invert:t.getUniformLocation(r,"u_invert"),u_grey:t.getUniformLocation(r,"u_grey"),u_bw:t.getUniformLocation(r,"u_bw"),u_alpha:t.getUniformLocation(r,"u_alpha")}}updateProjection(t,r){const e=this.projectionMatrix;e[0]=2/t,e[4]=0,e[8]=0,e[12]=-1,e[1]=0,e[5]=-2/r,e[9]=0,e[13]=1,e[2]=0,e[6]=0,e[10]=1,e[14]=0,e[3]=0,e[7]=0,e[11]=0,e[15]=1,this.canvasWidth=t,this.canvasHeight=r,this.fboManager.setMainSize(t,r),this.batcher.setProjection(this.projectionMatrix),this.sdfBatcher.setProjection(this.projectionMatrix),this.filterProjectionDirty=!0}flushBatchers(){this.batcher.flush(),this.sdfBatcher.flush(),this.glState.invalidateProgram()}execute(t){this.resetDrawCallStats();for(const r of t)switch(r.type){case A.DRAW_QUAD:this.sdfBatcher.flush(),this.glState.invalidateProgram(),this.executeDrawQuad(r);break;case A.DRAW_SDF_SHAPE:this.batcher.flush(),this.glState.invalidateProgram(),this.sdfBatcher.push(r);break;case A.PUSH_FBO:this.flushBatchers(),this.executePushFBO(r);break;case A.POP_FBO:this.flushBatchers(),this.executePopFBO(r);break;case A.PUSH_STENCIL:this.flushBatchers(),this.executePushStencil(r);break;case A.POP_STENCIL:this.flushBatchers(),this.executePopStencil(r);break;case A.SET_BLEND_MODE:this.flushBatchers(),r.blendMode&&this.glState.setBlendMode(r.blendMode);break}this.flushBatchers()}destroy(){this.batcher.destroy(),this.sdfBatcher.destroy(),this.gl.deleteBuffer(this.filterVertexBuffer),this.gl.deleteBuffer(this.filterIndexBuffer)}executeDrawQuad(t){let r=null;t.textureId&&(r=this.textureManager.get(t.textureId)),this.batcher.pushQuad(t,r)}executePushFBO(t){const r=this.fboManager.pushFBO(this.canvasWidth,this.canvasHeight);t._resolvedFboId=r}executePopFBO(t){const r=this.fboManager.popFBO();this.batcher.flush(),this.glState.invalidateProgram();const e=t.compositeMode??"source-over";this.glState.setBlendMode(e);const i=new Float32Array([1,0,0,0,1,0,0,0,1]),o={...t,type:A.DRAW_QUAD,transform:i,width:this.canvasWidth,height:this.canvasHeight,filterParams:t.filterParams??{}},s=o.filterParams;s.contentShadowColor&&s.contentShadowBlur&&this.applyContentShadowPass(r,o),this.applyFilterComposite(r,o),this.glState.setBlendMode("source-over")}applyContentShadowPass(t,r){const e=this.gl,i=r.filterParams,o=i.contentShadowColor,s=i.contentShadowBlur,n=i.contentShadowOffset,a=this.parseColorToVec4(o);if(!a||a[3]<=0)return;let l=0,u=0;if(n){const O=n.split(",");l=parseFloat(O[0])||0,u=parseFloat(O[1])||0}const c=this.canvasWidth,h=this.canvasHeight,f=this.fboManager.pushFBO(c,h),g=this.fboManager.currentTexture(),_=this.shaderManager.shadowProgram;this.glState.useProgram(_),this.glState.enableBlend(!1);const m=e.getUniformLocation(_,"u_projection");e.uniformMatrix4fv(m,!1,this.projectionMatrix);const x=e.getUniformLocation(_,"u_texture");e.uniform1i(x,0);const y=e.getUniformLocation(_,"u_shadowColor");e.uniform4fv(y,a);const w=e.getUniformLocation(_,"u_alpha");e.uniform1f(w,r.alpha),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,t);const T=new Float32Array([0,0,0,1,c,0,1,1,c,h,1,0,0,h,0,0]);e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,T,e.DYNAMIC_DRAW);const d=16,v=e.getAttribLocation(_,"a_position"),E=e.getAttribLocation(_,"a_texCoord");v>=0&&(e.enableVertexAttribArray(v),e.vertexAttribPointer(v,2,e.FLOAT,!1,d,0)),E>=0&&(e.enableVertexAttribArray(E),e.vertexAttribPointer(E,2,e.FLOAT,!1,d,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.fboManager.popFBO(),this.glState.enableBlend(!0);const R=this.applyBlurPasses(g,s);this.glState.setBlendMode("source-over");const D=this.shaderManager.filterProgram;this.glState.useProgram(D);const C=this.filterLoc;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,R),e.uniform1i(C.u_texture,0),e.uniform1f(C.u_brightness,0),e.uniform1f(C.u_contrast,0),e.uniform1f(C.u_saturation,0),e.uniform1f(C.u_invert,0),e.uniform1f(C.u_grey,0),e.uniform1f(C.u_bw,0),e.uniform1f(C.u_alpha,1),this.filterProjectionDirty&&(e.uniformMatrix4fv(C.u_projection,!1,this.projectionMatrix),this.filterProjectionDirty=!1);const L=new Float32Array([l,u,0,1,c+l,u,1,1,c+l,h+u,1,0,l,h+u,0,0]);e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,L,e.DYNAMIC_DRAW),C.a_position>=0&&(e.enableVertexAttribArray(C.a_position),e.vertexAttribPointer(C.a_position,2,e.FLOAT,!1,d,0)),C.a_texCoord>=0&&(e.enableVertexAttribArray(C.a_texCoord),e.vertexAttribPointer(C.a_texCoord,2,e.FLOAT,!1,d,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0);const F=this.fboManager.idMap.get(f);F&&this.fboManager.releaseEntry(F)}parseColorToVec4(t){try{const r=t.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);if(r)return new Float32Array([parseFloat(r[1])/255,parseFloat(r[2])/255,parseFloat(r[3])/255,r[4]!=null?parseFloat(r[4]):1]);const e=t.replace("#","");if(e.length===6||e.length===8){const i=parseInt(e.slice(0,2),16)/255,o=parseInt(e.slice(2,4),16)/255,s=parseInt(e.slice(4,6),16)/255,n=e.length===8?parseInt(e.slice(6,8),16)/255:1;return new Float32Array([i,o,s,n])}}catch{}return null}executePushStencil(t){const r=this.gl;this.stencilDepth++,this.glState.enableStencilTest(!0),r.stencilFunc(r.ALWAYS,this.stencilDepth,255),r.stencilOp(r.KEEP,r.KEEP,r.REPLACE),r.colorMask(!1,!1,!1,!1),this.sdfBatcher.setStencilMode(1),this.sdfBatcher.push({...t,type:A.DRAW_SDF_SHAPE,shapeType:t.shapeType??"rect",fillColor:new Float32Array([1,1,1,1])}),this.sdfBatcher.flush(),this.glState.invalidateProgram(),this.sdfBatcher.setStencilMode(0),r.colorMask(!0,!0,!0,!0),r.stencilFunc(r.EQUAL,this.stencilDepth,255),r.stencilOp(r.KEEP,r.KEEP,r.KEEP)}executePopStencil(t){const r=this.gl;this.stencilDepth=Math.max(0,this.stencilDepth-1),this.stencilDepth===0?(this.glState.enableStencilTest(!1),r.clear(r.STENCIL_BUFFER_BIT)):r.stencilFunc(r.EQUAL,this.stencilDepth,255)}applyFilterComposite(t,r){const e=this.gl,i=r.filterParams,o=i.blurRadius??0;let s=t;o>0&&(s=this.applyBlurPasses(t,o));const n=this.shaderManager.filterProgram;this.glState.useProgram(n);const a=this.filterLoc;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,s),e.uniform1i(a.u_texture,0),e.uniform1f(a.u_brightness,i.brightness??0),e.uniform1f(a.u_contrast,i.contrast??0),e.uniform1f(a.u_saturation,i.saturation??0),e.uniform1f(a.u_invert,i.invert?1:0),e.uniform1f(a.u_grey,i.grey?1:0),e.uniform1f(a.u_bw,i.bw?1:0),e.uniform1f(a.u_alpha,r.alpha),this.filterProjectionDirty&&(e.uniformMatrix4fv(a.u_projection,!1,this.projectionMatrix),this.filterProjectionDirty=!1);const l=r.transform,u=r.width,c=r.height,h=this.filterVertexData;h[0]=l[6],h[1]=l[7],h[2]=0,h[3]=1,h[4]=l[0]*u+l[6],h[5]=l[1]*u+l[7],h[6]=1,h[7]=1,h[8]=l[0]*u+l[3]*c+l[6],h[9]=l[1]*u+l[4]*c+l[7],h[10]=1,h[11]=0,h[12]=l[3]*c+l[6],h[13]=l[4]*c+l[7],h[14]=0,h[15]=0,e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferSubData(e.ARRAY_BUFFER,0,h);const f=16;a.a_position>=0&&(e.enableVertexAttribArray(a.a_position),e.vertexAttribPointer(a.a_position,2,e.FLOAT,!1,f,0)),a.a_texCoord>=0&&(e.enableVertexAttribArray(a.a_texCoord),e.vertexAttribPointer(a.a_texCoord,2,e.FLOAT,!1,f,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)}applyBlurPasses(t,r){const e=this.gl,i=this.canvasWidth,o=this.canvasHeight,s=this.fboManager.pushFBO(i,o),n=this.fboManager.currentTexture(),a=this.shaderManager.blurProgram;this.glState.useProgram(a);const l=e.getUniformLocation(a,"u_projection");e.uniformMatrix4fv(l,!1,this.projectionMatrix);const u=[0,i,i,0],c=[0,0,o,o],h=[0,1,1,1,1,0,0,0],f=new Float32Array(16);for(let d=0;d<4;d++)f[d*4+0]=u[d],f[d*4+1]=c[d],f[d*4+2]=h[d*2],f[d*4+3]=h[d*2+1];e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,f,e.DYNAMIC_DRAW);const g=16,_=e.getAttribLocation(a,"a_position"),m=e.getAttribLocation(a,"a_texCoord");_>=0&&(e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,g,0)),m>=0&&(e.enableVertexAttribArray(m),e.vertexAttribPointer(m,2,e.FLOAT,!1,g,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,t),e.uniform1i(e.getUniformLocation(a,"u_texture"),0),e.uniform2f(e.getUniformLocation(a,"u_delta"),r/i,0),this.glState.enableBlend(!1),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.glState.enableBlend(!0),this.fboManager.popFBO();const x=this.fboManager.pushFBO(i,o),y=this.fboManager.currentTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(e.getUniformLocation(a,"u_texture"),0),e.uniform2f(e.getUniformLocation(a,"u_delta"),0,r/o),this.glState.enableBlend(!1),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.glState.enableBlend(!0),this.fboManager.popFBO();const w=this.fboManager.idMap.get(s);w&&this.fboManager.releaseEntry(w);const T=this.fboManager.idMap.get(x);return T&&this.fboManager.releaseEntry(T),y}}class yt extends I{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastContentSignature="",this.textureKey=`text_${r.id}`}prepare(t){if(!this.dirty)return;const r=this.computeContentSignature();if(r===this.lastContentSignature&&t.get(this.textureKey)){this.dirty=!1;return}const e=this.rasterizeText();if(!e){this.dirty=!1;return}t.update(this.textureKey,e),this.lastContentSignature=r,this.dirty=!1}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}computeContentSignature(){const t=this.node,r=typeof t.text=="string"?t.text:JSON.stringify(t.text),e=this.scene.renderEngine.canvasEl,i=e.offsetWidth>0?e.width/e.offsetWidth:window.devicePixelRatio||1;return[r,t.width,t.height,t.textSize,t.textColor,t.textAlign,t.textVerticalAlign,t.fontWeight,t.italic,t.lineSpacing,t.autoWrap,t.json.fontBorderColor,t.json.fontBorderWidth,t.json.textShadowColor,t.json.textShadowOffset,t.json.textShadowBlur,i].join("|")}getLineSpacingPx(t){const r=this.node.lineSpacing;let e;return typeof r=="string"&&r.endsWith("%")?e=parseInt(r)/100*t:r!=null&&(e=parseInt(String(r))),(e==null||isNaN(e))&&(e=t*.4),e}rasterizeText(){const t=this.node,r=Math.max(1,Math.ceil(t.width)),e=Math.max(1,Math.ceil(t.height)),{canvas:i,ctx:o}=this.createOffscreenCanvas(r,e,this.offscreenCanvas);this.offscreenCanvas=i,o.clearRect(0,0,r,e);const s=t.json.backgroundColor;s&&(o.fillStyle=s,o.fillRect(0,0,r,e));let n=this.parseFontSize(t.textSize,e);const a=[];t.italic&&a.push("italic"),t.fontWeight&&a.push(String(t.fontWeight)),a.push(`${n}px`),a.push(this.scene.textMeasureFontFamily),o.font=a.join(" "),o.fillStyle=t.textColor||"#000000",o.textBaseline="top";const l=t.json.textShadowColor,u=t.json.textShadowBlur,c=t.json.textShadowOffset;if(l&&u&&(o.shadowColor=l,o.shadowBlur=typeof u=="number"?u:parseFloat(String(u))||0,c)){const F=String(c).split(",");o.shadowOffsetX=parseFloat(F[0])||0,o.shadowOffsetY=parseFloat(F[1])||0}const h=t.textAlign;o.textAlign=h==="left"?"left":h==="right"?"right":"center";let f=0;h==="center"?f=r/2:h==="right"&&(f=r);const g=t.textVerticalAlign,_=t.autoReduceTextSize,m=t.autoReduceTextSizeMin||12;if(_&&typeof t.text=="string"&&t.text){const F=t.text.split(`
`),O=Math.max(...F.map(b=>o.measureText(b).width));if(O>r){const b=Math.max(m,n*(r/O));if(b<n){n=b;const P=[];t.italic&&P.push("italic"),t.fontWeight&&P.push(String(t.fontWeight)),P.push(`${n}px`),P.push(this.scene.textMeasureFontFamily),o.font=P.join(" ")}}}const x=t.text;if(Array.isArray(x))return this.renderRichText(o,x,n,r,e,f,h,g,t.json.fontBorderColor,t.json.fontBorderWidth),i;const y=typeof x=="string"?x:String(x),w=this.getLineSpacingPx(n),T=n+w,d=t.autoWrap?this.wrapText(o,y,r):y.split(`
`);o.textBaseline="middle";const v=T*(d.length-1),E=v/2;let R=e/2+n/2;g==="top"?R=n:g==="bottom"?R=e-v:R-=E,R-=n/2;const D=t.json.fontBorderColor,C=t.json.fontBorderWidth,L=!!(D&&C&&C>0);return L&&(o.strokeStyle=D,o.lineWidth=C),d.forEach((F,O)=>{o.fillText(F,f,R+O*T)}),L&&d.forEach((F,O)=>{o.strokeText(F,f,R+O*T)}),i}parseFontSize(t,r){return t?t.endsWith("%")?parseFloat(t)/100*r:parseFloat(t)||16:16}renderRichText(t,r,e,i,o,s,n,a,l,u){var T;const c=[];let h={spans:[],align:void 0};for(const d of r){const v=typeof d=="string"?d:d.text||"",E=typeof d=="object"?d.attributes:void 0,R=v.split(`
`);for(let D=0;D<R.length;D++)D>0&&(h.align=E==null?void 0:E.align,c.push(h),h={spans:[],align:void 0}),R[D]&&h.spans.push({text:R[D],attrs:E})}if(h.spans.length>0||c.length===0){const d=h.spans[h.spans.length-1];h.align=(T=d==null?void 0:d.attrs)==null?void 0:T.align,c.push(h)}const f=d=>{let v=e;return(d==null?void 0:d.size)==="small"?v*=.75:(d==null?void 0:d.size)==="large"?v*=1.5:(d==null?void 0:d.size)==="huge"&&(v*=2.5),v},g=(d,v)=>{const E=[];d!=null&&d.italic&&E.push("italic"),d!=null&&d.bold&&E.push("bold"),E.push(`${v}px`),E.push(this.scene.textMeasureFontFamily),t.font=E.join(" ")},_=this.getLineSpacingPx(e),m=c.map(d=>{let v=0,E=0;const R=[];for(const{text:D,attrs:C}of d.spans){const L=f(C);g(C,L);const F=t.measureText(D).width;R.push(F),v+=F,L>E&&(E=L)}return E===0&&(E=e),{lineWidth:v,maxFontSize:E,spanWidths:R}}),x=m.reduce((d,v)=>d+v.maxFontSize,0)+_*Math.max(0,c.length-1);let y=0;a==="middle"?y=(o-x)/2:a==="bottom"&&(y=o-x),t.textAlign="left",t.textBaseline="middle";let w=y;for(let d=0;d<c.length;d++){const v=c[d],{lineWidth:E,maxFontSize:R,spanWidths:D}=m[d];if(!v.spans.length){w+=R+_;continue}const C=v.align||n;let L=0;C==="center"?L=(i-E)/2:C==="right"&&(L=i-E);let F=L;for(let O=0;O<v.spans.length;O++){const{text:b,attrs:P}=v.spans[O],U=f(P);g(P,U);const N=D[O],W=w+R-U/2;P!=null&&P.background&&(t.fillStyle=P.background,t.fillRect(F,w,N,R));const j=(P==null?void 0:P.color)||this.node.textColor||"#000000";if(t.fillStyle=j,t.fillText(b,F,W),l&&u&&u>0&&(t.strokeStyle=l,t.lineWidth=u,t.strokeText(b,F,W)),P!=null&&P.strike&&(t.strokeStyle=j,t.lineWidth=U/12,t.beginPath(),t.moveTo(F,W),t.lineTo(F+N,W),t.stroke()),P!=null&&P.underline){t.strokeStyle=j,t.lineWidth=U/12,t.beginPath();const H=w+R-U*.1;t.moveTo(F,H),t.lineTo(F+N,H),t.stroke()}F+=N}w+=R+_}}wrapText(t,r,e){const i=[],o=r.split(`
`);for(const s of o){if(t.measureText(s).width<=e){i.push(s);continue}let n="";for(const a of s){const l=n+a;t.measureText(l).width>e&&n.length>0?(i.push(n),n=a):n=l}n&&i.push(n)}return i}}class wt extends I{constructor(t,r){super(t,r)}}class St extends I{constructor(t,r){super(t,r),this.textureKey=`embed_${r.id}`}prepare(t){const r=this.node.embedRenderEngine;if(!r)return;r.doRender(0);const e=r.canvasEl;!e||e.width===0||e.height===0||(this.dirty?(t.update(this.textureKey,e),this.dirty=!1):t.get(this.textureKey)||t.getOrCreate(this.textureKey,e))}destroy(){}}class Et extends I{constructor(t,r){super(t,r)}}class Ct extends ut{constructor(){super(...arguments),this.gl=null,this.offscreenGLCanvas=null,this.shaderManager=null,this.textureManager=null,this.fboManager=null,this.glState=null,this.traverser=null,this.executor=null,this.webglNodes=new WeakMap,this.glInitialized=!1,this._canvasBgImage=void 0,this._canvasBgTextureKey="__scene_canvas_bg__"}doRenderImpl(t){this.glInitialized||this.initWebGL();const r=this.gl,e=this.offscreenGLCanvas;(e.width!==t.width||e.height!==t.height)&&(e.width=t.width,e.height=t.height,r.viewport(0,0,e.width,e.height)),this.executor.updateProjection(e.width,e.height),this.glState.reset(),this.glState.initDefaults();const i=this.viewportBackgroundColor,o=Z(i);if(o){const d=o.a??1;r.clearColor(o.r/255,o.g/255,o.b/255,d)}else r.clearColor(0,0,0,1);r.disable(r.SCISSOR_TEST),r.clear(r.COLOR_BUFFER_BIT|r.STENCIL_BUFFER_BIT);const s=this.viewportWidth,n=this.viewportHeight,a=Math.min(e.width/s,e.height/n),l=(e.width/a-s)/2-this.viewportX,u=(e.height/a-n)/2-this.viewportY,c=Math.round((l+this.viewportX)*a),h=Math.round((u+this.viewportY)*a),f=Math.round(s*a),g=Math.round(n*a),_=e.height-h-g;r.enable(r.SCISSOR_TEST),r.scissor(c,_,f,g);const m=this.canvasBackgroundColor;if(m){const d=Z(m);if(d){const v=d.a??1;r.clearColor(d.r/255,d.g/255,d.b/255,v),r.clear(r.COLOR_BUFFER_BIT)}}const x=this.canvasBackgroundImageId;if(x){if(this._canvasBgImage=this.loadImageForRender(x,this._canvasBgImage),this._canvasBgImage){const d=this._canvasBgTextureKey;if(!this.textureManager.get(d)){const E=this._rasterizeBgImageIfNeeded(this._canvasBgImage,this.sceneWidth,this.sceneHeight);if(!E)return;this.textureManager.getOrCreate(d,E)}const v=this.traverser.traverseCanvasBackground(d,a,l,u,this.sceneWidth,this.sceneHeight);this.executor.execute(v)}}else this.textureManager.get(this._canvasBgTextureKey)&&this.textureManager.delete(this._canvasBgTextureKey),this._canvasBgImage=void 0;const y=this.childNodesSortByZIndex;for(const d of y)this.prepareNode(d);const w=this.traverser.traverse(y,this.webglNodes,a,l,u);this.executor.execute(w),window.__sdfStats=this.executor.getDrawCallStats(),r.disable(r.SCISSOR_TEST),r.flush();const T=t.getContext("2d");T&&(T.clearRect(0,0,t.width,t.height),T.drawImage(e,0,0))}toWebGLNode(t){let r=this.webglNodes.get(t);if(!r){r=this.createWebGLNode(t);const e=r;t.onRequestReRender(()=>e.markDirty()),t.onDestroy(()=>e.destroy()),this.webglNodes.set(t,r)}return r}async callRenderMethod(t){const r=t.nodeId&&this.getNode(t.nodeId),e=r&&this.toWebGLNode(r);return e&&typeof e[t.methodName]=="function"?e[t.methodName](...t.methodArgs||[]):super.callRenderMethod(t)}onNodeAdded(t){this.toWebGLNode(t)}onNodeDataUpdated(t){var r;(r=this.webglNodes.get(t))==null||r.markDirty()}destroyWebGL(){this.executor&&(this.executor.destroy(),this.executor=null),this.shaderManager&&(this.shaderManager.destroy(),this.shaderManager=null),this.textureManager&&(this.textureManager.destroy(),this.textureManager=null),this.fboManager&&(this.fboManager.destroy(),this.fboManager=null),this.gl=null,this.offscreenGLCanvas=null,this.glInitialized=!1}initWebGL(){const t=document.createElement("canvas");t.width=1,t.height=1;let r=null;try{r=t.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,stencil:!0,preserveDrawingBuffer:!0})}catch{}if(r||(r=t.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!1,stencil:!0,preserveDrawingBuffer:!0}),r&&r.getExtension("OES_standard_derivatives")),!r)throw new Error("[RenderSceneWebGL] WebGL is not supported in this environment");this.offscreenGLCanvas=t,this.gl=r,this.shaderManager=new ft(r),this.textureManager=new _t(r),this.fboManager=new gt(r),this.glState=new pt(r),this.traverser=new xt,this.executor=new mt(r,this.shaderManager,this.textureManager,this.fboManager,this.glState),this.glState.initDefaults(),this.glInitialized=!0,this.onDestroy(()=>this.destroyWebGL())}_rasterizeBgImageIfNeeded(t,r,e){var s;if(t.tagName==="CANVAS")return t;const i=t,o=this.imageRender.getImageResMeta(i);if((o==null?void 0:o.mimeTypeFull)==="image/svg+xml"){const n=this.imageRender.getSvgRasterizedCanvas(i);if(!n)return null;const a=Math.ceil(r),l=Math.ceil(e);if(n.width<a||n.height<l){const u=document.createElement("canvas");return u.width=a,u.height=l,(s=u.getContext("2d"))==null||s.drawImage(i,0,0,a,l),u}return n}return i}prepareNode(t){if(t.hidden)return;if(this.toWebGLNode(t).prepare(this.textureManager),t instanceof z)for(const i of t.drawDataNodesSortByZIndex)this.prepareNode(i);const e=t.childNodesSortByZIndex;if(e)for(const i of e)this.prepareNode(i)}createWebGLNode(t){var r;if(t instanceof et)return new st(this,t);if(t instanceof it)return new yt(this,t);if(t instanceof dt)return new wt(this,t);if(t instanceof ot)return new St(this,t);if(t instanceof rt)return new at(this,t);if(t instanceof z)return new Et(this,t);{const e=(r=t.json)==null?void 0:r.shape;return!(t instanceof z)&&(e==="triangle"||e&&e.startsWith("polygon"))?new nt(this,t):new I(this,t)}}}export{Ct as R};
