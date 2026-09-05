import { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect

/* ════════════════════════════════════════════════════════════
   SoftMaskReveal — Figma-style blurred mask reveal

   HOW THE SOFT EDGE IS ACHIEVED
   No clip-path, no border-radius. The overlay is an SVG <rect> wearing an
   SVG <mask>. The mask is built as:

       white rect (show overlay everywhere)
       + the uploaded SVG painted as a BLACK silhouette (punch a hole)
       + feGaussianBlur on that silhouette only

   Blurring the silhouette turns the hole's edge into a smooth black→white
   luminance ramp, so the overlay fades out gradually — the same feathering
   Figma's Layer Blur produces. The VIDEO is never blurred; only the edge of
   the reveal is.

   NO FIRST-PAINT FLASH
   Two things used to make the video appear unmasked for a moment:
     1. the SVG overlay waited on ResizeObserver, which fires AFTER first paint
     2. the uploaded SVG is an external file that must download before the
        silhouette (the hole) can be drawn
   So the component now starts COVERED: the size is measured in a layout effect
   (synchronously, before paint), a solid overlay paints immediately, and it
   crossfades to the masked version only once the SVG has actually loaded.
   The reveal opens up out of the overlay instead of the video flashing bare
   and then being covered.
   ════════════════════════════════════════════════════════════ */

export default function SoftMaskReveal(props: any) {
    const {
        videoFile = "",
        svgFile = "",

        blurRadius = 120,
        maskScale = 1,
        positionX = 0,
        positionY = 0,
        rotation = 0,

        overlayColor = "#111111",
        overlayOpacity = 100,

        objectFit = "cover",
        revealFade = 0.35,

        posterColor = "#000000",
    } = props

    const onCanvas = RenderTarget.current() === RenderTarget.canvas

    /* unique ids so multiple instances never collide */
    const uid = useMemo(
        () => "smr" + Math.random().toString(36).slice(2, 9),
        []
    )
    const maskId = `${uid}-mask`
    const filterId = `${uid}-blur`

    /* Measure in a LAYOUT effect: runs before the browser paints, so the very
       first frame already knows the box and can draw the overlay. */
    const rootRef = useRef<HTMLDivElement>(null)
    const [box, setBox] = useState({ w: 0, h: 0 })
    useIso(() => {
        const el = rootRef.current
        if (!el) return
        const measure = () => {
            const r = el.getBoundingClientRect()
            const w = Math.round(r.width)
            const h = Math.round(r.height)
            setBox((p) => (p.w === w && p.h === h ? p : { w, h }))
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    /* Preload the SVG so the hole never pops in late. No file → nothing to
       wait for (the fallback ellipse is inline and instant). */
    const [svgReady, setSvgReady] = useState(!svgFile)
    useEffect(() => {
        if (!svgFile) {
            setSvgReady(true)
            return
        }
        setSvgReady(false)
        let alive = true
        const img = new Image()
        img.onload = () => {
            if (alive) setSvgReady(true)
        }
        // even on error, stop covering — better to show the video than a blank
        img.onerror = () => {
            if (alive) setSvgReady(true)
        }
        img.src = svgFile
        return () => {
            alive = false
        }
    }, [svgFile])

    const W = box.w
    const H = box.h
    const measured = W > 2 && H > 2
    const revealed = measured && svgReady

    /* base box for the mask artwork: a square on the container's short side,
       so Mask Scale = 1 means "fits the frame" regardless of aspect ratio */
    const base = Math.min(W, H) || 1

    /* CSS blur(Npx) ≈ stdDeviation N, but Figma's Layer Blur reads about half
       as strong for the same number — /2 makes the slider feel like Figma's. */
    const std = Math.max(0, blurRadius) / 2

    const cx = W / 2 + positionX
    const cy = H / 2 + positionY
    const shapeTransform = [
        `translate(${cx} ${cy})`,
        `rotate(${rotation})`,
        `scale(${Math.max(0.01, maskScale)})`,
        `translate(${-base / 2} ${-base / 2})`,
    ].join(" ")

    const op = Math.max(0, Math.min(100, overlayOpacity)) / 100
    const fade = Math.max(0, revealFade)

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: posterColor,
                isolation: "isolate",
            }}
        >
            {/* VIDEO — never blurred, never masked */}
            {videoFile ? (
                <video
                    key={videoFile}
                    src={videoFile}
                    autoPlay={!onCanvas}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: objectFit as any,
                        display: "block",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {/* OVERLAY + MASK — sits under the cover layer below */}
            {measured && (
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "block",
                        pointerEvents: "none",
                    }}
                    aria-hidden="true"
                >
                    <defs>
                        {/* any artwork → black silhouette (alpha preserved) → blurred */}
                        <filter
                            id={filterId}
                            x="-100%"
                            y="-100%"
                            width="300%"
                            height="300%"
                            filterUnits="objectBoundingBox"
                            colorInterpolationFilters="sRGB"
                        >
                            <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 1 0"
                                result="silhouette"
                            />
                            <feGaussianBlur
                                in="silhouette"
                                stdDeviation={std}
                            />
                        </filter>

                        {/* white = keep overlay · black = punch through to video */}
                        <mask
                            id={maskId}
                            maskUnits="userSpaceOnUse"
                            x={-W}
                            y={-H}
                            width={W * 3}
                            height={H * 3}
                        >
                            <rect
                                x={-W}
                                y={-H}
                                width={W * 3}
                                height={H * 3}
                                fill="#ffffff"
                            />
                            <g
                                filter={`url(#${filterId})`}
                                transform={shapeTransform}
                            >
                                {svgFile ? (
                                    <image
                                        href={svgFile}
                                        xlinkHref={svgFile}
                                        x={0}
                                        y={0}
                                        width={base}
                                        height={base}
                                        preserveAspectRatio="xMidYMid meet"
                                    />
                                ) : (
                                    /* fallback shape until an SVG is uploaded */
                                    <ellipse
                                        cx={base / 2}
                                        cy={base / 2}
                                        rx={base * 0.34}
                                        ry={base * 0.34}
                                        fill="#000000"
                                    />
                                )}
                            </g>
                        </mask>
                    </defs>

                    <rect
                        x={0}
                        y={0}
                        width={W}
                        height={H}
                        fill={overlayColor}
                        opacity={op}
                        mask={`url(#${maskId})`}
                    />
                </svg>
            )}

            {/* COVER LAYER — paints on frame 1 so the video is never bare.
                Fades away once the box is measured AND the SVG has loaded, so
                the hole opens out of the overlay instead of snapping in. */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    background: overlayColor,
                    opacity: revealed ? 0 : op,
                    transition: `opacity ${fade}s cubic-bezier(.2,.9,.25,1)`,
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}

/* ════════════════════════════════════════════════════════════
   PROPERTY CONTROLS
   ════════════════════════════════════════════════════════════ */
addPropertyControls(SoftMaskReveal, {
    videoFile: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov", "m4v"],
    },
    svgFile: {
        type: ControlType.File,
        title: "SVG Mask",
        allowedFileTypes: ["svg"],
        description: "Any SVG — its shape is used, its colours are ignored",
    },

    blurRadius: {
        type: ControlType.Number,
        title: "Blur Radius",
        min: 0,
        max: 300,
        step: 1,
        unit: "px",
        defaultValue: 120,
        displayStepper: false,
    },

    maskScale: {
        type: ControlType.Number,
        title: "Mask Scale",
        min: 0.2,
        max: 5,
        step: 0.01,
        defaultValue: 1,
        displayStepper: false,
    },

    positionX: {
        type: ControlType.Number,
        title: "X Position",
        min: -1000,
        max: 1000,
        step: 1,
        unit: "px",
        defaultValue: 0,
        displayStepper: false,
    },
    positionY: {
        type: ControlType.Number,
        title: "Y Position",
        min: -1000,
        max: 1000,
        step: 1,
        unit: "px",
        defaultValue: 0,
        displayStepper: false,
    },

    rotation: {
        type: ControlType.Number,
        title: "Rotation",
        min: 0,
        max: 360,
        step: 1,
        unit: "°",
        defaultValue: 0,
        displayStepper: false,
    },

    overlayColor: {
        type: ControlType.Color,
        title: "Overlay Color",
        defaultValue: "#111111",
    },
    overlayOpacity: {
        type: ControlType.Number,
        title: "Overlay Opacity",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        defaultValue: 100,
        displayStepper: false,
    },

    objectFit: {
        type: ControlType.Enum,
        title: "Object Fit",
        options: ["cover", "contain", "fill"],
        optionTitles: ["Cover", "Contain", "Fill"],
        defaultValue: "cover",
    },

    revealFade: {
        type: ControlType.Number,
        title: "Reveal Fade",
        min: 0,
        max: 2,
        step: 0.05,
        unit: "s",
        defaultValue: 0.35,
        displayStepper: false,
        description: "How the mask eases in on load",
    },

    posterColor: {
        type: ControlType.Color,
        title: "Backdrop",
        defaultValue: "#000000",
        description: "Shows before the video loads",
    },
})
