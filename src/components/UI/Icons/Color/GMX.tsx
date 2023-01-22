import * as React from "react"

const GMXIcon = (props: any) => (
  <svg
    width={42}
    height={32}
    viewBox="0 0 42 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_463_115)">
      <mask
        id="mask0_463_115"
        style={{
          maskType: "luminance",
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={42}
        height={32}
      >
        <path d="M41.2203 0H0V32H41.2203V0Z" fill="white" />
      </mask>
      <g mask="url(#mask0_463_115)">
        <path
          d="M39.1264 29.8711L20.6872 2.16943L2.19104 29.8711H27.9598L20.6872 19.2982L17.0796 24.7912H13.243L20.687 13.7461L31.4529 29.8711H39.1264Z"
          fill="url(#paint0_linear_463_115)"
        />
      </g>
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_463_115"
        x1={21.9884}
        y1={2.88968}
        x2={9.88907}
        y2={32.8189}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#03D1CF" stopOpacity={0.988} />
        <stop offset={1} stopColor="#4E09F8" />
      </linearGradient>
      <clipPath id="clip0_463_115">
        <rect width={41.2203} height={32} fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export default GMXIcon
