import{c as gt,d as ot,f as Ft,g as Pt,h as Dt,i as Lt,j as _t,k as Ht,l as qt,R as Gt,a as zt,b as Xt}from"./render-scene-canvas-C4zXFaoi.js";class Yt{constructor(t){if(this._quadProgram=null,this._sdfProgram=null,this._filterProgram=null,this._blurProgram=null,this._shadowProgram=null,this.gl=t,this.isWebGL2=typeof WebGL2RenderingContext<"u"&&t instanceof WebGL2RenderingContext,this.isWebGL2)this.hasDerivatives=!0;else{const r=t.getExtension("OES_standard_derivatives");this.hasDerivatives=!!r}}get quadProgram(){return this._quadProgram||(this._quadProgram=this.compile(this.quadVertSrc(),this.quadFragSrc())),this._quadProgram}get sdfProgram(){return this._sdfProgram||(this._sdfProgram=this.compile(this.sdfVertSrc(),this.sdfFragSrc())),this._sdfProgram}get filterProgram(){return this._filterProgram||(this._filterProgram=this.compile(this.filterVertSrc(),this.filterFragSrc())),this._filterProgram}get blurProgram(){return this._blurProgram||(this._blurProgram=this.compile(this.filterVertSrc(),this.blurFragSrc())),this._blurProgram}get shadowProgram(){return this._shadowProgram||(this._shadowProgram=this.compile(this.filterVertSrc(),this.shadowFragSrc())),this._shadowProgram}destroy(){const t=this.gl;this._quadProgram&&t.deleteProgram(this._quadProgram),this._sdfProgram&&t.deleteProgram(this._sdfProgram),this._filterProgram&&t.deleteProgram(this._filterProgram),this._blurProgram&&t.deleteProgram(this._blurProgram),this._shadowProgram&&t.deleteProgram(this._shadowProgram)}compile(t,r){const e=this.gl,i=this.compileShader(e.VERTEX_SHADER,t),o=this.compileShader(e.FRAGMENT_SHADER,r),s=e.createProgram();if(!s)throw new Error("[ShaderManager] Failed to create program");if(e.attachShader(s,i),e.attachShader(s,o),e.linkProgram(s),e.deleteShader(i),e.deleteShader(o),!e.getProgramParameter(s,e.LINK_STATUS)){const n=e.getProgramInfoLog(s);throw e.deleteProgram(s),new Error(`[ShaderManager] Program link failed: ${n}`)}return s}compileShader(t,r){const e=this.gl,i=e.createShader(t);if(!i)throw new Error("[ShaderManager] Failed to create shader");if(e.shaderSource(i,r),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS)){const o=e.getShaderInfoLog(i);throw e.deleteShader(i),new Error(`[ShaderManager] Shader compile failed: ${o}`)}return i}quadVertSrc(){return this.isWebGL2?`#version 300 es
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
    // 内边框：双边 smoothstep 实现，与 Canvas 后端 clip+2x lineWidth 的效果一致
    // 外边缘（dist=0）：smoothstep(fw, -fw, dist) 从外向内过渡
    // 内边缘（dist=-strokeWidth）：smoothstep(-fw, fw, dist+strokeWidth) 从内向外过渡
    // 两者相乘得到 stroke 区域 [−strokeWidth, 0] 内的 alpha
    float strokeAlpha;
    if (shapeType == 0) {
      // rect 使用硬边界 step
      strokeAlpha = step(dist, 0.0) * step(-v_strokeWidth, dist);
    } else {
      strokeAlpha = smoothstep(fw, -fw, dist) * smoothstep(-fw, fw, dist + v_strokeWidth);
    }
    color = mix(color, v_strokeColor, strokeAlpha);
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
`}}class Kt{constructor(t){this.cache=new Map,this.gl=t}getOrCreate(t,r,e={}){const i=this.cache.get(t);return i||this.upload(t,r,e)}update(t,r,e={}){return this.delete(t),this.upload(t,r,e)}delete(t){const r=this.cache.get(t);r&&(this.gl.deleteTexture(r),this.cache.delete(t))}get(t){return this.cache.get(t)??null}destroy(){for(const t of this.cache.values())this.gl.deleteTexture(t);this.cache.clear()}upload(t,r,e){const i=this.gl,o=i.createTexture();if(!o)throw new Error("[TextureManager] Failed to create WebGLTexture");i.bindTexture(i.TEXTURE_2D,o),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,r);const s=e.minFilter??i.LINEAR,n=e.magFilter??i.LINEAR;i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,s),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,n);const a=e.wrapS??i.CLAMP_TO_EDGE,l=e.wrapT??i.CLAMP_TO_EDGE;return i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,a),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,l),(a===i.REPEAT||l===i.REPEAT)&&!this.isPowerOf2Source(r)&&(i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)),i.bindTexture(i.TEXTURE_2D,null),this.cache.set(t,o),o}isPowerOf2Source(t){const r=t.naturalWidth??t.width??t.width,e=t.naturalHeight??t.height??t.height;return this.isPowerOf2(r)&&this.isPowerOf2(e)}isPowerOf2(t){return t>0&&(t&t-1)===0}}class Qt{constructor(t){this.pool=new Map,this.stack=[],this.nextId=0,this.idMap=new Map,this.mainWidth=1,this.mainHeight=1,this.gl=t}setMainSize(t,r){this.mainWidth=t,this.mainHeight=r}pushFBO(t,r){const e=this.gl,i=this.acquireEntry(t,r);e.bindFramebuffer(e.FRAMEBUFFER,i.fbo),e.viewport(0,0,t,r),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT|e.STENCIL_BUFFER_BIT),this.stack.push(i);const o=this.nextId++;return this.idMap.set(o,i),o}popFBO(){const t=this.gl,r=this.stack.pop();if(!r)throw new Error("[FBOManager] popFBO called on empty stack");if(this.stack.length>0){const e=this.stack[this.stack.length-1];t.bindFramebuffer(t.FRAMEBUFFER,e.fbo),t.viewport(0,0,e.width,e.height)}else t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.mainWidth,this.mainHeight);return r.texture}releaseEntry(t){const r=`${t.width}_${t.height}`;let e=this.pool.get(r);e||(e=[],this.pool.set(r,e)),e.push(t)}get currentFBO(){return this.stack.length>0?this.stack[this.stack.length-1].fbo:null}currentTexture(){if(this.stack.length===0)throw new Error("[FBOManager] currentTexture called on empty stack");return this.stack[this.stack.length-1].texture}destroy(){const t=this.gl,r=e=>{t.deleteFramebuffer(e.fbo),t.deleteTexture(e.texture),t.deleteRenderbuffer(e.stencilRbo)};for(const e of this.pool.values())e.forEach(r);this.stack.forEach(r),this.pool.clear(),this.stack=[],this.idMap.clear()}acquireEntry(t,r){const e=`${t}_${r}`,i=this.pool.get(e);return i&&i.length>0?i.pop():this.createEntry(t,r)}createEntry(t,r){const e=this.gl,i=e.createTexture();if(!i)throw new Error("[FBOManager] Failed to create texture");e.bindTexture(e.TEXTURE_2D,i),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null);const o=e.createRenderbuffer();if(!o)throw new Error("[FBOManager] Failed to create stencil renderbuffer");e.bindRenderbuffer(e.RENDERBUFFER,o),e.renderbufferStorage(e.RENDERBUFFER,e.STENCIL_INDEX8,t,r),e.bindRenderbuffer(e.RENDERBUFFER,null);const s=e.createFramebuffer();if(!s)throw new Error("[FBOManager] Failed to create framebuffer");e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.STENCIL_ATTACHMENT,e.RENDERBUFFER,o);const n=e.checkFramebufferStatus(e.FRAMEBUFFER);if(n!==e.FRAMEBUFFER_COMPLETE)throw new Error(`[FBOManager] Framebuffer incomplete: 0x${n.toString(16)}`);return e.bindFramebuffer(e.FRAMEBUFFER,null),{fbo:s,texture:i,stencilRbo:o,width:t,height:r}}}class $t{constructor(t){this._blendEnabled=!1,this._blendSrcFactor=-1,this._blendDstFactor=-1,this._blendSrcAlpha=-1,this._blendDstAlpha=-1,this._stencilTestEnabled=!1,this._depthTestEnabled=!1,this._currentProgram=null,this._scissorTestEnabled=!1,this.gl=t}reset(){this._blendEnabled=!1,this._blendSrcFactor=-1,this._blendDstFactor=-1,this._blendSrcAlpha=-1,this._blendDstAlpha=-1,this._stencilTestEnabled=!1,this._depthTestEnabled=!1,this._currentProgram=null,this._scissorTestEnabled=!1}initDefaults(){const t=this.gl;this.enableBlend(!0),this.setBlendMode("source-over"),t.disable(t.DEPTH_TEST),this._depthTestEnabled=!1,t.disable(t.CULL_FACE),t.clearColor(0,0,0,0)}enableBlend(t){if(this._blendEnabled===t)return;const r=this.gl;t?r.enable(r.BLEND):r.disable(r.BLEND),this._blendEnabled=t}setBlendMode(t){const r=this.gl;let e,i,o,s;switch(t){case"source-over":default:e=r.ONE,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"multiply":e=r.DST_COLOR,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"screen":e=r.ONE,i=r.ONE_MINUS_SRC_COLOR,o=r.ONE,s=r.ONE_MINUS_SRC_ALPHA;break;case"add":case"lighter":e=r.ONE,i=r.ONE,o=r.ONE,s=r.ONE;break;case"destination-in":e=r.ZERO,i=r.SRC_ALPHA,o=r.ZERO,s=r.SRC_ALPHA;break;case"destination-out":e=r.ZERO,i=r.ONE_MINUS_SRC_ALPHA,o=r.ZERO,s=r.ONE_MINUS_SRC_ALPHA;break;case"source-atop":e=r.DST_ALPHA,i=r.ONE_MINUS_SRC_ALPHA,o=r.DST_ALPHA,s=r.ONE_MINUS_SRC_ALPHA;break;case"destination-over":e=r.ONE_MINUS_DST_ALPHA,i=r.ONE,o=r.ONE_MINUS_DST_ALPHA,s=r.ONE;break;case"xor":e=r.ONE_MINUS_DST_ALPHA,i=r.ONE_MINUS_SRC_ALPHA,o=r.ONE_MINUS_DST_ALPHA,s=r.ONE_MINUS_SRC_ALPHA;break}this._blendSrcFactor===e&&this._blendDstFactor===i&&this._blendSrcAlpha===o&&this._blendDstAlpha===s||(r.blendFuncSeparate(e,i,o,s),this._blendSrcFactor=e,this._blendDstFactor=i,this._blendSrcAlpha=o,this._blendDstAlpha=s)}enableStencilTest(t){if(this._stencilTestEnabled===t)return;const r=this.gl;t?r.enable(r.STENCIL_TEST):r.disable(r.STENCIL_TEST),this._stencilTestEnabled=t}useProgram(t){this._currentProgram!==t&&(this.gl.useProgram(t),this._currentProgram=t)}invalidateProgram(){this._currentProgram=null}enableScissorTest(t){if(this._scissorTestEnabled===t)return;const r=this.gl;t?r.enable(r.SCISSOR_TEST):r.disable(r.SCISSOR_TEST),this._scissorTestEnabled=t}}var C=(d=>(d[d.DRAW_QUAD=0]="DRAW_QUAD",d[d.DRAW_SDF_SHAPE=1]="DRAW_SDF_SHAPE",d[d.PUSH_STENCIL=2]="PUSH_STENCIL",d[d.POP_STENCIL=3]="POP_STENCIL",d[d.PUSH_FBO=4]="PUSH_FBO",d[d.POP_FBO=5]="POP_FBO",d[d.SET_BLEND_MODE=6]="SET_BLEND_MODE",d))(C||{});function Zt(d,t,r,e,i,o){return new Float32Array([d,t,0,r,e,0,i,o,1])}function yt(d,t){const r=new Float32Array(9);for(let e=0;e<3;e++)for(let i=0;i<3;i++){let o=0;for(let s=0;s<3;s++)o+=d[s*3+i]*t[e*3+s];r[e*3+i]=o}return r}class q{constructor(t,r){this.dirty=!0,this.dashBorderTextureKey=null,this.outBorderTextureKey=null,this._bgImage=null,this._bgTextureKey=null,this.scene=t,this.node=r}prepare(t){this.dirty&&(this.dirty=!1,this._prepareDashBorder(t),this._prepareOutBorder(t),this._prepareBackgroundImage(t))}markDirty(){this.dirty=!0}destroy(){}createOffscreenCanvas(t,r,e){const i=this._getDevicePixelRatio(),o=e??document.createElement("canvas");o.width=Math.ceil(t*i),o.height=Math.ceil(r*i);const s=o.getContext("2d");return s.scale(i,i),{canvas:o,ctx:s,dpr:i}}_getDevicePixelRatio(){const t=this.scene.renderEngine.canvasEl,r=t.offsetWidth;return r>0?t.width/r:window.devicePixelRatio||1}_prepareBackgroundImage(t){var a,l;const r=this.node.json.backgroundImageId;if(!r){this._bgTextureKey&&(t.delete(this._bgTextureKey),this._bgTextureKey=null,this._bgImage=null);return}const e=`bg_${this.node.id}_${r}`;if(this._bgTextureKey===e&&t.get(e))return;const i=this.scene.loadImageForRender(r,this._bgImage??void 0,this.node.id);if(!i){this.dirty=!0;return}if("complete"in i){const u=i,c=this.scene.imageRender.isImageLoading(u);if(!u.complete||c){this.dirty=!0;return}}const{imageWillDraw:o,isImageLoading:s}=this.scene.imageRender.prepareDrawImage(`webgl_bg_${this.node.id}`,i);if(s){this.dirty=!0;return}let n=o;if(o.tagName!=="CANVAS"){const u=o,c=this.scene.imageRender.getImageResMeta(u);if((c==null?void 0:c.mimeTypeFull)==="image/svg+xml"){const h=this.scene.imageRender.getSvgRasterizedCanvas(u);if(!h){this.dirty=!0;return}const g=Math.ceil(this.node.width),p=Math.ceil(this.node.height);if(h.width<g||h.height<p){const _=document.createElement("canvas");_.width=g,_.height=p,(a=_.getContext("2d"))==null||a.drawImage(u,0,0,g,p),n=_}else n=h}else{const h=u.naturalWidth||u.width,g=u.naturalHeight||u.height;if(h>0&&g>0){const p=document.createElement("canvas");p.width=h,p.height=g,(l=p.getContext("2d"))==null||l.drawImage(u,0,0,h,g),n=p}else{this.dirty=!0;return}}}t.getOrCreate(e,n),this._bgImage=i,this._bgTextureKey=e}_prepareDashBorder(t){if(this.node.json.border!=="dash"){this.dashBorderTextureKey=null;return}const e=this.node.borderWidth,i=this.node.json.borderColor;if(!e||!i){this.dashBorderTextureKey=null;return}const o=`dash_border_${this.node.id}`;this.dashBorderTextureKey=o;const s=this.node.width,n=this.node.height,{canvas:a,ctx:l}=this.createOffscreenCanvas(s,n);l.save(),this._doPathByShape(l,s,n),l.clip(),l.strokeStyle=i,l.lineWidth=e*2;const u=this.node.json.borderDashSegments;u&&l.setLineDash(u.split(/[\s,]+/).map(Number).filter(c=>!isNaN(c))),this._doPathByShape(l,s,n),l.stroke(),l.restore(),t.update(o,a)}_prepareOutBorder(t){const r=this.node.json.borderOut;if(r!=="line"&&r!=="dash"){this.outBorderTextureKey=null;return}const e=this.node.borderOutWidth,i=this.node.json.borderOutColor;if(!e||!i){this.outBorderTextureKey=null;return}const o=`out_border_${this.node.id}`;this.outBorderTextureKey=o;const s=this.node.width,n=this.node.height,a=e*2,{canvas:l,ctx:u}=this.createOffscreenCanvas(s+a*2,n+a*2);u.save(),u.translate(a,a),u.beginPath(),this._doPathByShape(u,s,n,!1),u.rect(-a,-a,s+a*2,n+a*2),u.clip("evenodd"),u.strokeStyle=i,u.lineWidth=e*2;const c=this.node.json.borderOutDashSegments;r==="dash"&&c&&u.setLineDash(c.split(/[\s,]+/).map(Number).filter(g=>!isNaN(g)));const h=this.node.json.borderOutLineJoin;h&&(u.lineJoin=h),this._doPathByShape(u,s,n),u.stroke(),u.restore(),t.update(o,l)}_doPathByShape(t,r,e,i=!0){const o=this.node.json.shape;if(t.beginPath(),!o||o==="rect")t.rect(0,0,r,e);else if(o==="circular")t.ellipse(r/2,e/2,r/2,e/2,0,0,Math.PI*2);else if(o==="triangle")t.moveTo(0,e),t.lineTo(r/2,0),t.lineTo(r,e),i&&t.closePath();else if(o.startsWith("polygon")){const s=o.replace(/^polygon\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean).map(n=>({x:parseFloat(n.split(",")[0]),y:parseFloat(n.split(",")[1])})).filter(n=>n.x>=0&&n.x<=100&&n.y>=0&&n.y<=100);if(s.length<3)t.rect(0,0,r,e);else{const n=r/100,a=e/100;t.moveTo(s[0].x*n,s[0].y*a);for(const l of s)t.lineTo(l.x*n,l.y*a);i&&t.closePath()}}else if(o.startsWith("roundedRect")){const s=o.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(s.length===4)try{const n=gt({values:s,nodeWidth:r,nodeHeight:e}),a=n.topLeftValue,l=n.topRightValue,u=n.bottomRightValue,c=n.bottomLeftValue;t.moveTo(a,0),t.lineTo(r-l,0),t.arcTo(r,0,r,l,l),t.lineTo(r,e-u),t.arcTo(r,e,r-u,e,u),t.lineTo(c,e),t.arcTo(0,e,0,e-c,c),t.lineTo(0,a),t.arcTo(0,0,a,0,a),i&&t.closePath()}catch{t.rect(0,0,r,e)}else t.rect(0,0,r,e)}else t.rect(0,0,r,e)}}class Mt extends q{constructor(t,r){super(t,r),this.loadedImage=null,this.textureKey=null}prepare(t){var u;if(!this.dirty)return;if(!this.node.imageUrl){this.textureKey&&(t.delete(this.textureKey),this.textureKey=null),this.dirty=!1;return}const e=this.node.json.imageId;if(!e){this.dirty=!1;return}const i=`img_${this.node.id}_${e}`;if(this.textureKey===i&&t.get(i)){this.dirty=!1;return}const o=this.scene.loadImageForRender(e,this.loadedImage??void 0,this.node.id);if(!o||!("complete"in o)||!o.complete||o.naturalWidth===0)return;const s=this.node.imageFit,n=s==="fit-y-repeat-x"||s==="fit-x-repeat-y";let a=o;if(o.tagName!=="CANVAS"){const c=o,h=this.scene.imageRender.getImageResMeta(c);if((h==null?void 0:h.mimeTypeFull)==="image/svg+xml"){const g=this.scene.imageRender.getSvgRasterizedCanvas(c);if(!g)return;const p=Math.ceil(this.node.width),_=Math.ceil(this.node.height);if(g.width<p||g.height<_){const b=document.createElement("canvas");b.width=p,b.height=_,(u=b.getContext("2d"))==null||u.drawImage(c,0,0,p,_),a=b}else a=g}}const l=a;n?t.getOrCreate(i,l,{wrapS:10497,wrapT:10497}):t.getOrCreate(i,l),this.loadedImage=o,this.textureKey=i,this.dirty=!1}destroy(){this.loadedImage=null,this.textureKey=null}computeUVs(){const t=this.loadedImage;if(!t)return{uvs:new Float32Array([0,0,1,0,1,1,0,1]),drawX:0,drawY:0,drawWidth:this.node.width,drawHeight:this.node.height};const r=this.node.width-this.node.paddingLeft-this.node.paddingRight,e=this.node.height-this.node.paddingTop-this.node.paddingBottom,i=t.naturalWidth??t.width,o=t.naturalHeight??t.height;let s=0,n=0,a=i,l=o;const u=this.node.imageCutArea;if(u){const v=u.split(",");v.length===4&&(s=ot(v[0],i)||0,n=ot(v[1],o)||0,a=ot(v[2],i),isNaN(a)&&(a=i-s),l=ot(v[3],o),isNaN(l)&&(l=o-n))}const c=s/i,h=n/o,g=(s+a)/i,p=(n+l)/o;let _=0,b=0,x=r,y=e;const w=this.node.imageFit;if(w==="cover"){const v=Math.max(r/a,e/l);x=v*a,y=v*l}else if(w==="contain"){const v=Math.min(r/a,e/l);x=v*a,y=v*l}else w==="fit-y"||w==="fit-y-repeat-x"?x=e/l*a:(w==="fit-x"||w==="fit-x-repeat-y")&&(y=r/a*l);const T=this.node.imageFitAlignX;T==="center"?_=(r-x)/2:T==="right"&&(_=r-x);const f=this.node.imageFitAlignY;if(f==="center"?b=(e-y)/2:f==="bottom"&&(b=e-y),w==="fit-y-repeat-x"){const v=r/x;return{uvs:new Float32Array([c,h,c+(g-c)*v,h,c+(g-c)*v,p,c,p]),drawX:0,drawY:0,drawWidth:r,drawHeight:y}}else if(w==="fit-x-repeat-y"){const v=e/y;return{uvs:new Float32Array([c,h,g,h,g,h+(p-h)*v,c,h+(p-h)*v]),drawX:0,drawY:0,drawWidth:x,drawHeight:e}}if(w==="cover"||w==="contain"){const v=g-c,E=p-h;let R=c,D=h,A=g,L=p;_<0&&(R=c+-_/x*v),b<0&&(D=h+-b/y*E),_+x>r&&(A=c+(r-_)/x*v),b+y>e&&(L=h+(e-b)/y*E);const B=Math.max(0,_),M=Math.max(0,b),m=Math.min(x+Math.min(0,_),r-B),P=Math.min(y+Math.min(0,b),e-M);return{uvs:new Float32Array([R,D,A,D,A,L,R,L]),drawX:B,drawY:M,drawWidth:m,drawHeight:P}}return{uvs:new Float32Array([c,h,g,h,g,p,c,p]),drawX:_,drawY:b,drawWidth:x,drawHeight:y}}computeNineSliceQuads(t){const r=this.loadedImage;if(!r)return[];const e=t.split(",").map(Number);if(e.length!==4)return[];const[i,o,s,n]=e,a=r.naturalWidth??r.width,l=r.naturalHeight??r.height,u=this.node.width,c=this.node.height,h=i/a,g=(a-s)/a,p=o/l,_=(l-n)/l,b=i,x=u-s,y=o,w=c-n;return[{u0:0,v0:0,u1:h,v1:p,x0:0,y0:0,x1:b,y1:y},{u0:h,v0:0,u1:g,v1:p,x0:b,y0:0,x1:x,y1:y},{u0:g,v0:0,u1:1,v1:p,x0:x,y0:0,x1:u,y1:y},{u0:0,v0:p,u1:h,v1:_,x0:0,y0:y,x1:b,y1:w},{u0:h,v0:p,u1:g,v1:_,x0:b,y0:y,x1:x,y1:w},{u0:g,v0:p,u1:1,v1:_,x0:x,y0:y,x1:u,y1:w},{u0:0,v0:_,u1:h,v1:1,x0:0,y0:w,x1:b,y1:c},{u0:h,v0:_,u1:g,v1:1,x0:b,y0:w,x1:x,y1:c},{u0:g,v0:_,u1:1,v1:1,x0:x,y0:w,x1:u,y1:c}].map(f=>({uvs:new Float32Array([f.u0,f.v0,f.u1,f.v0,f.u1,f.v1,f.u0,f.v1]),drawX:f.x0,drawY:f.y0,drawWidth:f.x1-f.x0,drawHeight:f.y1-f.y0}))}}class It extends q{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastSignature="",this.textureKey=`line_${r.id}`}prepare(t){if(this.dirty){if(this.node.json.lineShape==="dash"&&this.node.json.lineDashSegments){const r=this.computeSignature();if(r===this.lastSignature&&t.get(this.textureKey)){this.dirty=!1;return}const e=this.rasterizeDashLine();e&&(t.update(this.textureKey,e),this.lastSignature=r)}this.dirty=!1}}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}get isDash(){return this.node.json.lineShape==="dash"&&!!this.node.json.lineDashSegments}get dashTextureKey(){return this.textureKey}computeSignature(){const t=this.node;return[t.width,t.height,t.json.lineColor,t.json.lineShape,t.json.lineDashSegments].join("|")}rasterizeDashLine(){const t=this.node,r=t.json.lineColor;if(!r)return null;const e=Math.max(1,Math.ceil(t.width)),i=Math.max(1,Math.ceil(t.height)),{canvas:o,ctx:s}=this.createOffscreenCanvas(e,i,this.offscreenCanvas);this.offscreenCanvas=o,s.clearRect(0,0,e,i),s.strokeStyle=r,s.lineWidth=e;const n=String(t.json.lineDashSegments).trim().split(/\s+/).map(Number).filter(a=>!isNaN(a)&&a>0);return n.length>0&&s.setLineDash(n),s.beginPath(),s.moveTo(e/2,0),s.lineTo(e/2,i),s.stroke(),s.setLineDash([]),o}}class Ot extends q{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastContentSignature="",this.textureKey=`polygon_${r.id}`}prepare(t){if(!this.dirty)return;const r=this.computeContentSignature();if(r===this.lastContentSignature&&t.get(this.textureKey)){this.dirty=!1;return}const e=this.rasterizePolygon();if(!e){this.dirty=!1;return}t.update(this.textureKey,e),this.lastContentSignature=r,this.dirty=!1}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}computeContentSignature(){const t=this.node;return[t.json.shape,t.width,t.height,t.json.backgroundColor,t.json.borderColor,t.json.borderWidth].join("|")}rasterizePolygon(){const t=this.node,r=Math.max(1,Math.ceil(t.width)),e=Math.max(1,Math.ceil(t.height)),i=t.json.shape,{canvas:o,ctx:s}=this.createOffscreenCanvas(r,e,this.offscreenCanvas);if(this.offscreenCanvas=o,s.clearRect(0,0,r,e),s.beginPath(),i==="triangle")s.moveTo(0,e),s.lineTo(r/2,0),s.lineTo(r,e),s.closePath();else if(i.startsWith("polygon")){const u=i.replace(/^polygon\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean).map(c=>{const h=c.split(",");return{x:parseFloat(h[0]),y:parseFloat(h[1])}}).filter(c=>c.x>=0&&c.x<=100&&c.y>=0&&c.y<=100);if(u.length<3)s.rect(0,0,r,e);else{const c=r/100,h=e/100;s.moveTo(u[0].x*c,u[0].y*h);for(const g of u)s.lineTo(g.x*c,g.y*h);s.closePath()}}else s.rect(0,0,r,e);const n=t.json.backgroundColor;n&&(s.fillStyle=n,s.fill());const a=t.json.borderColor,l=t.borderWidth;return a&&l>0&&(s.strokeStyle=a,s.lineWidth=l,s.stroke()),o}}class Jt{constructor(){this.commands=[],this.webglNodes=null,this.scaleToFitViewport=1}traverseCanvasBackground(t,r,e,i,o,s){const n=new Float32Array([r,0,0,0,r,0,e*r,i*r,1]),a=new Float32Array([0,0,1,0,1,1,0,1]);return[{type:C.DRAW_QUAD,transform:n,alpha:1,width:o,height:s,textureId:t,uvs:a,color:4294967295}]}traverse(t,r,e=1,i=0,o=0){this.commands=[],this.webglNodes=r??null,this.scaleToFitViewport=e;const s=new Float32Array([e,0,0,0,e,0,i*e,o*e,1]),n=t.some(l=>{if(l.hidden||l.alpha<=0)return!1;const u=l.json["render.compositeMode"];return u&&u!=="source-over"}),a=new Float32Array([1,0,0,0,1,0,0,0,1]);n&&this.commands.push({type:C.PUSH_FBO,transform:a,alpha:1,width:0,height:0,compositeMode:"source-over"});for(const l of t)this.traverseNode(l,s,1);return n&&this.commands.push({type:C.POP_FBO,transform:a,alpha:1,width:0,height:0,compositeMode:"source-over"}),this.commands}traverseNode(t,r,e){if(t.hidden||t.alpha<=0)return;const i=this.buildLocalTransform(t),o=yt(r,i),s=e*t.alpha,n=this.shouldUseFBO(t),a=this.extractFilterParams(t);n&&this.commands.push({type:C.PUSH_FBO,transform:o,alpha:s,width:t.width,height:t.height,compositeMode:t.json["render.compositeMode"]??"source-over",filterParams:a??void 0});const l=n?1:s,u=!t.overflowVisible&&this.hasOverflowContent(t);u&&this.commands.push(this.buildStencilCommand(t,o,l,"push")),this.emitNodeDrawCommands(t,o,l);const c=t.childNodesSortByZIndex;if(c&&c.length>0)for(const h of c)this.traverseNode(h,o,l);u&&this.commands.push(this.buildStencilCommand(t,o,l,"pop")),n&&this.commands.push({type:C.POP_FBO,transform:o,alpha:s,width:t.width,height:t.height,compositeMode:t.json["render.compositeMode"]??"source-over",filterParams:a??void 0})}buildLocalTransform(t){let r=new Float32Array([1,0,0,0,1,0,t.x,t.y,1]);const e=t.json.transform;if(e){const i=Zt(e.a,e.b,e.c,e.d,e.e,e.f);r=yt(r,i)}return r}shouldUseFBO(t){var e;if(t.alpha<1&&((e=t.childNodesSortByZIndex)==null?void 0:e.length)>0)return!0;const r=t.json["render.compositeMode"];return!!(r&&r!=="source-over"||t.json.contentShadowColor&&t.json.contentShadowBlur||this.extractFilterParams(t))}extractFilterParams(t){const r=t.json["render.brightness"],e=t.json["render.contrast"],i=t.json["render.saturation"],o=t.json["render.invert"],s=t.json["render.grey"],n=t.json["render.bw"],a=t.json["render.blurRadius"],l=t.json.contentShadowColor,u=t.json.contentShadowBlur,c=t.json.contentShadowOffset,h=r!=null||e!=null||i!=null||o||s||n||a!=null,g=l&&u;if(h||g){const p={brightness:r??0,contrast:e??0,saturation:i??0,invert:!!o,grey:!!s,bw:!!n,blurRadius:a!=null?a*this.scaleToFitViewport:void 0};return g&&(p.contentShadowColor=l,p.contentShadowBlur=u*this.scaleToFitViewport,c&&(p.contentShadowOffset=c)),p}return null}hasOverflowContent(t){var r;return(((r=t.childNodesSortByZIndex)==null?void 0:r.length)??0)>0}buildStencilCommand(t,r,e,i){const o=t.json.shape;let s="rect",n;if(o==="circular")s="circle";else if(o!=null&&o.startsWith("roundedRect")){s="roundedRect";const a=o.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(a.length===4){const l=gt({values:a,nodeWidth:t.width,nodeHeight:t.height});n=new Float32Array([l.topLeftValue,l.leftTopValue,l.topRightValue,l.rightTopValue,l.bottomRightValue,l.rightBottomValue,l.bottomLeftValue,l.leftBottomValue])}}return{type:i==="push"?C.PUSH_STENCIL:C.POP_STENCIL,transform:r,alpha:e,width:t.width,height:t.height,shapeType:s,shapeParams:n}}emitNodeDrawCommands(t,r,e){this.emitBackground(t,r,e),t instanceof Ft?this.emitImageNode(t,r,e):t instanceof Pt?this.emitLineNode(t,r,e):t instanceof Dt?this.emitTextNode(t,r,e):t instanceof Lt&&this.emitEmbedSceneNode(t,r,e),this.emitForeground(t,r,e)}emitBackground(t,r,e){var l,u;const i=t.json.backgroundColor,o=t.json.backgroundImageId,s=t.json.shape,n=s==="triangle"||!!s&&s.startsWith("polygon");if(n){const c=(l=this.webglNodes)==null?void 0:l.get(t);c instanceof Ot&&this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:c.textureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),o&&this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:`bg_${t.id}_${o}`,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});return}if(i){const c=$(i,e);c&&this.commands.push({type:C.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:this.getNodeShapeType(t),shapeParams:this.getNodeShapeParams(t),fillColor:c,strokeColor:this.getStrokeColor(t,e),strokeWidth:t.borderWidth,shadowColor:this.getShadowColor(t,e),shadowOffset:this.getShadowOffset(t),shadowBlur:this.getShadowBlur(t)})}else if(t.json.shape&&t.json.shape!=="rect"){const c=t.borderWidth>0&&!!t.json.borderColor,h=!!t.json.shapeShadowColor&&!!t.json.shapeShadowBlur;(c||h)&&this.commands.push({type:C.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:this.getNodeShapeType(t),shapeParams:this.getNodeShapeParams(t),fillColor:new Float32Array([0,0,0,0]),strokeColor:this.getStrokeColor(t,e),strokeWidth:t.borderWidth,shadowColor:this.getShadowColor(t,e),shadowOffset:this.getShadowOffset(t),shadowBlur:this.getShadowBlur(t)})}if(o){const c=`bg_${t.id}_${o}`,h=t.json.shape,g=h&&h!=="rect"&&!n;g&&this.commands.push(this.buildStencilCommand(t,r,e,"push")),this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:c,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),g&&this.commands.push(this.buildStencilCommand(t,r,e,"pop"))}const a=(u=this.webglNodes)==null?void 0:u.get(t);if(a!=null&&a.dashBorderTextureKey&&this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:a.dashBorderTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295}),a!=null&&a.outBorderTextureKey){const h=(t.borderOutWidth??0)*2,g=ht(r,-h,-h);this.commands.push({type:C.DRAW_QUAD,transform:g,alpha:e,width:t.width+h*2,height:t.height+h*2,textureId:a.outBorderTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}}emitForeground(t,r,e){const i=t.json.foregroundColor;if(i){const s=$(i,e);s&&this.commands.push({type:C.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:"rect",fillColor:s})}const o=t.json.foregroundImageId;if(o){const s=`fg_${t.id}_${o}`;this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:s,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}}emitImageNode(t,r,e){var l;const i=t.json.imageId;if(!i)return;const o=`img_${t.id}_${i}`,s=t.json.nineSlice,n=(l=this.webglNodes)==null?void 0:l.get(t),a=n instanceof Mt?n:null;if(s&&a){const u=a.computeNineSliceQuads(s);for(const c of u){if(c.drawWidth<=0||c.drawHeight<=0)continue;const h=ht(r,c.drawX,c.drawY);this.commands.push({type:C.DRAW_QUAD,transform:h,alpha:e,width:c.drawWidth,height:c.drawHeight,textureId:o,uvs:c.uvs,color:4294967295})}}else if(s)this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:o,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});else if(a){const{uvs:u,drawX:c,drawY:h,drawWidth:g,drawHeight:p}=a.computeUVs(),_=t.paddingLeft??0,b=t.paddingTop??0,x=_+c,y=b+h,w=x!==0||y!==0?ht(r,x,y):r;this.commands.push({type:C.DRAW_QUAD,transform:w,alpha:e,width:g,height:p,textureId:o,uvs:u,color:4294967295})}else this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:o,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}emitLineNode(t,r,e){var n;const i=t.json.lineColor;if(!i)return;const o=(n=this.webglNodes)==null?void 0:n.get(t),s=o instanceof It?o:null;if(s!=null&&s.isDash)this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:s.dashTextureKey,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295});else{const a=$(i,e);if(!a)return;this.commands.push({type:C.DRAW_SDF_SHAPE,transform:r,alpha:e,width:t.width,height:t.height,shapeType:"rect",fillColor:a})}}emitTextNode(t,r,e){const i=`text_${t.id}`;this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:i,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}emitEmbedSceneNode(t,r,e){const i=`embed_${t.id}`;this.commands.push({type:C.DRAW_QUAD,transform:r,alpha:e,width:t.width,height:t.height,textureId:i,uvs:new Float32Array([0,0,1,0,1,1,0,1]),color:4294967295})}getNodeShapeType(t){const r=t.json.shape;return r==="circular"?"circle":r!=null&&r.startsWith("roundedRect")?"roundedRect":"rect"}getNodeShapeParams(t){const r=t.json.shape;if(r!=null&&r.startsWith("roundedRect")){const e=r.replace(/^roundedRect\(?/,"").replace(/\)$/,"").split(" ").filter(Boolean);if(e.length===4)try{const i=gt({values:e,nodeWidth:t.width,nodeHeight:t.height});return new Float32Array([i.topLeftValue,i.leftTopValue,i.topRightValue,i.rightTopValue,i.bottomRightValue,i.rightBottomValue,i.bottomLeftValue,i.leftBottomValue])}catch{return}}}getStrokeColor(t,r){if(t.borderWidth<=0||t.json.border==="dash")return;const e=t.json.borderColor;if(e)return $(e,r)??void 0}getShadowColor(t,r){const e=t.json.shapeShadowColor;if(e)return $(e,r)??void 0}getShadowOffset(t){const r=t.json.shapeShadowOffset;if(!r)return;const e=String(r).split(",");if(e.length>=2)return new Float32Array([parseFloat(e[0])||0,parseFloat(e[1])||0])}getShadowBlur(t){const r=t.json.shapeShadowBlur;if(r!=null)return typeof r=="number"?r:parseFloat(String(r))||0}}function $(d,t){try{const r=_t(d);if(!r)return null;const e=r.r/255,i=r.g/255,o=r.b/255,s=(r.a??1)*t;return new Float32Array([e*s,i*s,o*s,s])}catch{return null}}function ht(d,t,r){const e=new Float32Array(9);return e[0]=d[0],e[1]=d[1],e[2]=d[2],e[3]=d[3],e[4]=d[4],e[5]=d[5],e[6]=d[0]*t+d[3]*r+d[6],e[7]=d[1]*t+d[4]*r+d[7],e[8]=d[2]*t+d[5]*r+d[8],e}const Z=6,J=4,ct=6,st=4096,ut=8;class te{constructor(t,r){this.currentQuadCount=0,this.activeTextures=new Array(ut).fill(null),this.activeTextureCount=0,this.gl=t,this.program=r;const e=st*J,i=new ArrayBuffer(e*Z*4);this.vertexData=new Float32Array(i),this.uint32View=new Uint32Array(i),this.indexData=new Uint16Array(st*ct);for(let n=0;n<st;n++){const a=n*ct,l=n*J;this.indexData[a+0]=l,this.indexData[a+1]=l+1,this.indexData[a+2]=l+2,this.indexData[a+3]=l,this.indexData[a+4]=l+2,this.indexData[a+5]=l+3}const o=t.createBuffer(),s=t.createBuffer();if(!o||!s)throw new Error("[SpriteBatcher] Failed to create GPU buffers");this.glVertexBuffer=o,this.glIndexBuffer=s,t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,s),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indexData,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,this.vertexData.byteLength,t.DYNAMIC_DRAW),this.attribPosition=t.getAttribLocation(r,"a_position"),this.attribTexCoord=t.getAttribLocation(r,"a_texCoord"),this.attribColor=t.getAttribLocation(r,"a_color"),this.attribTexIndex=t.getAttribLocation(r,"a_texIndex"),this.uProjection=t.getUniformLocation(r,"u_projection"),this.uTextures=t.getUniformLocation(r,"u_textures")}setProjection(t){const r=this.gl;r.useProgram(this.program),r.uniformMatrix4fv(this.uProjection,!1,t)}pushQuad(t,r){this.currentQuadCount>=st&&this.flush();let e=0;if(r!==null){const _=this.activeTextures.indexOf(r);_>=0?e=_:(this.activeTextureCount>=ut&&this.flush(),e=this.activeTextureCount,this.activeTextures[e]=r,this.activeTextureCount++)}const i=t.transform,o=t.width,s=t.height,n=[0,o,o,0],a=[0,0,s,s],l=t.uvs??new Float32Array([0,0,1,0,1,1,0,1]),u=t.color??4294967295,c=Math.round(t.alpha*255),h=u&16777215|c<<24,g=this.currentQuadCount*J,p=Z;for(let _=0;_<4;_++){const b=n[_],x=a[_],y=i[0]*b+i[3]*x+i[6],w=i[1]*b+i[4]*x+i[7],T=(g+_)*p;this.vertexData[T+0]=y,this.vertexData[T+1]=w,this.vertexData[T+2]=l[_*2],this.vertexData[T+3]=l[_*2+1],this.uint32View[T+4]=h,this.vertexData[T+5]=e}this.currentQuadCount++}flush(){if(this.currentQuadCount===0)return;const t=this.gl;t.useProgram(this.program);for(let e=0;e<this.activeTextureCount;e++)t.activeTexture(t.TEXTURE0+e),t.bindTexture(t.TEXTURE_2D,this.activeTextures[e]);if(this.uTextures){const e=Array.from({length:ut},(i,o)=>o);t.uniform1iv(this.uTextures,e)}this.currentQuadCount*J*Z*4,t.bindBuffer(t.ARRAY_BUFFER,this.glVertexBuffer),t.bufferSubData(t.ARRAY_BUFFER,0,this.vertexData.subarray(0,this.currentQuadCount*J*Z));const r=Z*4;t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.glIndexBuffer),this.attribPosition>=0&&(t.enableVertexAttribArray(this.attribPosition),t.vertexAttribPointer(this.attribPosition,2,t.FLOAT,!1,r,0)),this.attribTexCoord>=0&&(t.enableVertexAttribArray(this.attribTexCoord),t.vertexAttribPointer(this.attribTexCoord,2,t.FLOAT,!1,r,8)),this.attribColor>=0&&(t.enableVertexAttribArray(this.attribColor),t.vertexAttribPointer(this.attribColor,4,t.UNSIGNED_BYTE,!0,r,16)),this.attribTexIndex>=0&&(t.enableVertexAttribArray(this.attribTexIndex),t.vertexAttribPointer(this.attribTexIndex,1,t.FLOAT,!1,r,20)),t.drawElements(t.TRIANGLES,this.currentQuadCount*ct,t.UNSIGNED_SHORT,0),this.currentQuadCount=0,this.activeTextureCount=0,this.activeTextures.fill(null)}destroy(){this.gl.deleteBuffer(this.glVertexBuffer),this.gl.deleteBuffer(this.glIndexBuffer)}}const F=class F{constructor(t,r){this.quadCount=0,this.flushCount=0,this.totalQuads=0,this.projectionMatrix=new Float32Array(16),this.projectionDirty=!0,this.stencilMode=0,this.gl=t,this.program=r;const e=F.MAX_QUADS*F.VERTS_PER_QUAD;this.vertexData=new Float32Array(e*F.FLOATS_PER_VERTEX);const i=t.createBuffer();if(!i)throw new Error("[SDFBatcher] Failed to create VBO");this.vbo=i,t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,this.vertexData.byteLength,t.DYNAMIC_DRAW);const o=t.createBuffer();if(!o)throw new Error("[SDFBatcher] Failed to create IBO");this.ibo=o;const s=new Uint16Array(F.MAX_QUADS*F.INDICES_PER_QUAD);for(let n=0;n<F.MAX_QUADS;n++){const a=n*4,l=n*6;s[l+0]=a+0,s[l+1]=a+1,s[l+2]=a+2,s[l+3]=a+0,s[l+4]=a+2,s[l+5]=a+3}t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,o),t.bufferData(t.ELEMENT_ARRAY_BUFFER,s,t.STATIC_DRAW),this.loc={a_position:t.getAttribLocation(r,"a_position"),a_localUV:t.getAttribLocation(r,"a_localUV"),a_size:t.getAttribLocation(r,"a_size"),a_quadSize:t.getAttribLocation(r,"a_quadSize"),a_quadOffset:t.getAttribLocation(r,"a_quadOffset"),a_shapeType:t.getAttribLocation(r,"a_shapeType"),a_strokeWidth:t.getAttribLocation(r,"a_strokeWidth"),a_fillColor:t.getAttribLocation(r,"a_fillColor"),a_strokeColor:t.getAttribLocation(r,"a_strokeColor"),a_shadowColor:t.getAttribLocation(r,"a_shadowColor"),a_shadowOffset:t.getAttribLocation(r,"a_shadowOffset"),a_shadowBlur:t.getAttribLocation(r,"a_shadowBlur"),a_radii_x:t.getAttribLocation(r,"a_radii_x"),a_radii_y:t.getAttribLocation(r,"a_radii_y"),u_projection:t.getUniformLocation(r,"u_projection"),u_stencilMode:t.getUniformLocation(r,"u_stencilMode")}}resetStats(){this.flushCount=0,this.totalQuads=0}setStencilMode(t){this.stencilMode=t}setProjection(t){this.projectionMatrix.set(t),this.projectionDirty=!0}push(t){this.quadCount>=F.MAX_QUADS&&this.flush();const r=t.transform,e=t.width,i=t.height,s={rect:0,roundedRect:1,circle:2}[t.shapeType??"rect"]??0,n=t.shapeParams??F.ZERO_VEC8,a=t.fillColor??F.ZERO_VEC4,l=t.strokeColor??F.ZERO_VEC4,u=t.strokeWidth??0,c=t.shadowColor??F.ZERO_VEC4,h=t.shadowOffset??F.ZERO_VEC2,g=t.shadowBlur??0,p=g>0&&c[3]>0;let _=0,b=0,x=0,y=0;if(p){const O=g*3;_=Math.max(0,-h[0])+O,b=Math.max(0,h[0])+O,x=Math.max(0,-h[1])+O,y=Math.max(0,h[1])+O}const w=e+_+b,T=i+x+y,f=(b-_)/2,v=(y-x)/2,E=-_,R=-x,D=[E,E+w,E+w,E],A=[R,R,R+T,R+T],L=D.map((O,S)=>[r[0]*O+r[3]*A[S]+r[6],r[1]*O+r[4]*A[S]+r[7]]),B=F.FLOATS_PER_VERTEX,M=this.quadCount*F.VERTS_PER_QUAD*B,m=this.vertexData,P=[[0,0],[1,0],[1,1],[0,1]],V=n[0],G=n[1],z=n[2],Q=n[3],it=n[4],kt=n[5],jt=n[6],Vt=n[7];for(let O=0;O<4;O++){const S=M+O*B;m[S+0]=L[O][0],m[S+1]=L[O][1],m[S+2]=P[O][0],m[S+3]=P[O][1],m[S+4]=e,m[S+5]=i,m[S+6]=w,m[S+7]=T,m[S+8]=f,m[S+9]=v,m[S+10]=s,m[S+11]=u,m[S+12]=a[0],m[S+13]=a[1],m[S+14]=a[2],m[S+15]=a[3],m[S+16]=l[0],m[S+17]=l[1],m[S+18]=l[2],m[S+19]=l[3],m[S+20]=c[0],m[S+21]=c[1],m[S+22]=c[2],m[S+23]=c[3],m[S+24]=h[0],m[S+25]=h[1],m[S+26]=g,m[S+27]=V,m[S+28]=z,m[S+29]=it,m[S+30]=jt,m[S+31]=G,m[S+32]=Q,m[S+33]=kt,m[S+34]=Vt}this.quadCount++}flush(){if(this.quadCount===0)return;const t=this.gl;t.useProgram(this.program),this.projectionDirty&&(t.uniformMatrix4fv(this.loc.u_projection,!1,this.projectionMatrix),this.projectionDirty=!1),t.uniform1i(this.loc.u_stencilMode,this.stencilMode);const e=this.quadCount*F.VERTS_PER_QUAD*F.FLOATS_PER_VERTEX;t.bindBuffer(t.ARRAY_BUFFER,this.vbo),t.bufferSubData(t.ARRAY_BUFFER,0,this.vertexData.subarray(0,e)),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.ibo);const i=F.FLOATS_PER_VERTEX*4;this.setAttrib(this.loc.a_position,2,i,0),this.setAttrib(this.loc.a_localUV,2,i,8),this.setAttrib(this.loc.a_size,2,i,16),this.setAttrib(this.loc.a_quadSize,2,i,24),this.setAttrib(this.loc.a_quadOffset,2,i,32),this.setAttrib(this.loc.a_shapeType,1,i,40),this.setAttrib(this.loc.a_strokeWidth,1,i,44),this.setAttrib(this.loc.a_fillColor,4,i,48),this.setAttrib(this.loc.a_strokeColor,4,i,64),this.setAttrib(this.loc.a_shadowColor,4,i,80),this.setAttrib(this.loc.a_shadowOffset,2,i,96),this.setAttrib(this.loc.a_shadowBlur,1,i,104),this.setAttrib(this.loc.a_radii_x,4,i,108),this.setAttrib(this.loc.a_radii_y,4,i,124),t.drawElements(t.TRIANGLES,this.quadCount*F.INDICES_PER_QUAD,t.UNSIGNED_SHORT,0),this.flushCount++,this.quadCount=0}destroy(){this.gl.deleteBuffer(this.vbo),this.gl.deleteBuffer(this.ibo)}setAttrib(t,r,e,i){t<0||(this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,r,this.gl.FLOAT,!1,e,i))}};F.MAX_QUADS=4096,F.FLOATS_PER_VERTEX=35,F.VERTS_PER_QUAD=4,F.INDICES_PER_QUAD=6,F.ZERO_VEC8=new Float32Array(8),F.ZERO_VEC4=new Float32Array(4),F.ZERO_VEC2=new Float32Array(2);let pt=F;class ee{constructor(t,r,e,i,o){this.filterVertexData=new Float32Array(16),this.stencilDepth=0,this.canvasWidth=1,this.canvasHeight=1,this.filterLoc=null,this.filterProjectionDirty=!0,this.gl=t,this.shaderManager=r,this.textureManager=e,this.fboManager=i,this.glState=o,this.batcher=new te(t,r.quadProgram),this.sdfBatcher=new pt(t,r.sdfProgram);const s=t.createBuffer(),n=t.createBuffer();if(!s||!n)throw new Error("[PipelineExecutor] Failed to create filter buffers");this.filterVertexBuffer=s,this.filterIndexBuffer=n,t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,n),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,this.filterVertexData,t.DYNAMIC_DRAW),this.projectionMatrix=new Float32Array(16),this.cacheFilterLocations()}getDrawCallStats(){var t,r;return{sdfFlushes:((t=this.sdfBatcher)==null?void 0:t.flushCount)??0,sdfTotalQuads:((r=this.sdfBatcher)==null?void 0:r.totalQuads)??0}}resetDrawCallStats(){var t;(t=this.sdfBatcher)==null||t.resetStats()}cacheFilterLocations(){const t=this.gl,r=this.shaderManager.filterProgram;this.filterLoc={a_position:t.getAttribLocation(r,"a_position"),a_texCoord:t.getAttribLocation(r,"a_texCoord"),u_projection:t.getUniformLocation(r,"u_projection"),u_texture:t.getUniformLocation(r,"u_texture"),u_brightness:t.getUniformLocation(r,"u_brightness"),u_contrast:t.getUniformLocation(r,"u_contrast"),u_saturation:t.getUniformLocation(r,"u_saturation"),u_invert:t.getUniformLocation(r,"u_invert"),u_grey:t.getUniformLocation(r,"u_grey"),u_bw:t.getUniformLocation(r,"u_bw"),u_alpha:t.getUniformLocation(r,"u_alpha")}}updateProjection(t,r){const e=this.projectionMatrix;e[0]=2/t,e[4]=0,e[8]=0,e[12]=-1,e[1]=0,e[5]=-2/r,e[9]=0,e[13]=1,e[2]=0,e[6]=0,e[10]=1,e[14]=0,e[3]=0,e[7]=0,e[11]=0,e[15]=1,this.canvasWidth=t,this.canvasHeight=r,this.fboManager.setMainSize(t,r),this.batcher.setProjection(this.projectionMatrix),this.sdfBatcher.setProjection(this.projectionMatrix),this.filterProjectionDirty=!0}flushBatchers(){this.batcher.flush(),this.sdfBatcher.flush(),this.glState.invalidateProgram()}execute(t){this.resetDrawCallStats();for(const r of t)switch(r.type){case C.DRAW_QUAD:this.sdfBatcher.flush(),this.glState.invalidateProgram(),this.executeDrawQuad(r);break;case C.DRAW_SDF_SHAPE:this.batcher.flush(),this.glState.invalidateProgram(),this.sdfBatcher.push(r);break;case C.PUSH_FBO:this.flushBatchers(),this.executePushFBO(r);break;case C.POP_FBO:this.flushBatchers(),this.executePopFBO(r);break;case C.PUSH_STENCIL:this.flushBatchers(),this.executePushStencil(r);break;case C.POP_STENCIL:this.flushBatchers(),this.executePopStencil(r);break;case C.SET_BLEND_MODE:this.flushBatchers(),r.blendMode&&this.glState.setBlendMode(r.blendMode);break}this.flushBatchers()}destroy(){this.batcher.destroy(),this.sdfBatcher.destroy(),this.gl.deleteBuffer(this.filterVertexBuffer),this.gl.deleteBuffer(this.filterIndexBuffer)}executeDrawQuad(t){let r=null;t.textureId&&(r=this.textureManager.get(t.textureId)),this.batcher.pushQuad(t,r)}executePushFBO(t){const r=this.fboManager.pushFBO(this.canvasWidth,this.canvasHeight);t._resolvedFboId=r}executePopFBO(t){const r=this.fboManager.popFBO();this.batcher.flush(),this.glState.invalidateProgram();const e=t.compositeMode??"source-over";this.glState.setBlendMode(e);const i=new Float32Array([1,0,0,0,1,0,0,0,1]),o={...t,type:C.DRAW_QUAD,transform:i,width:this.canvasWidth,height:this.canvasHeight,filterParams:t.filterParams??{}},s=o.filterParams;s.contentShadowColor&&s.contentShadowBlur&&this.applyContentShadowPass(r,o),this.applyFilterComposite(r,o),this.glState.setBlendMode("source-over")}applyContentShadowPass(t,r){const e=this.gl,i=r.filterParams,o=i.contentShadowColor,s=i.contentShadowBlur,n=i.contentShadowOffset,a=this.parseColorToVec4(o);if(!a||a[3]<=0)return;let l=0,u=0;if(n){const M=n.split(",");l=parseFloat(M[0])||0,u=parseFloat(M[1])||0}const c=this.canvasWidth,h=this.canvasHeight,g=this.fboManager.pushFBO(c,h),p=this.fboManager.currentTexture(),_=this.shaderManager.shadowProgram;this.glState.useProgram(_),this.glState.enableBlend(!1);const b=e.getUniformLocation(_,"u_projection");e.uniformMatrix4fv(b,!1,this.projectionMatrix);const x=e.getUniformLocation(_,"u_texture");e.uniform1i(x,0);const y=e.getUniformLocation(_,"u_shadowColor");e.uniform4fv(y,a);const w=e.getUniformLocation(_,"u_alpha");e.uniform1f(w,r.alpha),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,t);const T=new Float32Array([0,0,0,1,c,0,1,1,c,h,1,0,0,h,0,0]);e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,T,e.DYNAMIC_DRAW);const f=16,v=e.getAttribLocation(_,"a_position"),E=e.getAttribLocation(_,"a_texCoord");v>=0&&(e.enableVertexAttribArray(v),e.vertexAttribPointer(v,2,e.FLOAT,!1,f,0)),E>=0&&(e.enableVertexAttribArray(E),e.vertexAttribPointer(E,2,e.FLOAT,!1,f,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.fboManager.popFBO(),this.glState.enableBlend(!0);const R=this.applyBlurPasses(p,s);this.glState.setBlendMode("source-over");const D=this.shaderManager.filterProgram;this.glState.useProgram(D);const A=this.filterLoc;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,R),e.uniform1i(A.u_texture,0),e.uniform1f(A.u_brightness,0),e.uniform1f(A.u_contrast,0),e.uniform1f(A.u_saturation,0),e.uniform1f(A.u_invert,0),e.uniform1f(A.u_grey,0),e.uniform1f(A.u_bw,0),e.uniform1f(A.u_alpha,1),this.filterProjectionDirty&&(e.uniformMatrix4fv(A.u_projection,!1,this.projectionMatrix),this.filterProjectionDirty=!1);const L=new Float32Array([l,u,0,1,c+l,u,1,1,c+l,h+u,1,0,l,h+u,0,0]);e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,L,e.DYNAMIC_DRAW),A.a_position>=0&&(e.enableVertexAttribArray(A.a_position),e.vertexAttribPointer(A.a_position,2,e.FLOAT,!1,f,0)),A.a_texCoord>=0&&(e.enableVertexAttribArray(A.a_texCoord),e.vertexAttribPointer(A.a_texCoord,2,e.FLOAT,!1,f,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0);const B=this.fboManager.idMap.get(g);B&&this.fboManager.releaseEntry(B)}parseColorToVec4(t){try{const r=t.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);if(r)return new Float32Array([parseFloat(r[1])/255,parseFloat(r[2])/255,parseFloat(r[3])/255,r[4]!=null?parseFloat(r[4]):1]);const e=t.replace("#","");if(e.length===6||e.length===8){const i=parseInt(e.slice(0,2),16)/255,o=parseInt(e.slice(2,4),16)/255,s=parseInt(e.slice(4,6),16)/255,n=e.length===8?parseInt(e.slice(6,8),16)/255:1;return new Float32Array([i,o,s,n])}}catch{}return null}executePushStencil(t){const r=this.gl;this.stencilDepth++,this.glState.enableStencilTest(!0),r.stencilFunc(r.ALWAYS,this.stencilDepth,255),r.stencilOp(r.KEEP,r.KEEP,r.REPLACE),r.colorMask(!1,!1,!1,!1),this.sdfBatcher.setStencilMode(1),this.sdfBatcher.push({...t,type:C.DRAW_SDF_SHAPE,shapeType:t.shapeType??"rect",fillColor:new Float32Array([1,1,1,1])}),this.sdfBatcher.flush(),this.glState.invalidateProgram(),this.sdfBatcher.setStencilMode(0),r.colorMask(!0,!0,!0,!0),r.stencilFunc(r.EQUAL,this.stencilDepth,255),r.stencilOp(r.KEEP,r.KEEP,r.KEEP)}executePopStencil(t){const r=this.gl;this.stencilDepth=Math.max(0,this.stencilDepth-1),this.stencilDepth===0?(this.glState.enableStencilTest(!1),r.clear(r.STENCIL_BUFFER_BIT)):r.stencilFunc(r.EQUAL,this.stencilDepth,255)}applyFilterComposite(t,r){const e=this.gl,i=r.filterParams,o=i.blurRadius??0;let s=t;o>0&&(s=this.applyBlurPasses(t,o));const n=this.shaderManager.filterProgram;this.glState.useProgram(n);const a=this.filterLoc;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,s),e.uniform1i(a.u_texture,0),e.uniform1f(a.u_brightness,i.brightness??0),e.uniform1f(a.u_contrast,i.contrast??0),e.uniform1f(a.u_saturation,i.saturation??0),e.uniform1f(a.u_invert,i.invert?1:0),e.uniform1f(a.u_grey,i.grey?1:0),e.uniform1f(a.u_bw,i.bw?1:0),e.uniform1f(a.u_alpha,r.alpha),this.filterProjectionDirty&&(e.uniformMatrix4fv(a.u_projection,!1,this.projectionMatrix),this.filterProjectionDirty=!1);const l=r.transform,u=r.width,c=r.height,h=this.filterVertexData;h[0]=l[6],h[1]=l[7],h[2]=0,h[3]=1,h[4]=l[0]*u+l[6],h[5]=l[1]*u+l[7],h[6]=1,h[7]=1,h[8]=l[0]*u+l[3]*c+l[6],h[9]=l[1]*u+l[4]*c+l[7],h[10]=1,h[11]=0,h[12]=l[3]*c+l[6],h[13]=l[4]*c+l[7],h[14]=0,h[15]=0,e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferSubData(e.ARRAY_BUFFER,0,h);const g=16;a.a_position>=0&&(e.enableVertexAttribArray(a.a_position),e.vertexAttribPointer(a.a_position,2,e.FLOAT,!1,g,0)),a.a_texCoord>=0&&(e.enableVertexAttribArray(a.a_texCoord),e.vertexAttribPointer(a.a_texCoord,2,e.FLOAT,!1,g,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0)}applyBlurPasses(t,r){const e=this.gl,i=this.canvasWidth,o=this.canvasHeight,s=this.fboManager.pushFBO(i,o),n=this.fboManager.currentTexture(),a=this.shaderManager.blurProgram;this.glState.useProgram(a);const l=e.getUniformLocation(a,"u_projection");e.uniformMatrix4fv(l,!1,this.projectionMatrix);const u=[0,i,i,0],c=[0,0,o,o],h=[0,1,1,1,1,0,0,0],g=new Float32Array(16);for(let f=0;f<4;f++)g[f*4+0]=u[f],g[f*4+1]=c[f],g[f*4+2]=h[f*2],g[f*4+3]=h[f*2+1];e.bindBuffer(e.ARRAY_BUFFER,this.filterVertexBuffer),e.bufferData(e.ARRAY_BUFFER,g,e.DYNAMIC_DRAW);const p=16,_=e.getAttribLocation(a,"a_position"),b=e.getAttribLocation(a,"a_texCoord");_>=0&&(e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,p,0)),b>=0&&(e.enableVertexAttribArray(b),e.vertexAttribPointer(b,2,e.FLOAT,!1,p,8)),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.filterIndexBuffer),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,t),e.uniform1i(e.getUniformLocation(a,"u_texture"),0),e.uniform2f(e.getUniformLocation(a,"u_delta"),r/i,0),this.glState.enableBlend(!1),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.glState.enableBlend(!0),this.fboManager.popFBO();const x=this.fboManager.pushFBO(i,o),y=this.fboManager.currentTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(e.getUniformLocation(a,"u_texture"),0),e.uniform2f(e.getUniformLocation(a,"u_delta"),0,r/o),this.glState.enableBlend(!1),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),this.glState.enableBlend(!0),this.fboManager.popFBO();const w=this.fboManager.idMap.get(s);w&&this.fboManager.releaseEntry(w);const T=this.fboManager.idMap.get(x);return T&&this.fboManager.releaseEntry(T),y}}class re extends q{constructor(t,r){super(t,r),this.offscreenCanvas=null,this.lastContentSignature="",this.textureKey=`text_${r.id}`}prepare(t){if(!this.dirty)return;const r=this.computeContentSignature();if(r===this.lastContentSignature&&t.get(this.textureKey)){this.dirty=!1;return}const e=this.rasterizeText();if(!e){this.dirty=!1;return}t.update(this.textureKey,e),this.lastContentSignature=r,this.dirty=!1}destroy(){this.offscreenCanvas&&(this.offscreenCanvas.width=0,this.offscreenCanvas.height=0,this.offscreenCanvas=null)}computeContentSignature(){const t=this.node,r=typeof t.text=="string"?t.text:JSON.stringify(t.text),e=this.scene.renderEngine.canvasEl,i=e.offsetWidth>0?e.width/e.offsetWidth:window.devicePixelRatio||1;return[r,t.width,t.height,t.textSize,t.textColor,t.textAlign,t.textVerticalAlign,t.fontWeight,t.italic,t.lineSpacing,t.autoWrap,t.json.fontBorderColor,t.json.fontBorderWidth,t.json.textShadowColor,t.json.textShadowOffset,t.json.textShadowBlur,i].join("|")}getLineSpacingPx(t){const r=this.node.lineSpacing;let e;return typeof r=="string"&&r.endsWith("%")?e=parseInt(r)/100*t:r!=null&&(e=parseInt(String(r))),(e==null||isNaN(e))&&(e=t*.4),e}rasterizeText(){const t=this.node,r=Math.max(1,Math.ceil(t.width)),e=Math.max(1,Math.ceil(t.height)),{canvas:i,ctx:o}=this.createOffscreenCanvas(r,e,this.offscreenCanvas);this.offscreenCanvas=i,o.clearRect(0,0,r,e);const s=t.json.backgroundColor;s&&(o.fillStyle=s,o.fillRect(0,0,r,e));let n=this.parseFontSize(t.textSize,e);const a=[];t.italic&&a.push("italic"),t.fontWeight&&a.push(String(t.fontWeight)),a.push(`${n}px`),a.push("Roboto,Helvetica,Arial,sans-serif"),o.font=a.join(" "),o.fillStyle=t.textColor||"#000000",o.textBaseline="top";const l=t.json.textShadowColor,u=t.json.textShadowBlur,c=t.json.textShadowOffset;if(l&&u&&(o.shadowColor=l,o.shadowBlur=typeof u=="number"?u:parseFloat(String(u))||0,c)){const B=String(c).split(",");o.shadowOffsetX=parseFloat(B[0])||0,o.shadowOffsetY=parseFloat(B[1])||0}const h=t.textAlign;o.textAlign=h==="left"?"left":h==="right"?"right":"center";let g=0;h==="center"?g=r/2:h==="right"&&(g=r);const p=t.textVerticalAlign,_=t.autoReduceTextSize,b=t.autoReduceTextSizeMin||12;if(_&&typeof t.text=="string"&&t.text){const B=t.text.split(`
`),M=Math.max(...B.map(m=>o.measureText(m).width));if(M>r){const m=Math.max(b,n*(r/M));if(m<n){n=m;const P=[];t.italic&&P.push("italic"),t.fontWeight&&P.push(String(t.fontWeight)),P.push(`${n}px`),P.push("Roboto,Helvetica,Arial,sans-serif"),o.font=P.join(" ")}}}const x=t.text;if(Array.isArray(x))return this.renderRichText(o,x,n,r,e,g,h,p,t.json.fontBorderColor,t.json.fontBorderWidth),i;const y=typeof x=="string"?x:String(x),w=this.getLineSpacingPx(n),T=n+w,f=t.autoWrap?this.wrapText(o,y,r):y.split(`
`);o.textBaseline="middle";const v=T*(f.length-1),E=v/2;let R=e/2+n/2;p==="top"?R=n:p==="bottom"?R=e-v:R-=E,R-=n/2;const D=t.json.fontBorderColor,A=t.json.fontBorderWidth,L=!!(D&&A&&A>0);return L&&(o.strokeStyle=D,o.lineWidth=A),f.forEach((B,M)=>{o.fillText(B,g,R+M*T)}),L&&f.forEach((B,M)=>{o.strokeText(B,g,R+M*T)}),i}parseFontSize(t,r){return t?t.endsWith("%")?parseFloat(t)/100*r:parseFloat(t)||16:16}renderRichText(t,r,e,i,o,s,n,a,l,u){var T;const c=[];let h={spans:[],align:void 0};for(const f of r){const v=typeof f=="string"?f:f.text||"",E=typeof f=="object"?f.attributes:void 0,R=v.split(`
`);for(let D=0;D<R.length;D++)D>0&&(h.align=E==null?void 0:E.align,c.push(h),h={spans:[],align:void 0}),R[D]&&h.spans.push({text:R[D],attrs:E})}if(h.spans.length>0||c.length===0){const f=h.spans[h.spans.length-1];h.align=(T=f==null?void 0:f.attrs)==null?void 0:T.align,c.push(h)}const g=f=>{let v=e;return(f==null?void 0:f.size)==="small"?v*=.75:(f==null?void 0:f.size)==="large"?v*=1.5:(f==null?void 0:f.size)==="huge"&&(v*=2.5),v},p=(f,v)=>{const E=[];f!=null&&f.italic&&E.push("italic"),f!=null&&f.bold&&E.push("bold"),E.push(`${v}px`),E.push("Roboto,Helvetica,Arial,sans-serif"),t.font=E.join(" ")},_=this.getLineSpacingPx(e),b=c.map(f=>{let v=0,E=0;const R=[];for(const{text:D,attrs:A}of f.spans){const L=g(A);p(A,L);const B=t.measureText(D).width;R.push(B),v+=B,L>E&&(E=L)}return E===0&&(E=e),{lineWidth:v,maxFontSize:E,spanWidths:R}}),x=b.reduce((f,v)=>f+v.maxFontSize,0)+_*Math.max(0,c.length-1);let y=0;a==="middle"?y=(o-x)/2:a==="bottom"&&(y=o-x),t.textAlign="left",t.textBaseline="middle";let w=y;for(let f=0;f<c.length;f++){const v=c[f],{lineWidth:E,maxFontSize:R,spanWidths:D}=b[f];if(!v.spans.length){w+=R+_;continue}const A=v.align||n;let L=0;A==="center"?L=(i-E)/2:A==="right"&&(L=i-E);let B=L;for(let M=0;M<v.spans.length;M++){const{text:m,attrs:P}=v.spans[M],V=g(P);p(P,V);const G=D[M],z=w+R-V/2;P!=null&&P.background&&(t.fillStyle=P.background,t.fillRect(B,w,G,R));const Q=(P==null?void 0:P.color)||this.node.textColor||"#000000";if(t.fillStyle=Q,t.fillText(m,B,z),l&&u&&u>0&&(t.strokeStyle=l,t.lineWidth=u,t.strokeText(m,B,z)),P!=null&&P.strike&&(t.strokeStyle=Q,t.lineWidth=V/12,t.beginPath(),t.moveTo(B,z),t.lineTo(B+G,z),t.stroke()),P!=null&&P.underline){t.strokeStyle=Q,t.lineWidth=V/12,t.beginPath();const it=w+R-V*.1;t.moveTo(B,it),t.lineTo(B+G,it),t.stroke()}B+=G}w+=R+_}}wrapText(t,r,e){const i=[],o=r.split(`
`);for(const s of o){if(t.measureText(s).width<=e){i.push(s);continue}let n="";for(const a of s){const l=n+a;t.measureText(l).width>e&&n.length>0?(i.push(n),n=a):n=l}n&&i.push(n)}return i}}class ie extends q{constructor(t,r){super(t,r)}}class oe extends q{constructor(t,r){super(t,r),this.textureKey=`embed_${r.id}`}prepare(t){const r=this.node.embedRenderEngine;if(!r)return;r.doRender(0);const e=r.canvasEl;!e||e.width===0||e.height===0||(this.dirty?(t.update(this.textureKey,e),this.dirty=!1):t.get(this.textureKey)||t.getOrCreate(this.textureKey,e))}destroy(){}}class se extends Ht{constructor(){super(...arguments),this.gl=null,this.offscreenGLCanvas=null,this.shaderManager=null,this.textureManager=null,this.fboManager=null,this.glState=null,this.traverser=null,this.executor=null,this.webglNodes=new WeakMap,this.glInitialized=!1,this._canvasBgImage=void 0,this._canvasBgTextureKey="__scene_canvas_bg__"}doRenderImpl(t){this.glInitialized||this.initWebGL();const r=this.gl,e=this.offscreenGLCanvas;(e.width!==t.width||e.height!==t.height)&&(e.width=t.width,e.height=t.height,r.viewport(0,0,e.width,e.height)),this.executor.updateProjection(e.width,e.height),this.glState.reset(),this.glState.initDefaults();const i=this.viewportBackgroundColor,o=_t(i);if(o){const f=o.a??1;r.clearColor(o.r/255,o.g/255,o.b/255,f)}else r.clearColor(0,0,0,1);r.disable(r.SCISSOR_TEST),r.clear(r.COLOR_BUFFER_BIT|r.STENCIL_BUFFER_BIT);const s=this.viewportWidth,n=this.viewportHeight,a=Math.min(e.width/s,e.height/n),l=(e.width/a-s)/2-this.viewportX,u=(e.height/a-n)/2-this.viewportY,c=Math.round((l+this.viewportX)*a),h=Math.round((u+this.viewportY)*a),g=Math.round(s*a),p=Math.round(n*a),_=e.height-h-p;r.enable(r.SCISSOR_TEST),r.scissor(c,_,g,p);const b=this.canvasBackgroundColor;if(b){const f=_t(b);if(f){const v=f.a??1;r.clearColor(f.r/255,f.g/255,f.b/255,v),r.clear(r.COLOR_BUFFER_BIT)}}const x=this.canvasBackgroundImageId;if(x){if(this._canvasBgImage=this.loadImageForRender(x,this._canvasBgImage),this._canvasBgImage){const f=this._canvasBgTextureKey;if(!this.textureManager.get(f)){const E=this._rasterizeBgImageIfNeeded(this._canvasBgImage,this.sceneWidth,this.sceneHeight);if(!E)return;this.textureManager.getOrCreate(f,E)}const v=this.traverser.traverseCanvasBackground(f,a,l,u,this.sceneWidth,this.sceneHeight);this.executor.execute(v)}}else this.textureManager.get(this._canvasBgTextureKey)&&this.textureManager.delete(this._canvasBgTextureKey),this._canvasBgImage=void 0;const y=this.childNodesSortByZIndex;for(const f of y)this.prepareNode(f);const w=this.traverser.traverse(y,this.webglNodes,a,l,u);this.executor.execute(w),window.__sdfStats=this.executor.getDrawCallStats(),r.disable(r.SCISSOR_TEST),r.flush();const T=t.getContext("2d");T&&(T.clearRect(0,0,t.width,t.height),T.drawImage(e,0,0))}toWebGLNode(t){let r=this.webglNodes.get(t);if(!r){r=this.createWebGLNode(t);const e=r;t.onRequestReRender(()=>e.markDirty()),t.onDestroy(()=>e.destroy()),this.webglNodes.set(t,r)}return r}async callRenderMethod(t){const r=t.nodeId&&this.getNode(t.nodeId),e=r&&this.toWebGLNode(r);return e&&typeof e[t.methodName]=="function"?e[t.methodName](...t.methodArgs||[]):super.callRenderMethod(t)}onNodeAdded(t){this.toWebGLNode(t)}onNodeDataUpdated(t){var r;(r=this.webglNodes.get(t))==null||r.markDirty()}destroyWebGL(){this.executor&&(this.executor.destroy(),this.executor=null),this.shaderManager&&(this.shaderManager.destroy(),this.shaderManager=null),this.textureManager&&(this.textureManager.destroy(),this.textureManager=null),this.fboManager&&(this.fboManager.destroy(),this.fboManager=null),this.gl=null,this.offscreenGLCanvas=null,this.glInitialized=!1}initWebGL(){const t=document.createElement("canvas");t.width=1,t.height=1;let r=null;try{r=t.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,stencil:!0,preserveDrawingBuffer:!0})}catch{}if(r||(r=t.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!1,stencil:!0,preserveDrawingBuffer:!0}),r&&r.getExtension("OES_standard_derivatives")),!r)throw new Error("[RenderSceneWebGL] WebGL is not supported in this environment");this.offscreenGLCanvas=t,this.gl=r,this.shaderManager=new Yt(r),this.textureManager=new Kt(r),this.fboManager=new Qt(r),this.glState=new $t(r),this.traverser=new Jt,this.executor=new ee(r,this.shaderManager,this.textureManager,this.fboManager,this.glState),this.glState.initDefaults(),this.glInitialized=!0,this.onDestroy(()=>this.destroyWebGL())}_rasterizeBgImageIfNeeded(t,r,e){var s;if(t.tagName==="CANVAS")return t;const i=t,o=this.imageRender.getImageResMeta(i);if((o==null?void 0:o.mimeTypeFull)==="image/svg+xml"){const n=this.imageRender.getSvgRasterizedCanvas(i);if(!n)return null;const a=Math.ceil(r),l=Math.ceil(e);if(n.width<a||n.height<l){const u=document.createElement("canvas");return u.width=a,u.height=l,(s=u.getContext("2d"))==null||s.drawImage(i,0,0,a,l),u}return n}return i}prepareNode(t){if(t.hidden)return;this.toWebGLNode(t).prepare(this.textureManager);const e=t.childNodesSortByZIndex;if(e)for(const i of e)this.prepareNode(i)}createWebGLNode(t){var r;if(t instanceof Ft)return new Mt(this,t);if(t instanceof Dt)return new re(this,t);if(t instanceof qt)return new ie(this,t);if(t instanceof Lt)return new oe(this,t);if(t instanceof Pt)return new It(this,t);{const e=(r=t.json)==null?void 0:r.shape;return e==="triangle"||e&&e.startsWith("polygon")?new Ot(this,t):new q(this,t)}}}const rt="perf-main";function I(d,t){return d+Math.random()*(t-d)}function lt(d,t){return Math.floor(I(d,t+1))}const wt=["#7c6aef","#a78bfa","#60a5fa","#4ade80","#facc15","#f87171","#fb923c","#e879f9","#38bdf8","#34d399","#f472b6","#818cf8"];function X(){return wt[lt(0,wt.length-1)]}function Nt(){const d=["rect","circular","roundedRect(8 8 8 8)","roundedRect(16 4 16 4)","roundedRect(20 20 20 20)"];return d[lt(0,d.length-1)]}function ae(d,t,r){const e=Math.ceil(Math.sqrt(d*(t/r))),i=Math.ceil(d/e),o=t/e,s=r/i,n=3,a=[];for(let l=0;l<d;l++){const u=l%e,c=Math.floor(l/e),h=X();a.push({id:`rect-${l}`,type:"basic",attrs:{id:`rect-${l}`,x:u*o+n,y:c*s+n,width:o-n*2,height:s-n*2,shape:"roundedRect(4 4 4 4)",backgroundColor:h,border:"line",borderWidth:1,borderColor:"rgba(255,255,255,0.25)",overflowVisible:!0},childNodes:[]})}return{id:rt,attrs:{width:t,height:r,viewportX:0,viewportY:0,viewportWidth:t,viewportHeight:r,backgroundColor:"#111827",viewportBackgroundColor:"#0a0a14"},childNodes:a,resourceIds:[]}}function ne(d,t,r){const e=[],i=[],o=Math.max(12,Math.min(40,Math.floor(Math.sqrt(t*r/d)*.6)));for(let s=0;s<d;s++){const n=I(0,t-o),a=I(0,r-o),l=X(),u=Nt();e.push({id:`anim-${s}`,x:n,y:a,vx:I(-2,2)||.5,vy:I(-2,2)||.5,angle:I(0,Math.PI*2),va:I(-.05,.05),scale:1,vs:I(-.005,.005)}),i.push({id:`anim-${s}`,type:"basic",attrs:{id:`anim-${s}`,x:n,y:a,width:o,height:o,shape:u,backgroundColor:l,overflowVisible:!0},childNodes:[]})}return{scene:{id:rt,attrs:{width:t,height:r,viewportX:0,viewportY:0,viewportWidth:t,viewportHeight:r,backgroundColor:"#111827",viewportBackgroundColor:"#0a0a14"},childNodes:i,resourceIds:[]},states:e}}function le(d,t,r,e){for(const i of d)i.x+=i.vx,i.y+=i.vy,i.angle+=i.va,i.scale+=i.vs,(i.x<0||i.x>t-e)&&(i.vx=-i.vx,i.x=Math.max(0,Math.min(i.x,t-e))),(i.y<0||i.y>r-e)&&(i.vy=-i.vy,i.y=Math.max(0,Math.min(i.y,r-e))),(i.scale<.5||i.scale>1.5)&&(i.vs=-i.vs)}function he(d,t,r){const e=[],i=Math.floor(d/3);for(let n=0;n<i;n++){const a=I(20,60),l=X();e.push({id:`mixed-shape-${n}`,type:"basic",attrs:{id:`mixed-shape-${n}`,x:I(0,t-a),y:I(0,r-a),width:a,height:a,shape:Nt(),backgroundColor:l,border:"line",borderWidth:1.5,borderColor:"rgba(255,255,255,0.3)",shapeShadowColor:l+"88",shapeShadowBlur:8,shapeShadowOffset:"0 3",overflowVisible:!0},childNodes:[]})}const o=["Hello","WebGL","Canvas","1Game","Render","FPS","Node","Scene","Draw","Batch"];for(let n=0;n<i;n++){const a=X();e.push({id:`mixed-text-${n}`,type:"text",attrs:{id:`mixed-text-${n}`,x:I(0,t-80),y:I(0,r-24),width:80,height:24,text:o[n%o.length],textSize:String(lt(12,20)),textColor:a,textAlign:"left",textVerticalAlign:"middle",overflowVisible:!0},childNodes:[]})}const s=d-i*2;for(let n=0;n<s;n++){const a=I(6,20),l=X();e.push({id:`mixed-circle-${n}`,type:"basic",attrs:{id:`mixed-circle-${n}`,x:I(0,t-a*2),y:I(0,r-a*2),width:a*2,height:a*2,shape:"circular",backgroundColor:l,overflowVisible:!0},childNodes:[]})}return{id:rt,attrs:{width:t,height:r,viewportX:0,viewportY:0,viewportWidth:t,viewportHeight:r,backgroundColor:"#111827",viewportBackgroundColor:"#0a0a14"},childNodes:e,resourceIds:[]}}const St=["Hello World","Canvas 2D","WebGL Render","性能测试","1GameEngine","FPS Counter","Draw Call","Batch Render","Scene Graph","Node Tree","Texture Cache","Shader Program","Vertex Buffer","Fragment Shader","requestAnimationFrame","devicePixelRatio","OffscreenCanvas"];function ce(d,t,r){const e=[],i=Math.ceil(Math.sqrt(d*(t/r))),o=Math.ceil(d/i),s=t/i,n=r/o;for(let a=0;a<d;a++){const l=a%i,u=Math.floor(a/i),c=X(),h=lt(10,16);e.push({id:`text-${a}`,type:"text",attrs:{id:`text-${a}`,x:l*s+2,y:u*n+2,width:s-4,height:n-4,text:St[a%St.length],textSize:String(h),textColor:c,textAlign:"center",textVerticalAlign:"middle",overflowVisible:!0},childNodes:[]})}return{id:rt,attrs:{width:t,height:r,viewportX:0,viewportY:0,viewportWidth:t,viewportHeight:r,backgroundColor:"#111827",viewportBackgroundColor:"#0a0a14"},childNodes:e,resourceIds:[]}}const nt=document.getElementById("renderCanvas"),ue=document.getElementById("fpsChart"),vt=document.getElementById("btnCanvas"),xt=document.getElementById("btnWebGL"),Et=document.getElementById("backendLabel"),at=document.getElementById("backendBadge"),Ct=document.getElementById("chartLabel"),At=document.getElementById("sceneSelect"),mt=document.getElementById("nodeCount"),de=document.getElementById("nodeCountDisplay"),dt=document.getElementById("animBtn"),fe=document.getElementById("resetBtn"),Tt=document.getElementById("statFps"),ge=document.getElementById("statRenderMs"),_e=document.getElementById("statP95"),Rt=120;class pe{constructor(){this.frameTimes=[],this.renderTimes=[],this.lastTime=0,this.fps=0,this.avgRenderTime=0,this.p95RenderTime=0}tick(t){if(this.lastTime>0){const r=t-this.lastTime;this.frameTimes.push(r),this.frameTimes.length>Rt&&this.frameTimes.shift();const e=this.frameTimes.reduce((i,o)=>i+o,0);this.fps=1e3/(e/this.frameTimes.length)}this.lastTime=t}recordRenderTime(t){this.renderTimes.push(t),this.renderTimes.length>Rt&&this.renderTimes.shift();const r=this.renderTimes.length;if(r===0)return;this.avgRenderTime=this.renderTimes.reduce((i,o)=>i+o,0)/r;const e=[...this.renderTimes].sort((i,o)=>i-o);this.p95RenderTime=e[Math.min(Math.floor(r*.95),r-1)]}reset(){this.frameTimes=[],this.renderTimes=[],this.lastTime=0,this.fps=0,this.avgRenderTime=0,this.p95RenderTime=0}}class ve{constructor(t){this.canvas=t,this.history=[],this.maxPoints=200,this._color="#60a5fa"}setColor(t){this._color=t}push(t){this.history.push(t),this.history.length>this.maxPoints&&this.history.shift(),this.draw()}draw(){const t=window.devicePixelRatio||1,r=this.canvas.offsetWidth,e=this.canvas.offsetHeight;this.canvas.width=Math.floor(r*t),this.canvas.height=Math.floor(e*t);const i=this.canvas.getContext("2d");if(!i)return;i.scale(t,t),i.clearRect(0,0,r,e);const o=e-60/70*e;if(i.strokeStyle="rgba(255,255,255,0.08)",i.lineWidth=1,i.setLineDash([4,4]),i.beginPath(),i.moveTo(0,o),i.lineTo(r,o),i.stroke(),i.setLineDash([]),this.history.length<2)return;const s=i.createLinearGradient(0,0,0,e);s.addColorStop(0,this._color+"55"),s.addColorStop(1,this._color+"00"),i.fillStyle=s,i.beginPath(),i.moveTo(0,e);for(let n=0;n<this.history.length;n++){const a=n/(this.maxPoints-1)*r,l=e-Math.min(this.history[n]/70,1)*e;i.lineTo(a,l)}i.lineTo((this.history.length-1)/(this.maxPoints-1)*r,e),i.closePath(),i.fill(),i.strokeStyle=this._color,i.lineWidth=1.5,i.lineJoin="round",i.beginPath();for(let n=0;n<this.history.length;n++){const a=n/(this.maxPoints-1)*r,l=e-Math.min(this.history[n]/70,1)*e;n===0?i.moveTo(a,l):i.lineTo(a,l)}i.stroke()}reset(){this.history=[],this.draw()}}let W="canvas",j="rects",U=200,tt=!0,N=null,H=null,Y=[],Ut=20,bt=0;const k=new pe,et=new ve(ue);function xe(){const d=nt.parentElement.getBoundingClientRect();return{w:Math.floor(d.width),h:Math.floor(d.height)}}function me(d){return d>=55?"fps-good":d>=30?"fps-ok":"fps-bad"}function be(){cancelAnimationFrame(bt),N==null||N.destroy(),N=null,H=null,Y=[],k.reset()}function ye(d,t,r,e){switch(Y=[],Ut=Math.max(12,Math.min(40,Math.floor(Math.sqrt(r*e/t)*.6))),d){case"rects":return ae(t,r,e);case"animated":{const i=ne(t,r,e);return Y=i.states,i.scene}case"mixed":return he(t,r,e);case"text":return ce(t,r,e)}}function K(d,t,r){W=d,j=t,U=r,be();const{w:e,h:i}=xe(),o=window.devicePixelRatio||1;nt.width=Math.floor(e*o),nt.height=Math.floor(i*o);const s=ye(t,r,e,i);H=new Gt,H.editData(a=>{a.scenes.push(s)}),N=new zt({canvas:nt,loadResource:async()=>null,loadResourceMeta:async()=>null,renderData:H,newSceneRender:(a,l)=>d==="canvas"?new Xt(a,{sceneId:l}):new se(a,{sceneId:l})}),N.onEveryRenderStart(a=>{k.tick(a)});const n=N.doRender.bind(N);N.doRender=a=>{const l=performance.now();n(a),k.recordRenderTime(performance.now()-l)},Se(t,e,i)}let ft=0;const we=6;function Se(d,t,r){const e=()=>{bt=requestAnimationFrame(e),tt&&d==="animated"&&Y.length>0&&(le(Y,t,r,Ut),H==null||H.editData(i=>{const o=i.scenes.find(s=>s.id===rt);if(o)for(const s of Y){const n=o.childNodes.find(a=>a.id===s.id);n&&(n.attrs.x=s.x,n.attrs.y=s.y)}})),ft++,ft>=we&&(ft=0,Ee())};bt=requestAnimationFrame(e)}function Ee(){const d=k.fps;Tt.textContent=d>0?d.toFixed(1):"--",Tt.className=`stat-value ${me(d)}`,ge.textContent=k.avgRenderTime>0?k.avgRenderTime.toFixed(1):"--",_e.textContent=k.p95RenderTime>0?k.p95RenderTime.toFixed(1):"--",d>0&&et.push(d)}function Wt(d){W=d,et.reset(),d==="canvas"?(vt.className="backend-btn active-canvas",xt.className="backend-btn",Et.textContent="Canvas 2D",at.textContent="Canvas",at.className="badge badge-canvas",Ct.textContent="Canvas 2D — FPS 历史",et.setColor("#60a5fa")):(vt.className="backend-btn",xt.className="backend-btn active-webgl",Et.textContent="WebGL",at.textContent="WebGL",at.className="badge badge-webgl",Ct.textContent="WebGL — FPS 历史",et.setColor("#4ade80")),K(d,j,U)}vt.addEventListener("click",()=>{W!=="canvas"&&Wt("canvas")});xt.addEventListener("click",()=>{W!=="webgl"&&Wt("webgl")});At.addEventListener("change",()=>{j=At.value,K(W,j,U)});mt.addEventListener("input",()=>{U=parseInt(mt.value,10),de.textContent=String(U)});mt.addEventListener("change",()=>{K(W,j,U)});dt.addEventListener("click",()=>{tt=!tt,dt.textContent=`动画：${tt?"开":"关"}`,dt.classList.toggle("active",tt)});fe.addEventListener("click",()=>{et.reset(),K(W,j,U)});let Bt=0;window.addEventListener("resize",()=>{clearTimeout(Bt),Bt=window.setTimeout(()=>{K(W,j,U)},200)});K(W,j,U);
