export const colorAdjustShader = {
  webgpu: {
    vertex: `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) texCoord: vec2f,
      }

      @vertex
      fn main(
        @location(0) position: vec2f,
        @location(1) texCoord: vec2f,
      ) -> VertexOutput {
        var output: VertexOutput;
        output.position = vec4f(position, 0.0, 1.0);
        output.texCoord = texCoord;
        return output;
      }
    `,
    fragment: `
      @binding(0) @group(0) var videoSampler: sampler;
      @binding(1) @group(0) var videoTexture: texture_2d<f32>;
      
      struct ColorAdjustments {
        brightness: f32,
        contrast: f32,
        saturation: f32,
      }
      @binding(2) @group(0) var<uniform> adjustments: ColorAdjustments;

      fn rgb2hsv(rgb: vec3f) -> vec3f {
        let K = vec4f(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        let p = mix(vec4f(rgb.bg, K.wz), vec4f(rgb.gb, K.xy), step(rgb.b, rgb.g));
        let q = mix(vec4f(p.xyw, rgb.r), vec4f(rgb.r, p.yzx), step(p.x, rgb.r));
        let d = q.x - min(q.w, q.y);
        let e = 1.0e-10;
        return vec3f(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      fn hsv2rgb(hsv: vec3f) -> vec3f {
        let K = vec4f(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        let p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
        return hsv.z * mix(K.xxx, clamp(p - K.xxx, vec3f(0.0), vec3f(1.0)), hsv.y);
      }

      @fragment
      fn main(
        @location(0) texCoord: vec2f
      ) -> @location(0) vec4f {
        let color = textureSample(videoTexture, videoSampler, texCoord);
        var rgb = color.rgb;
        
        // Apply brightness
        rgb = rgb * (1.0 + adjustments.brightness);
        
        // Apply contrast
        rgb = (rgb - 0.5) * adjustments.contrast + 0.5;
        
        // Apply saturation
        let hsv = rgb2hsv(rgb);
        let adjustedHsv = vec3f(hsv.x, hsv.y * adjustments.saturation, hsv.z);
        rgb = hsv2rgb(adjustedHsv);
        
        return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), color.a);
      }
    `
  },
  webgl2: {
    vertex: `#version 300 es
      layout(location = 0) in vec2 position;
      layout(location = 1) in vec2 texCoord;
      
      out vec2 vTexCoord;
      
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = texCoord;
      }
    `,
    fragment: `#version 300 es
      precision highp float;
      
      uniform sampler2D videoTexture;
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      
      in vec2 vTexCoord;
      out vec4 fragColor;
      
      vec3 rgb2hsv(vec3 rgb) {
        float Cmax = max(max(rgb.r, rgb.g), rgb.b);
        float Cmin = min(min(rgb.r, rgb.g), rgb.b);
        float delta = Cmax - Cmin;
        
        vec3 hsv = vec3(0.0, 0.0, Cmax);
        
        if (delta != 0.0) {
          if (Cmax == rgb.r) {
            hsv.x = mod((rgb.g - rgb.b) / delta, 6.0) / 6.0;
          } else if (Cmax == rgb.g) {
            hsv.x = ((rgb.b - rgb.r) / delta + 2.0) / 6.0;
          } else {
            hsv.x = ((rgb.r - rgb.g) / delta + 4.0) / 6.0;
          }
          
          hsv.y = delta / Cmax;
        }
        
        return hsv;
      }
      
      vec3 hsv2rgb(vec3 hsv) {
        float h = hsv.x * 6.0;
        float s = hsv.y;
        float v = hsv.z;
        
        vec3 rgb = vec3(v);
        
        if (s != 0.0) {
          float i = floor(h);
          float f = h - i;
          float p = v * (1.0 - s);
          float q = v * (1.0 - s * f);
          float t = v * (1.0 - s * (1.0 - f));
          
          if (i == 0.0) rgb = vec3(v, t, p);
          else if (i == 1.0) rgb = vec3(q, v, p);
          else if (i == 2.0) rgb = vec3(p, v, t);
          else if (i == 3.0) rgb = vec3(p, q, v);
          else if (i == 4.0) rgb = vec3(t, p, v);
          else rgb = vec3(v, p, q);
        }
        
        return rgb;
      }
      
      void main() {
        vec4 color = texture(videoTexture, vTexCoord);
        vec3 rgb = color.rgb;
        
        // Apply brightness
        rgb *= (1.0 + brightness);
        
        // Apply contrast
        rgb = (rgb - 0.5) * contrast + 0.5;
        
        // Apply saturation
        vec3 hsv = rgb2hsv(rgb);
        vec3 adjustedHsv = vec3(hsv.x, hsv.y * saturation, hsv.z);
        rgb = hsv2rgb(adjustedHsv);
        
        fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
      }
    `
  }
}; 