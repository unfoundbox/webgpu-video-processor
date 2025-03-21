export const videoFrameShader = {
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

      @fragment
      fn main(
        @location(0) texCoord: vec2f
      ) -> @location(0) vec4f {
        return textureSample(videoTexture, videoSampler, texCoord);
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
      
      in vec2 vTexCoord;
      out vec4 fragColor;
      
      void main() {
        fragColor = texture(videoTexture, vTexCoord);
      }
    `
  }
}; 