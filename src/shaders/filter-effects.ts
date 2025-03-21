export const filterEffectsShader = {
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
      
      struct FilterParams {
        filterType: i32,    // 0: none, 1: grayscale, 2: sepia, 3: invert
        intensity: f32,     // Filter intensity (0.0 - 1.0)
      }
      @binding(2) @group(0) var<uniform> params: FilterParams;

      fn grayscale(color: vec3f) -> vec3f {
        let luminance = dot(color, vec3f(0.299, 0.587, 0.114));
        return mix(color, vec3f(luminance), params.intensity);
      }

      fn sepia(color: vec3f) -> vec3f {
        let sepia = vec3f(
          dot(color, vec3f(0.393, 0.769, 0.189)),
          dot(color, vec3f(0.349, 0.686, 0.168)),
          dot(color, vec3f(0.272, 0.534, 0.131))
        );
        return mix(color, sepia, params.intensity);
      }

      fn invert(color: vec3f) -> vec3f {
        return mix(color, 1.0 - color, params.intensity);
      }

      @fragment
      fn main(
        @location(0) texCoord: vec2f
      ) -> @location(0) vec4f {
        let color = textureSample(videoTexture, videoSampler, texCoord);
        var rgb = color.rgb;
        
        switch(params.filterType) {
          case 1: {
            rgb = grayscale(rgb);
          }
          case 2: {
            rgb = sepia(rgb);
          }
          case 3: {
            rgb = invert(rgb);
          }
          default: {
            // No filter
          }
        }
        
        return vec4f(rgb, color.a);
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
      uniform int filterType;      // 0: none, 1: grayscale, 2: sepia, 3: invert
      uniform float intensity;     // Filter intensity (0.0 - 1.0)
      
      in vec2 vTexCoord;
      out vec4 fragColor;
      
      vec3 grayscale(vec3 color) {
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        return mix(color, vec3(luminance), intensity);
      }
      
      vec3 sepia(vec3 color) {
        vec3 sepia = vec3(
          dot(color, vec3(0.393, 0.769, 0.189)),
          dot(color, vec3(0.349, 0.686, 0.168)),
          dot(color, vec3(0.272, 0.534, 0.131))
        );
        return mix(color, sepia, intensity);
      }
      
      vec3 invert(vec3 color) {
        return mix(color, 1.0 - color, intensity);
      }
      
      void main() {
        vec4 color = texture(videoTexture, vTexCoord);
        vec3 rgb = color.rgb;
        
        if (filterType == 1) {
          rgb = grayscale(rgb);
        } else if (filterType == 2) {
          rgb = sepia(rgb);
        } else if (filterType == 3) {
          rgb = invert(rgb);
        }
        
        fragColor = vec4(rgb, color.a);
      }
    `
  }
}; 