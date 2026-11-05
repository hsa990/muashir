import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { currentScore, useStore } from '../store/useStore'

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

/** Slow noise over a night sky. The horizon glow moves from teal to ember with the score. */
const FRAGMENT = `precision mediump float;
uniform vec2 res;uniform float time,heat;
float hash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/res;
  float flow=fbm(vec2(uv.x*2.6+time*.05,uv.y*2.2-time*.035)+fbm(uv*3.+time*.03));
  vec3 night=vec3(.106,.071,.051);
  vec3 cool=vec3(.098,.639,.604),warm=vec3(.886,.639,.231),ember=vec3(.878,.325,.184);
  vec3 hot=heat<.55?mix(cool,warm,heat/.55):mix(warm,ember,(heat-.55)/.45);
  float glow=smoothstep(.78,.02,uv.y)*(.25+.95*flow)*(.3+.7*heat);
  gl_FragColor=vec4(night+hot*glow*.72,1.);
}`

const liveScore = () => (currentScore(useStore.getState()) ?? 0) / 100

/** Native WebGL with no library. If it is unavailable, the plain night colour shows instead. */
export function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!canvas || !gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uniforms = {
      res: gl.getUniformLocation(program, 'res'),
      time: gl.getUniformLocation(program, 'time'),
      heat: gl.getUniformLocation(program, 'heat'),
    }

    let frame = 0
    let onScreen = true
    let heat = liveScore()

    const draw = (time: number) => {
      heat += (liveScore() - heat) * 0.04
      gl.uniform1f(uniforms.time, time / 1000)
      gl.uniform1f(uniforms.heat, heat)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const step = (time: number) => {
      draw(time)
      frame = requestAnimationFrame(step)
    }
    const sync = () => {
      const visible = onScreen && !document.hidden && !reduce && window.scrollY < window.innerHeight * 1.05
      if (visible && !frame) frame = requestAnimationFrame(step)
      if (!visible && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }
    // Half resolution is plenty for a soft glow, and keeps phones cool.
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth / 2))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight / 2))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniforms.res, canvas.width, canvas.height)
      draw(performance.now())
    }

    const resizer = new ResizeObserver(resize)
    resizer.observe(canvas)
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    watcher.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('scroll', sync, { passive: true })
    resize()
    sync()

    return () => {
      cancelAnimationFrame(frame)
      resizer.disconnect()
      watcher.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('scroll', sync)
    }
  }, [reduce])

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full" />
}
